import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    duration: { type: String, default: null },
    certificateId: { type: String, default: null, index: true },
    certificateUrl: { type: String, default: null },
    importedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

studentSchema.index({ importedBy: 1, email: 1 }, { unique: true });

export const Student = mongoose.model("Student", studentSchema);
