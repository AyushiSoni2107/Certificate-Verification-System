import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils/api.js";

const EMPTY_CERTIFICATE = {
  studentName: "Not Found",
  course: "Unknown",
  startDate: "--",
  endDate: "--",
  certificateId: "UNKNOWN",
};

export default function Home() {
  const [certificateId, setCertificateId] = useState("");
  const [resultId, setResultId] = useState("UNKNOWN");
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState(EMPTY_CERTIFICATE);

  const handleSearch = async (event) => {
    event.preventDefault();
    const trimmed = certificateId.trim().toUpperCase();

    if (!trimmed) {
      setResultId("UNKNOWN");
      setActiveCertificate(EMPTY_CERTIFICATE);
      setStatus("Invalid");
      return;
    }

    setLoading(true);
    setResultId(trimmed);

    try {
      const data = await apiRequest(`/api/certificates/${trimmed}`);
      setActiveCertificate({
        studentName: data.studentName || "Unknown Student",
        course: data.course || "Not provided",
        startDate: data.startDate || "--",
        endDate: data.endDate || "--",
        certificateId: data.certificateId || trimmed,
      });
      setStatus("Valid");
    } catch {
      setActiveCertificate({
        ...EMPTY_CERTIFICATE,
        certificateId: trimmed,
      });
      setStatus("Invalid");
    } finally {
      setLoading(false);
    }
  };

  const isValid = status === "Valid";
  const certificateRedirectPath = `/certificate/${resultId}`;
  const certificateLoginPath = `/login?redirect=${encodeURIComponent(
    certificateRedirectPath
  )}`;

  return (
    <>
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <div className="inline-flex rounded-full border border-[#f2dcc3] bg-white px-4 py-2 text-xs font-semibold">
            Secure Digital Certificate Management System
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Generate, verify, and download certificates in minutes.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            A secure digital platform for managing, verifying, and downloading
            certificates with ease.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/verify"
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,106,61,0.3)] transition hover:-translate-y-0.5"
            >
              Verify Certificate
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-[#f0d7c1] bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
            >
              Login
            </Link>
          </div>
          <form
            className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-[#f0d7c1] bg-[#f9f4ec] p-4"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Enter Certificate ID"
              value={certificateId}
              onChange={(event) => setCertificateId(event.target.value)}
              className="min-w-[180px] flex-1 rounded-xl border border-[#e8d4c2] bg-white px-4 py-3"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-hero">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-sky/30 to-transparent"></div>
          <div className="relative z-10 flex items-center gap-2 font-semibold">
            <span className="h-2 w-2 rounded-full bg-mint shadow-[0_0_0_4px_rgba(0,184,148,0.15)]"></span>
            Live Certificate Preview
          </div>
          <div className="relative z-10 mt-5 rounded-2xl border border-[#f4dec7] bg-gradient-to-br from-[#fdf6eb] to-white p-5">
            <div className="inline-flex rounded-full bg-[#ffe0d2] px-3 py-1 text-xs font-semibold text-accent-dark">
              Certificate Preview
            </div>
            <h2 className="mt-3 font-display text-2xl">
              {activeCertificate.studentName}
            </h2>
            <p className="mt-1 text-xs text-ink-soft">
              Certificate ID: <span className="font-mono">{resultId}</span>
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["Course", activeCertificate.course],
                ["Issued By", "CertiFlow Admin"],
                ["Start Date", activeCertificate.startDate],
                ["End Date", activeCertificate.endDate],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                    {label}
                  </div>
                  <div className="font-semibold">{value}</div>
                </div>
              ))}
            </div>
            <Link
              to={isValid ? certificateLoginPath : "#"}
              className={`mt-4 block w-full rounded-full px-4 py-3 text-center text-sm font-semibold text-white transition ${
                isValid
                  ? "bg-ink hover:-translate-y-0.5"
                  : "pointer-events-none bg-ink/40"
              }`}
            >
              View Certificate
            </Link>
          </div>
        </div>
      </section>

      <section id="how" className="mt-14">
        <div>
          <h2 className="font-display text-3xl md:text-4xl">How It Works</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft md:text-base">
            A simple, secure workflow for admins and students.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["1", "Upload Data", "Admin uploads student data via Excel."],
            ["2", "Generate Certificate", "System auto-generates certificates."],
            ["3", "Search Certificate", "Students search using certificate ID."],
            ["4", "Download Certificate", "Verified PDF is ready to download."],
          ].map(([step, title, copy]) => (
            <div
              key={step}
              className="group relative overflow-hidden rounded-[26px] border border-[#eadbcb] bg-[linear-gradient(145deg,#fffdf9_0%,#fff6ee_100%)] p-4 shadow-[0_14px_32px_rgba(15,27,45,0.08)] transition hover:-translate-y-1 sm:p-5"
            >
              <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(255,166,122,0.22)_0%,_rgba(255,166,122,0)_72%)] opacity-80 transition group-hover:scale-110" />
              <div className="relative flex items-start gap-3 sm:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink font-display text-lg text-white shadow-[0_12px_24px_rgba(15,27,45,0.18)] sm:h-12 sm:w-12">
                  {step}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[#7b8ba3]">
                    Step {step}
                  </div>
                  <h3 className="mt-1 text-base font-semibold leading-snug text-ink sm:text-lg">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    {copy}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="mt-14">
        <div className="rounded-3xl border border-[#f1e2d2] bg-white p-8 shadow-[0_12px_24px_rgba(15,27,45,0.08)]">
          <h2 className="font-display text-3xl">About the Platform</h2>
          <p className="mt-3 text-ink-soft">
            This platform allows organizations to generate, manage, and verify
            digital certificates securely. Students can easily access and
            download their certificates anytime using their certificate ID.
          </p>
        </div>
      </section>

      <section className="mt-14 rounded-3xl bg-ink p-8 text-white">
        <div className="text-xs uppercase tracking-[0.2em] text-[#c7d4ef]">
          Admin Access
        </div>
        <h2 className="mt-3 font-display text-3xl">
          Need to generate certificates for your students?
        </h2>
        <Link
          to="/login"
          className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
        >
          Login
        </Link>
      </section>
    </>
  );
}
