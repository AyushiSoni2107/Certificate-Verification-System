import express from "express";
import {
  generateCertificate,
  getCertificateById,
  markCertificateDownloaded,
} from "../controllers/certificateController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/generate/:studentId",
  requireAuth,
  requireRole("admin"),
  generateCertificate
);
router.post("/:certificateId/downloaded", markCertificateDownloaded);
router.get("/:certificateId", getCertificateById);

export default router;
