import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });
    setResetUrl("");

    try {
      const data = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setStatus({
        type: "success",
        message: data.message || "Reset link generated successfully.",
      });
      setResetUrl(data.resetUrl || "");
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!resetUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(resetUrl);
      setStatus({
        type: "success",
        message: "Reset link copied to clipboard.",
      });
    } catch {
      setStatus({
        type: "error",
        message: "Could not copy the reset link. Please copy it manually.",
      });
    }
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
      <div className="rounded-3xl border border-[#f1e2d2] bg-white p-7 shadow-[0_12px_24px_rgba(15,27,45,0.08)]">
        <div className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          Password Recovery
        </div>
        <h1 className="mt-3 font-display text-3xl">Forgot your password?</h1>
        <p className="mt-2 text-ink-soft">
          Enter your account email and we’ll generate a secure reset link.
        </p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-semibold" htmlFor="forgot-email">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              placeholder="you@certiflow.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e8d4c2] bg-white px-4 py-3"
              required
            />
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
              {loading ? "Generating..." : "Generate reset link"}
            </button>
            <Link
              to="/login"
              className="rounded-full border border-[#f0d7c1] bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
            >
              Back to Login
            </Link>
          </div>
        </form>

        {resetUrl ? (
          <div className="mt-6 rounded-2xl border border-[#f0d7c1] bg-[#f9f4ec] p-5">
            <div className="font-semibold text-ink">Reset link ready</div>
            <p className="mt-2 text-sm text-ink-soft">
              Open the link below to set a new password.
            </p>
            <a
              href={resetUrl}
              className="mt-3 block break-all rounded-xl border border-[#e8d4c2] bg-white px-4 py-3 text-sm font-medium text-accent-dark"
            >
              {resetUrl}
            </a>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href={resetUrl}
                className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Open Reset Page
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-full border border-[#f0d7c1] bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
              >
                Copy Link
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl bg-ink p-7 text-white">
        <div className="text-xs uppercase tracking-[0.2em] text-[#c7d4ef]">
          Secure reset flow
        </div>
        <h2 className="mt-3 font-display text-2xl">
          Reset access without exposing your password.
        </h2>
        <div className="mt-5 space-y-4 text-sm text-[#c7d4ef]">
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="font-semibold text-white">Token-based link</div>
            <p className="mt-2">
              Every reset request creates a unique, time-limited token.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="font-semibold text-white">One-time use</div>
            <p className="mt-2">
              Once the password is updated, the reset link becomes invalid.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="font-semibold text-white">Ready for email delivery</div>
            <p className="mt-2">
              The same backend flow can later send links by email without changing
              the UI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
