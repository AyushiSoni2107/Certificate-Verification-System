import { jsPDF } from "jspdf";
import QRCode from "qrcode";

const formatIssuedDate = (value) =>
  new Date(value || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatCertificateRange = (certificate) => {
  const start = certificate.startDate || "N/A";
  const end = certificate.endDate || "N/A";
  return `Duration: ${start} to ${end}`;
};

const getImageType = (dataUrl) =>
  String(dataUrl || "").includes("image/jpeg") ? "JPEG" : "PNG";

export const downloadCertificatePdf = async (certificate, adminProfile = {}) => {
  const doc = new jsPDF("landscape", "pt", "a4");
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const appOrigin = import.meta.env.VITE_APP_URL || window.location.origin;
  const verifyUrl =
    certificate.certificateUrl ||
    `${appOrigin}/certificate/${certificate.certificateId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 160,
    color: {
      dark: "#0f1b2d",
      light: "#FFF8F1",
    },
  });

  doc.setFillColor(247, 242, 232);
  doc.rect(0, 0, width, height, "F");

  doc.setDrawColor(240, 215, 193);
  doc.setLineWidth(3);
  doc.roundedRect(32, 32, width - 64, height - 64, 24, 24, "S");

  doc.setTextColor(15, 27, 45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(adminProfile.organizationName || "CertiFlow", 68, 78);

  if (adminProfile.logo) {
    doc.addImage(adminProfile.logo, "PNG", width - 110, 52, 42, 42);
  }

  doc.setTextColor(225, 76, 36);
  doc.setFontSize(18);
  doc.text(adminProfile.certificateTitle || "Certificate", width / 2, 102, {
    align: "center",
  });

  doc.setTextColor(15, 27, 45);
  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.text("Certificate of Achievement", width / 2, 150, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(59, 75, 102);
  doc.text("This certificate is proudly presented to", width / 2, 198, {
    align: "center",
  });

  doc.setFont("times", "bolditalic");
  doc.setFontSize(28);
  doc.setTextColor(15, 27, 45);
  doc.text(certificate.studentName, width / 2, 240, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(59, 75, 102);
  doc.text(
    `for successfully completing the ${certificate.course} program.`,
    width / 2,
    275,
    { align: "center" }
  );
  doc.text(formatCertificateRange(certificate), width / 2, 302, {
    align: "center",
  });

  doc.text(
    `Certificate ID: ${certificate.certificateId}`,
    width / 2,
    332,
    { align: "center" }
  );
  doc.text(`Issued on ${formatIssuedDate(certificate.issuedAt)}`, width / 2, 358, {
    align: "center",
  });

  doc.addImage(qrCodeDataUrl, "PNG", 82, 380, 88, 88);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 27, 45);
  doc.text("Scan to Verify", 126, 482, { align: "center" });

  doc.setDrawColor(225, 76, 36);
  doc.setLineWidth(1.25);
  doc.line(width - 280, 430, width - 120, 430);

  if (adminProfile.signature) {
    doc.addImage(
      adminProfile.signature,
      getImageType(adminProfile.signature),
      width - 270,
      380,
      140,
      42
    );
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(59, 75, 102);
  doc.text("Authorized Signatory", width - 200, 450, { align: "center" });
  const footerLines = [
    adminProfile.address || "",
    adminProfile.website || "",
  ].filter(Boolean);

  footerLines.forEach((line, index) => {
    doc.text(line, width / 2, 500 + index * 16, { align: "center" });
  });

  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = pdfUrl;
  downloadLink.download = `${certificate.certificateId}.pdf`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(pdfUrl);
};
