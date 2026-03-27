import express from "express";
import multer from "multer";
import { uploadExcel, listUploads } from "../controllers/uploadController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  upload.single("file"),
  uploadExcel
);
router.get("/stats", requireAuth, requireRole("admin"), listUploads);

export default router;
