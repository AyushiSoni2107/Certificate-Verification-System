import mongoose from "mongoose";
import { Certificate } from "../models/Certificate.js";
import { Student } from "../models/Student.js";
import { calculateDurationLabel } from "../utils/dateDuration.js";

export const getDashboardStats = async (req, res) => {
  const adminId = req.user.id;
  const adminObjectId = new mongoose.Types.ObjectId(adminId);
  const [studentCount, certificateCount, userStudentCount, downloadStats] =
    await Promise.all([
      Student.countDocuments({ importedBy: adminId }),
      Certificate.countDocuments({ createdBy: adminId }),
      Student.countDocuments({ importedBy: adminId }),
      Certificate.aggregate([
        {
          $match: {
            createdBy: adminObjectId,
          },
        },
        {
          $group: {
            _id: null,
            downloads: { $sum: "$downloadCount" },
          },
        },
      ]),
    ]);

  const recentUploadActivity = await Student.countDocuments({
    importedBy: adminId,
    createdAt: {
      $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    },
  });

  if (studentCount === 0) {
    return res.json({
      totalStudents: 0,
      totalCertificates: 0,
      certificatesDownloaded: 0,
      recentUploadActivity: 0,
      registeredStudentUsers: 0,
    });
  }

  return res.json({
    totalStudents: studentCount,
    totalCertificates: certificateCount,
    certificatesDownloaded: downloadStats[0]?.downloads || 0,
    recentUploadActivity,
    registeredStudentUsers: userStudentCount,
  });
};

export const getStudents = async (req, res) => {
  const students = await Student.find({ importedBy: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      "name course email startDate endDate duration certificateId certificateUrl createdAt updatedAt"
    );

  return res.json({ students });
};

export const getStudentById = async (req, res) => {
  const student = await Student.findOne({
    _id: req.params.studentId,
    importedBy: req.user.id,
  }).select(
    "name course email startDate endDate duration certificateId certificateUrl createdAt updatedAt"
  );

  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }

  return res.json({ student });
};

export const updateStudent = async (req, res) => {
  const { name, course, email, startDate, endDate } = req.body;

  if (!name || !course || !email) {
    return res.status(400).json({ message: "Name, course, and email are required." });
  }

  const existingStudent = await Student.findOne({
    email: email.toLowerCase(),
    importedBy: req.user.id,
    _id: { $ne: req.params.studentId },
  });

  if (existingStudent) {
    return res.status(409).json({ message: "Another student already uses this email." });
  }

  const student = await Student.findOneAndUpdate(
    { _id: req.params.studentId, importedBy: req.user.id },
    {
      name: name.trim(),
      course: course.trim(),
      email: email.toLowerCase().trim(),
      startDate: startDate || null,
      endDate: endDate || null,
      duration: calculateDurationLabel(startDate, endDate) || null,
    },
    { new: true, runValidators: true }
  ).select(
    "name course email startDate endDate duration certificateId certificateUrl createdAt updatedAt"
  );

  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }

  if (student.certificateId) {
    await Certificate.findOneAndUpdate(
      { certificateId: student.certificateId },
      {
        studentName: student.name,
        course: student.course,
        email: student.email,
        startDate: student.startDate || null,
        endDate: student.endDate || null,
        duration:
          calculateDurationLabel(student.startDate, student.endDate) ||
          student.duration ||
          null,
      }
    );
  }

  return res.json({
    message: "Student updated successfully.",
    student,
  });
};

export const deleteStudent = async (req, res) => {
  const student = await Student.findOne({
    _id: req.params.studentId,
    importedBy: req.user.id,
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }

  if (student.certificateId) {
    await Certificate.findOneAndDelete({ certificateId: student.certificateId });
  }

  await Student.findOneAndDelete({
    _id: req.params.studentId,
    importedBy: req.user.id,
  });

  return res.json({ message: "Student deleted successfully." });
};
