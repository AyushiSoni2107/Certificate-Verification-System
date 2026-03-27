import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../utils/api.js";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setStatus({ type: "error", message: "Reset token is missing." });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setStatus({
        type: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    setLoading(true);
    setStatus({ type: "idle", message: "" });

    try {
      const data = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          newPassword: form.newPassword,
        }),
      });

      setStatus({
        type: "success",
        message: data.message || "Password updated successfully.",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
      <div className="rounded-3xl border border-[#f1e2d2] bg-white p-7 shadow-[0_12px_24px_rgba(15,27,45,0.08)]">
        <div className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          Reset Password
        </div>
        <h1 className="mt-3 font-display text-3xl">Create a new password</h1>
        <p className="mt-2 text-ink-soft">
          Use the secure reset link to choose a new password for your account.
        </p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-semibold" htmlFor="new-password">
              New Password
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e8d4c2] bg-white px-4 py-3">
              <input
                id="new-password"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="rounded-full border border-[#f0d7c1] px-3 py-1 text-xs font-semibold text-ink transition hover:-translate-y-0.5"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="confirm-password">
              Confirm Password
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e8d4c2] bg-white px-4 py-3">
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="rounded-full border border-[#f0d7c1] px-3 py-1 text-xs font-semibold text-ink transition hover:-translate-y-0.5"
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
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
              {loading ? "Updating..." : "Update Password"}
            </button>
            <Link
              to="/login"
              className="rounded-full border border-[#f0d7c1] bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>

      <div className="rounded-3xl bg-ink p-7 text-white">
        <div className="text-xs uppercase tracking-[0.2em] text-[#c7d4ef]">
          Security checklist
        </div>
        <h2 className="mt-3 font-display text-2xl">
          Keep your account protected after the reset.
        </h2>
        <div className="mt-5 space-y-4 text-sm text-[#c7d4ef]">
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="font-semibold text-white">Use a strong password</div>
            <p className="mt-2">
              Pick a password you have not used anywhere else.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="font-semibold text-white">Reset links expire</div>
            <p className="mt-2">
              If the link is too old, request a fresh one from the login page.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="font-semibold text-white">One-time tokens</div>
            <p className="mt-2">
              Once a reset is completed, the token cannot be used again.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
