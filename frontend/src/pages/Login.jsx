import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api.js";
import { getAdminProfile } from "../utils/adminProfile.js";
import { getStudentProfile } from "../utils/studentProfile.js";

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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const mergedUser = getMergedUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(mergedUser));
      window.dispatchEvent(new Event("user-updated"));
      setStatus({ type: "success", message: "Login successful." });
      const redirectPath = new URLSearchParams(location.search).get("redirect");

      if (redirectPath) {
        navigate(redirectPath);
      } else if (mergedUser.role === "admin") {
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
          Access Portal
        </div>
        <h1 className="mt-3 font-display text-3xl">Sign in securely</h1>
        <p className="mt-2 text-ink-soft">
          Admins manage uploads, students verify and download certificates.
        </p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
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
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-accent-dark transition hover:text-accent"
            >
              Forgot password?
            </Link>
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
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <Link
              to="/signup"
              className="rounded-full border border-[#f0d7c1] bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
            >
              Create Account
            </Link>
          </div>
        </form>
      </div>
      <div className="rounded-3xl bg-ink p-7 text-white">
        <div className="text-xs uppercase tracking-[0.2em] text-[#c7d4ef]">
          Platform Access
        </div>
        <h2 className="mt-3 font-display text-2xl">
          Secure access for certificate management and verification.
        </h2>
        <div className="mt-5 space-y-4 text-sm text-[#c7d4ef]">
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="font-semibold text-white">Admin Dashboard</div>
            <p className="mt-2">
              Manage student records, upload data, and generate certificates.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="font-semibold text-white">Certificate Verification</div>
            <p className="mt-2">
              Verify issued certificates and access printable records quickly.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="font-semibold text-white">Protected Sessions</div>
            <p className="mt-2">
              Role-based access keeps admin actions and certificate data secure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
