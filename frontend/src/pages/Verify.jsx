import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { apiRequest } from "../utils/api.js";

const EMPTY_CERTIFICATE = {
  studentName: "Unknown Student",
  course: "Pending Verification",
  startDate: "--",
  endDate: "--",
  certificateId: "UNKNOWN",
};

export default function Verify() {
  const [certificateId, setCertificateId] = useState("");
  const [resultId, setResultId] = useState("UNKNOWN");
  const [status, setStatus] = useState("Ready");
  const [activeCertificate, setActiveCertificate] = useState(EMPTY_CERTIFICATE);
  const [loading, setLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = certificateId.trim().toUpperCase();

    if (!trimmed) {
      setResultId("UNKNOWN");
      setActiveCertificate(EMPTY_CERTIFICATE);
      setStatus("Not Found");
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
      setStatus("Verified");
    } catch {
      setActiveCertificate({
        ...EMPTY_CERTIFICATE,
        certificateId: trimmed,
      });
      setStatus("Not Found");
    } finally {
      setLoading(false);
    }
  };

  const isVerified = status === "Verified";

  useEffect(() => {
    const buildQrCode = async () => {
      if (!isVerified || !resultId || resultId === "UNKNOWN") {
        setQrCodeDataUrl("");
        return;
      }

      const appOrigin = import.meta.env.VITE_APP_URL || window.location.origin;
      const verifyUrl = `${appOrigin}/certificate/${resultId}`;

      try {
        const dataUrl = await QRCode.toDataURL(verifyUrl, {
          margin: 1,
          width: 160,
          color: {
            dark: "#ffffff",
            light: "#0f1b2d",
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch {
        setQrCodeDataUrl("");
      }
    };

    buildQrCode();
  }, [isVerified, resultId]);

  return (
    <section className="rounded-[32px] bg-white p-8 shadow-hero">
      <div>
        <h1 className="font-display text-3xl">
          Student Certificate Verification
        </h1>
        <p className="mt-2 text-ink-soft">
          Enter your Certificate ID to view and download the certificate
          instantly.
        </p>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <form
          className="flex flex-col gap-3 rounded-2xl border border-[#f0d7c1] bg-[#f9f4ec] p-6"
          onSubmit={handleSubmit}
        >
          <label className="font-semibold" htmlFor="certificate-id">
            Certificate ID
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              id="certificate-id"
              name="certificate-id"
              type="text"
              placeholder="e.g., CERT-2026-61B551"
              autoComplete="off"
              value={certificateId}
              onChange={(event) => setCertificateId(event.target.value)}
              required
              className="min-w-[180px] flex-1 rounded-xl border border-[#e8d4c2] bg-white px-4 py-3"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,106,61,0.3)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          <div className="text-xs text-ink-soft">
            Tip: Your certificate ID is in the internship confirmation mail.
          </div>
        </form>
        <div className="flex flex-col gap-4 rounded-2xl bg-ink p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Certificate Snapshot</div>
            <div className="rounded-full bg-[#1f2f47] px-3 py-1 text-xs text-[#c7d4ef]">
              {loading ? "Searching" : status}
            </div>
          </div>
          <div className="space-y-3">
            {[
              ["Student", activeCertificate.studentName],
              ["Course", activeCertificate.course],
              [
                "Duration",
                `${activeCertificate.startDate} - ${activeCertificate.endDate}`,
              ],
              ["Certificate ID", resultId],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-white/10 pb-2 last:border-none"
              >
                <span>{label}</span>
                <strong className={label === "Certificate ID" ? "font-mono" : ""}>
                  {value}
                </strong>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              className="rounded-full border border-[#f0d7c1] bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={!isVerified}
              onClick={() => navigate(`/certificate/${resultId}`)}
            >
              View Certificate
            </button>
            <button
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,106,61,0.3)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={!isVerified}
              onClick={() => navigate(`/certificate/${resultId}`)}
            >
              Download
            </button>
          </div>
          {isVerified ? (
            <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[#c7d4ef]">
                Scan to verify
              </div>
              <div className="mt-3 flex items-center gap-4">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`QR code for certificate ${resultId}`}
                    className="h-24 w-24 rounded-2xl bg-white p-2"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 text-xs text-[#c7d4ef]">
                    Generating...
                  </div>
                )}
                <div className="text-sm text-[#e8eefb]">
                  <div className="font-semibold">Open the verification page</div>
                  <div className="mt-1 break-all text-xs text-[#c7d4ef]">
                    {`${import.meta.env.VITE_APP_URL || window.location.origin}/certificate/${resultId}`}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
