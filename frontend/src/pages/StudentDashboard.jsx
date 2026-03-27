import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api.js";
import { getStudentProfile } from "../utils/studentProfile.js";

const EMPTY_CERTIFICATE = {
  studentName: "Unknown Student",
  course: "Pending Verification",
  startDate: "--",
  endDate: "--",
  certificateId: "UNKNOWN",
};

const buildStudentAnalyticsKey = (user) =>
  `studentAnalytics:${user?.id || user?.email || "default"}`;
const buildStudentDownloadsKey = (user) =>
  `studentDownloads:${user?.id || user?.email || "default"}`;

export default function StudentDashboard() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);
  const [certificateId, setCertificateId] = useState("");
  const [resultId, setResultId] = useState("UNKNOWN");
  const [status, setStatus] = useState("Ready");
  const [activeCertificate, setActiveCertificate] = useState(EMPTY_CERTIFICATE);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalDownloads: 0,
    verifiedCertificates: 0,
    lastStatus: "Ready",
  });
  const [downloadedCertificates, setDownloadedCertificates] = useState([]);
  const navigate = useNavigate();
  const studentProfile = user?.role === "student" ? getStudentProfile(user) : {};

  const loadStudentDashboardData = () => {
    if (!user) {
      return;
    }

    try {
      const storedAnalytics =
        JSON.parse(localStorage.getItem(buildStudentAnalyticsKey(user))) || {};
      setAnalytics({
        totalDownloads: storedAnalytics.totalDownloads || 0,
        verifiedCertificates: storedAnalytics.verifiedCertificates || 0,
        lastStatus: storedAnalytics.lastStatus || "Ready",
      });
      setDownloadedCertificates(
        JSON.parse(localStorage.getItem(buildStudentDownloadsKey(user))) || []
      );
    } catch {
      setAnalytics({
        totalDownloads: 0,
        verifiedCertificates: 0,
        lastStatus: "Ready",
      });
      setDownloadedCertificates([]);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    loadStudentDashboardData();
  }, [user]);

  useEffect(() => {
    const refreshStudentDashboard = () => {
      loadStudentDashboardData();
    };

    window.addEventListener("student-dashboard-updated", refreshStudentDashboard);
    window.addEventListener("storage", refreshStudentDashboard);

    return () => {
      window.removeEventListener("student-dashboard-updated", refreshStudentDashboard);
      window.removeEventListener("storage", refreshStudentDashboard);
    };
  }, [user]);

  const saveAnalytics = (nextAnalytics) => {
    setAnalytics(nextAnalytics);
    if (!user) {
      return;
    }

    localStorage.setItem(
      buildStudentAnalyticsKey(user),
      JSON.stringify(nextAnalytics)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = certificateId.trim().toUpperCase();

    if (!trimmed) {
      setResultId("UNKNOWN");
      setActiveCertificate(EMPTY_CERTIFICATE);
      setStatus("Not Found");
      saveAnalytics({
        ...analytics,
        lastStatus: "Not Found",
      });
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
      saveAnalytics({
        ...analytics,
        verifiedCertificates: analytics.verifiedCertificates + 1,
        lastStatus: "Verified",
      });
    } catch {
      setActiveCertificate({
        ...EMPTY_CERTIFICATE,
        certificateId: trimmed,
      });
      setStatus("Not Found");
      saveAnalytics({
        ...analytics,
        lastStatus: "Not Found",
      });
    } finally {
      setLoading(false);
    }
  };

  const isVerified = status === "Verified";
  const formatDate = (value) => {
    if (!value) {
      return "--";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleDateString("en-IN");
  };
  const analyticsCards = [
    ["Total Certificate Downloads", analytics.totalDownloads, "Downloaded certificates from your account"],
    ["Verified Results", analytics.verifiedCertificates, "Successful certificate matches found"],
  ];

  return (
    <section className="space-y-8">
      <section className="grid grid-cols-2 gap-3 md:gap-6">
        {analyticsCards.map(([label, value, helper], index) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-[24px] border border-[#f1e2d2] bg-[linear-gradient(145deg,#fffdf9_0%,#fff7ef_100%)] p-4 shadow-[0_14px_30px_rgba(15,27,45,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,27,45,0.12)]"
          >
            <div
              className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-80 blur-2xl ${
                [
                  "bg-[#ffd4c5]",
                  "bg-[#dbe7ff]",
                  "bg-[#c9f3e9]",
                  "bg-[#ffe0bf]",
                ][index]
              }`}
            />
            <div className="relative flex items-center justify-between gap-3">
              <div
                className={`inline-flex rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] md:px-2.5 md:text-[10px] md:tracking-[0.18em] ${
                  [
                    "bg-[#fff0e8] text-accent-dark",
                    "bg-[#edf3ff] text-[#3d66d9]",
                    "bg-[#e8faf5] text-[#008a6d]",
                    "bg-[#fff3e8] text-[#d86a3d]",
                  ][index]
                }`}
              >
                {label}
              </div>
              <div
                className={`h-3 w-3 rounded-full shadow-[0_0_0_6px_rgba(255,255,255,0.85)] ${
                  ["bg-accent", "bg-[#4a7bff]"][index]
                }`}
              />
            </div>
            <div className="relative mt-5 flex items-end justify-between gap-4">
              <div className="flex min-h-[74px] flex-col justify-end">
                <div className="text-[24px] font-semibold leading-none tracking-[-0.05em] text-ink md:text-[30px]">
                  {value}
                </div>
                <div className="mt-2 text-xs text-ink-soft md:mt-3 md:text-sm">{helper}</div>
              </div>
              <div className="flex h-[64px] w-[72px] items-end">
                <div className="flex h-full w-full items-end gap-1.5">
                  {(index === 0 ? [16, 28, 22, 40] : [14, 24, 34, 46]).map((bar, barIndex) => (
                    <div
                      key={`${label}-${barIndex}`}
                      className={`w-full rounded-t-[999px] ${
                        [
                          [
                            "bg-[#ffc7b1]",
                            "bg-[#ffab8a]",
                            "bg-[#ff875d]",
                            "bg-[#ff6a3d]",
                          ],
                          [
                            "bg-[#d5e2ff]",
                            "bg-[#aec8ff]",
                            "bg-[#7ea8ff]",
                            "bg-[#4a7bff]",
                          ],
                        ][index][barIndex]
                      }`}
                      style={{ height: `${bar}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

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
          <label className="font-semibold" htmlFor="student-certificate-id">
            Certificate ID
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              id="student-certificate-id"
              name="student-certificate-id"
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
              onClick={() => navigate(`/certificate/${resultId}?download=1`)}
            >
              Download
            </button>
          </div>
        </div>
      </div>
      </section>

      <section>
        <div className="relative overflow-hidden rounded-[32px] border border-[#e5d6c6] bg-[linear-gradient(140deg,#fffdf8_0%,#fff7ef_48%,#fff2e5_100%)] p-6 shadow-[0_20px_50px_rgba(15,27,45,0.12)]">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(255,166,122,0.34)_0%,_rgba(255,166,122,0)_72%)]" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[radial-gradient(circle,_rgba(74,123,255,0.12)_0%,_rgba(74,123,255,0)_72%)]" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[#6f7f96]">
                Downloaded Certificates
              </div>
              <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-ink">
                Certificate download history
              </h2>
              <p className="mt-2 max-w-xl text-sm text-[#6f7f96]">
                Your recently downloaded certificates appear here for quick reference.
              </p>
            </div>
            <div className="rounded-full border border-white/80 bg-white/75 px-4 py-2 text-sm font-semibold text-[#32496b] shadow-[0_10px_24px_rgba(15,27,45,0.08)] backdrop-blur">
              {downloadedCertificates.length}{" "}
              {downloadedCertificates.length === 1 ? "record" : "records"}
            </div>
          </div>

          <div className="relative mt-6 overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_12px_30px_rgba(15,27,45,0.07)] backdrop-blur">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                <thead className="bg-[linear-gradient(90deg,#20324c_0%,#2f496b_100%)] text-[#f7f3ec]">
                  <tr>
                    <th className="px-5 py-4 text-sm font-semibold">Certificate ID</th>
                    <th className="px-5 py-4 text-sm font-semibold">Course</th>
                    <th className="px-5 py-4 text-sm font-semibold">Downloaded On</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {downloadedCertificates.length ? (
                    downloadedCertificates.map((item) => (
                      <tr
                        key={item.certificateId}
                        className="align-top transition hover:bg-[#fff8f1]"
                      >
                        <td className="border-t border-[#efe3d6] px-5 py-5 font-mono text-xs tracking-[0.08em] text-[#49607f]">
                          <span className="inline-flex rounded-full bg-[#f4f7fc] px-3 py-2">
                            {item.certificateId}
                          </span>
                        </td>
                        <td className="border-t border-[#efe3d6] px-5 py-5 text-base font-medium text-[#23344d]">
                          {item.course}
                        </td>
                        <td className="border-t border-[#efe3d6] px-5 py-5 text-sm font-medium text-[#5f7089]">
                          {formatDate(item.downloadedAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-5 py-10 text-center text-[#6f7f96]">
                        No certificates downloaded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
