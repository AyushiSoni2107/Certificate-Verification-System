import { Certificate } from "../models/Certificate.js";
import { Student } from "../models/Student.js";
import {
  calculateDurationLabel,
  formatDateLabel,
} from "../utils/dateDuration.js";

const buildCertificateId = (studentId) => {
  const year = new Date().getFullYear();
  return `CERT-${year}-${studentId.slice(-6).toUpperCase()}`;
};

export const getCertificateById = async (req, res) => {
  const { certificateId } = req.params;
  const certificate = await Certificate.findOne({ certificateId }).populate(
    "student",
    "name course email certificateId certificateUrl"
  );

  if (!certificate) {
    return res.status(404).json({ message: "Certificate not found." });
  }

  const payload = certificate.toObject();
  payload.startDate = formatDateLabel(payload.startDate);
  payload.endDate = formatDateLabel(payload.endDate);
  payload.duration =
    payload.duration ||
    calculateDurationLabel(payload.startDate, payload.endDate) ||
    null;

  return res.json(payload);
};

export const generateCertificate = async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findOne({
    _id: studentId,
    importedBy: req.user.id,
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }

  const certificateId =
    student.certificateId || buildCertificateId(student._id.toString());
  const baseUrl =
    process.env.CLIENT_URL?.replace(/\/$/, "") || "http://localhost:5173";
  const certificateUrl = `${baseUrl}/certificate/${certificateId}`;

  const certificate = await Certificate.findOneAndUpdate(
    { student: student._id },
    {
      student: student._id,
      certificateId,
      studentName: student.name,
      course: student.course,
      email: student.email,
      startDate: student.startDate || null,
      endDate: student.endDate || null,
      duration:
        calculateDurationLabel(student.startDate, student.endDate) ||
        student.duration ||
        null,
      certificateUrl,
      issuedAt: new Date(),
      createdBy: req.user.id,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  student.certificateId = certificate.certificateId;
  student.certificateUrl = certificate.certificateUrl;
  await student.save();

  return res.json({
    message: "Certificate generated successfully.",
    certificate,
  });
};

export const markCertificateDownloaded = async (req, res) => {
  const certificate = await Certificate.findOneAndUpdate(
    { certificateId: req.params.certificateId },
    { $inc: { downloadCount: 1 } },
    { new: true }
  );

  if (!certificate) {
    return res.status(404).json({ message: "Certificate not found." });
  }

  return res.json({
    message: "Download recorded.",
    downloadCount: certificate.downloadCount,
  });
};
