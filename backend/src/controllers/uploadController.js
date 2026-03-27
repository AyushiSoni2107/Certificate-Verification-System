import XLSX from "xlsx";
import { Certificate } from "../models/Certificate.js";
import { Student } from "../models/Student.js";
import { calculateDurationLabel } from "../utils/dateDuration.js";
import { mapStudentRow } from "../utils/studentMapper.js";

export const uploadExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Excel file is required." });
  }

  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const parsedStudents = rows
    .map(mapStudentRow)
    .filter((student) => student.name && student.course && student.email);

  if (!parsedStudents.length) {
    return res.status(400).json({
      message:
        "No valid rows found. Required columns: Name, Course, Email.",
    });
  }

  const uniqueStudents = Array.from(
    new Map(parsedStudents.map((student) => [student.email.toLowerCase(), student])).values()
  );

  try {
    await Student.bulkWrite(
      uniqueStudents.map((student) => ({
        updateOne: {
          filter: {
            email: student.email.toLowerCase(),
            importedBy: req.user.id,
          },
          update: {
            $set: {
              name: student.name,
              course: student.course,
              email: student.email.toLowerCase(),
              startDate: student.startDate || null,
              endDate: student.endDate || null,
              duration:
                calculateDurationLabel(student.startDate, student.endDate) || null,
              importedBy: req.user.id,
            },
          },
          upsert: true,
        },
      }))
    );
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message:
          "Student import is blocked by an old database email index. Restart the backend and try the import again.",
      });
    }

    throw error;
  }

  const students = await Student.find({ importedBy: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      "name course email startDate endDate duration certificateId certificateUrl createdAt updatedAt"
    );

  return res.json({
    message: `Imported ${uniqueStudents.length} students successfully.`,
    file: {
      originalName: req.file.originalname,
      size: req.file.size,
    },
    importedCount: uniqueStudents.length,
    students,
  });
};

export const listUploads = async (req, res) => {
  const [count, students] = await Promise.all([
    Certificate.countDocuments({ createdBy: req.user.id }),
    Student.countDocuments({ importedBy: req.user.id }),
  ]);

  return res.json({ certificates: count, students });
};
