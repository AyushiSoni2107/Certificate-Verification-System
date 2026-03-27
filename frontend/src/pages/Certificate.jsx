import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { apiRequest } from "../utils/api.js";
import { getAdminProfile } from "../utils/adminProfile.js";
import { downloadCertificatePdf } from "../utils/certificatePdf.js";

const buildStudentAnalyticsKey = (user) =>
  `studentAnalytics:${user?.id || user?.email || "default"}`;
const buildStudentDownloadsKey = (user) =>
  `studentDownloads:${user?.id || user?.email || "default"}`;

const resolveVerifyUrl = (certificate, appOrigin) => {
  const fallbackUrl = `${appOrigin}/certificate/${certificate.certificateId}`;
  const storedUrl = String(certificate?.certificateUrl || "").trim();

  if (!storedUrl) {
    return fallbackUrl;
  }

  try {
    const parsedUrl = new URL(storedUrl);
    const isLocalhost =
      parsedUrl.hostname === "localhost" ||
      parsedUrl.hostname === "127.0.0.1" ||
      parsedUrl.hostname === "::1";

    return isLocalhost ? fallbackUrl : parsedUrl.toString();
  } catch {
    return fallbackUrl;
  }
};

export default function Certificate() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [adminProfile, setAdminProfile] = useState({});
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const hasAutoDownloaded = useRef(false);

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        const data = await apiRequest(`/api/certificates/${id}`);
        setCertificate(data);
        setStatus({ loading: false, error: "" });
      } catch (error) {
        setStatus({ loading: false, error: error.message });
      }
    };

    loadCertificate();
  }, [id]);

  useEffect(() => {
    const buildQrCode = async () => {
      if (!certificate) {
        setQrCodeDataUrl("");
        return;
      }

      const appOrigin = import.meta.env.VITE_APP_URL || window.location.origin;
      const verifyUrl = resolveVerifyUrl(certificate, appOrigin);

      try {
        const dataUrl = await QRCode.toDataURL(verifyUrl, {
          margin: 1,
          width: 160,
          color: {
            dark: "#0f1b2d",
            light: "#FFF8F1",
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch {
        setQrCodeDataUrl("");
      }
    };

    buildQrCode();
  }, [certificate]);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
      setAdminProfile(getAdminProfile(storedUser));
    } catch {
      setUser(null);
      setAdminProfile({});
    }
  }, []);

  const handleDownload = async () => {
    if (!certificate) {
      return;
    }

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate(
        `/login?redirect=${encodeURIComponent(`/certificate/${certificate.certificateId}?download=1`)}`
      );
      return;
    }

    await downloadCertificatePdf(certificate, adminProfile);

    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser?.role === "student") {
        const currentAnalytics =
          JSON.parse(localStorage.getItem(buildStudentAnalyticsKey(parsedUser))) || {};
        localStorage.setItem(
          buildStudentAnalyticsKey(parsedUser),
          JSON.stringify({
            ...currentAnalytics,
            totalDownloads: (currentAnalytics.totalDownloads || 0) + 1,
          })
        );

        const currentDownloads =
          JSON.parse(localStorage.getItem(buildStudentDownloadsKey(parsedUser))) || [];
        const nextDownload = {
          certificateId: certificate.certificateId,
          studentName: certificate.studentName,
          course: certificate.course,
          issueDate: certificate.issuedAt,
          downloadedAt: new Date().toISOString(),
        };
        const filteredDownloads = currentDownloads.filter(
          (item) => item.certificateId !== certificate.certificateId
        );
        localStorage.setItem(
          buildStudentDownloadsKey(parsedUser),
          JSON.stringify([nextDownload, ...filteredDownloads].slice(0, 10))
        );
        window.dispatchEvent(new Event("student-dashboard-updated"));
      }
    } catch {
      // Ignore analytics storage issues and keep the download working.
    }

    try {
      await apiRequest(`/api/certificates/${certificate.certificateId}/downloaded`, {
        method: "POST",
      });
    } catch {
      // Keep the public PDF download working even if download tracking fails.
    }
  };

  const searchAnotherPath =
    user?.role === "student" ? "/student-dashboard" : "/verify";

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldAutoDownload = searchParams.get("download") === "1";
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (
      shouldAutoDownload &&
      certificate &&
      token &&
      storedUser &&
      !hasAutoDownloaded.current
    ) {
      hasAutoDownloaded.current = true;
      handleDownload().finally(() => {
        navigate(`/certificate/${id}`, { replace: true });
      });
    }
  }, [certificate, id, location.search, navigate]);

  return (
    <section>
      <div className="rounded-3xl border border-[#f1e2d2] bg-gradient-to-br from-[#fdf6eb] to-white p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            {adminProfile.organizationName ? (
              <div className="text-xs uppercase tracking-[0.22em] text-ink-soft">
                {adminProfile.organizationName}
              </div>
            ) : null}
          </div>
          {adminProfile.logo ? (
            <img
              src={adminProfile.logo}
              alt="Organization logo"
              className="h-16 w-16 rounded-2xl object-cover"
            />
          ) : null}
        </div>
        <h1 className="font-display text-3xl">
          {status.loading
            ? "Loading certificate..."
            : certificate
            ? certificate.studentName
            : "Certificate Not Found"}
        </h1>
        {adminProfile.certificateTitle ? (
          <p className="mt-2 text-sm font-semibold text-accent-dark">
            {adminProfile.certificateTitle}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-ink-soft">
          Certificate ID: <span className="font-mono">{id}</span>
        </p>
        {certificate ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Course", certificate.course],
              ...(certificate.duration ? [["Duration", certificate.duration]] : []),
              ["Issued By", "CertiFlow Admin"],
              ["Start Date", certificate.startDate || "Not provided"],
              ["End Date", certificate.endDate || "Not provided"],
              [
                "Issue Date",
                new Date(certificate.issuedAt).toLocaleDateString("en-IN"),
              ],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                  {label}
                </div>
                <div className="mt-2 font-semibold">{value}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-ink-soft">
            {status.error ||
              "We could not find a certificate with that ID. Please verify the code or try another search."}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!certificate}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Download PDF
          </button>
          <Link
            to={searchAnotherPath}
            className="rounded-full border border-[#f0d7c1] bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
          >
            Search Another
          </Link>
        </div>
        {certificate ? (
          <div className="mt-6 rounded-3xl border border-[#f0d7c1] bg-white/80 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-ink-soft">
              Scan to Verify
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR code for certificate ${certificate.certificateId}`}
                  className="h-28 w-28 rounded-2xl bg-white p-2 shadow-[0_10px_24px_rgba(15,27,45,0.08)]"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-[#f9f4ec] text-xs text-ink-soft">
                  Generating...
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink">
                  Open the public verification page
                </div>
                <div className="mt-1 break-all text-xs leading-5 text-ink-soft">
                  {resolveVerifyUrl(certificate, import.meta.env.VITE_APP_URL || window.location.origin)}
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {adminProfile.signature || adminProfile.address || adminProfile.website ? (
          <div className="mt-8 border-t border-[#f1e2d2] pt-6">
            <div className="text-right">
              {adminProfile.signature ? (
                <div className="ml-auto w-fit">
                  <img
                    src={adminProfile.signature}
                    alt="Authorized signature"
                    className="ml-auto h-16 max-w-[220px] object-contain"
                  />
                  <div className="mt-2 h-[2px] w-[190px] bg-accent" />
                </div>
              ) : (
                <div className="ml-auto mt-2 h-[2px] w-[190px] bg-accent" />
              )}
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-ink-soft">
                Authorized Signature
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-ink-soft">
              {adminProfile.address ? <div>{adminProfile.address}</div> : null}
              {adminProfile.website ? <div className="mt-1">{adminProfile.website}</div> : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
