import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || "10mb";

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: requestBodyLimit }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "certiflow-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/admin", adminRoutes);

export default app;
