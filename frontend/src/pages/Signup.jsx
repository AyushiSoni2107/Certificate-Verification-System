import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api.js";
import { getAdminProfile, saveAdminProfile } from "../utils/adminProfile.js";
import { getStudentProfile, saveStudentProfile } from "../utils/studentProfile.js";

const getMergedUser = (user) => {
  if (!user) {
    return user;
  }

  const storedProfile =
    user.role === "admin" ? getAdminProfile(user) : getStudentProfile(user);

  return {
    ...user,
    name:
      user.role === "admin"
        ? storedProfile.adminName || user.name
        : storedProfile.studentName || user.name,
    email: storedProfile.email || user.email,
    avatar: storedProfile.profilePhoto || user.avatar || "",
  };
};

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [avatar, setAvatar] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });
    try {
      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        avatar,
      };
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const baseUser = data.user;

      if (baseUser.role === "admin") {
        saveAdminProfile(baseUser, {
          adminName: baseUser.name,
          email: baseUser.email,
          phone: "",
          profilePhoto: baseUser.avatar || "",
          role: "Admin",
        });
      } else {
        saveStudentProfile(baseUser, {
          studentName: baseUser.name,
          email: baseUser.email,
          profilePhoto: baseUser.avatar || "",
          phone: "",
          role: "Student",
        });
      }

      const mergedUser = getMergedUser(baseUser);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(mergedUser));
      window.dispatchEvent(new Event("user-updated"));
      setStatus({ type: "success", message: "Account created successfully." });
      if (mergedUser.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
      <div className="rounded-3xl border border-[#f1e2d2] bg-white p-7 shadow-[0_12px_24px_rgba(15,27,45,0.08)]">
        <div className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          Create Account
        </div>
        <h1 className="mt-3 font-display text-3xl">Sign up for CertiFlow</h1>
        <p className="mt-2 text-ink-soft">
          {form.role === "admin"
            ? "Create an admin account to upload student data and manage certificates."
            : "Create a student account to verify and access certificates securely."}
        </p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#f0d7c1] bg-[#f9f4ec] p-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-white shadow-md">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-xl">
                  👤
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">
                {form.role === "admin" ? "Upload admin logo or photo" : "Upload avatar"}
              </div>
              <p className="text-xs text-ink-soft">
                {form.role === "admin"
                  ? "Optional image for the admin header and profile."
                  : "Optional profile photo for your account."}
              </p>
            </div>
            <label className="cursor-pointer rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5">
              Choose File
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <label className="text-sm font-semibold">Full Name</label>
            <input
              type="text"
              placeholder="Riya Sharma"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-[#e8d4c2] bg-white px-4 py-3"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              placeholder="you@certiflow.com"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-[#e8d4c2] bg-white px-4 py-3"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Role</label>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {[
                ["student", "Student", "Verify and download certificates."],
                ["admin", "Admin", "Upload data and manage records."],
              ].map(([value, label, helper]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, role: value }))
                  }
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    form.role === value
                      ? "border-ink bg-ink text-white"
                      : "border-[#e8d4c2] bg-white text-ink"
                  }`}
                >
                  <div className="text-sm font-semibold">{label}</div>
                  <div
                    className={`text-xs ${
                      form.role === value ? "text-white/80" : "text-ink-soft"
                    }`}
                  >
                    {helper}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Password</label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e8d4c2] bg-white px-4 py-3">
              <span className="text-lg">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="rounded-full border border-[#f0d7c1] px-3 py-1 text-xs font-semibold text-ink transition hover:-translate-y-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Confirm Password</label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e8d4c2] bg-white px-4 py-3">
              <span className="text-lg">🔒</span>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="rounded-full border border-[#f0d7c1] px-3 py-1 text-xs font-semibold text-ink transition hover:-translate-y-0.5"
                aria-label={
                  showConfirm ? "Hide confirm password" : "Show confirm password"
                }
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {status.message ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                status.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {status.message}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
            <Link
              to="/login"
              className="rounded-full border border-[#f0d7c1] bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
            >
              Already have an account
            </Link>
          </div>
        </form>
      </div>
      <div className="rounded-3xl bg-ink p-7 text-white">
        <div className="text-xs uppercase tracking-[0.2em] text-[#c7d4ef]">
          {form.role === "admin" ? "Admin Access" : "Student Access"}
        </div>
        <h2 className="mt-3 font-display text-2xl">
          {form.role === "admin"
            ? "Create your admin account to manage certificates securely."
            : "Create your student account to verify certificates securely."}
        </h2>
        <div className="mt-5 space-y-4 text-sm text-[#c7d4ef]">
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="font-semibold text-white">
              {form.role === "admin" ? "Admin Dashboard" : "Certificate Access"}
            </div>
            <p className="mt-2">
              {form.role === "admin"
                ? "Admins can upload student data, generate certificates, and manage records."
                : "Students can search certificate IDs and open verified certificate pages."}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="font-semibold text-white">
              {form.role === "admin" ? "Profile & Branding" : "Verification"}
            </div>
            <p className="mt-2">
              {form.role === "admin"
                ? "Your saved admin photo and account details appear in the header and profile."
                : "Students can verify certificate details and access downloadable copies."}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="font-semibold text-white">Secure Authentication</div>
            <p className="mt-2">
              Account access is protected with secure login and controlled permissions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
