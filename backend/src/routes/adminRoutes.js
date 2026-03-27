import express from "express";
import {
  deleteStudent,
  getDashboardStats,
  getStudentById,
  getStudents,
  updateStudent,
} from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", requireAuth, requireRole("admin"), getDashboardStats);
router.get("/students", requireAuth, requireRole("admin"), getStudents);
router.get("/students/:studentId", requireAuth, requireRole("admin"), getStudentById);
router.put("/students/:studentId", requireAuth, requireRole("admin"), updateStudent);
router.delete("/students/:studentId", requireAuth, requireRole("admin"), deleteStudent);

export default router;
