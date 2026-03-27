import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", index: true },
    studentName: { type: String, required: true },
    course: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    duration: { type: String, default: null },
    certificateUrl: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
    downloadCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Certificate = mongoose.model("Certificate", certificateSchema);
