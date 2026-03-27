import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const buildFrontendOrigin = () =>
  process.env.CLIENT_URL ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const register = async (req, res) => {
  const { name, email, password, role, avatar } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!name || !normalizedEmail || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: "Email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: role === "admin" ? "admin" : "student",
    avatar: avatar || null,
  });

  const token = signToken(user);
  return res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: "Missing credentials." });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = signToken(user);
  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

export const forgotPassword = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body.email);

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required." });
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(404).json({ message: "No account found for that email." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordTokenHash = hashResetToken(resetToken);
  user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${buildFrontendOrigin()}/reset-password/${resetToken}`;

  return res.json({
    message:
      "Password reset link generated. Open the link below to continue.",
    resetUrl,
    expiresInMinutes: 60,
  });
};

export const resetPassword = async (req, res) => {
  const resetToken = String(req.body.token || "").trim();
  const newPassword = String(req.body.newPassword || "");

  if (!resetToken || !newPassword) {
    return res
      .status(400)
      .json({ message: "Reset token and new password are required." });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long." });
  }

  const tokenHash = hashResetToken(resetToken);
  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ message: "Reset link is invalid or expired." });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  return res.json({ message: "Password updated successfully." });
};
