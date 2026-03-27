import mongoose from "mongoose";
import { Student } from "../models/Student.js";

export const connectDb = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment.");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  await Student.syncIndexes();
};
