import bcrypt from "bcryptjs";
import Admin from "../../models/admin.js";

import { asyncHandler } from "../../utils/asyncHandler.js";

import jwt from "jsonwebtoken";

export const generateAccessToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
  domain: process.env.NODE_ENV === "production" ? "yourdomain.com" : "localhost",
};
// -------------------- Register Admin --------------------
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({ success: false, message: "Admin already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ name, email, password: hashedPassword });

  const accessToken = generateAccessToken(admin);
  const refreshToken = generateRefreshToken(admin);

  admin.refreshToken = refreshToken;
  await admin.save();

  const adminData = admin.toObject();
  delete adminData.password;
  delete adminData.refreshToken;

  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({
      success: true,
      message: "Admin registered successfully",
      data: adminData,
      accessToken,
    });
});

// -------------------- Login Admin --------------------
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin) {
    return res.status(401).json({ success: false, message: "Admin does not exist" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const accessToken = generateAccessToken(admin);
  const refreshToken = generateRefreshToken(admin);

  admin.refreshToken = refreshToken;
  await admin.save();

  const adminData = admin.toObject();
  delete adminData.password;
  delete adminData.refreshToken;

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({
      success: true,
      message: "Login successful",
      data: adminData,
      accessToken,
    });
});

// -------------------- Get Admin Profile --------------------
export const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = req.admin;
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  const adminData = admin.toObject();
  delete adminData.password;
  delete adminData.refreshToken;

  res.status(200).json({
    success: true,
    message: "Admin profile fetched",
    data: adminData,
  });
});

// -------------------- Logout Admin --------------------
export const logoutAdmin = asyncHandler(async (req, res) => {
  const admin = req.admin;

  if (admin) {
    admin.refreshToken = "";
    await admin.save();
  }

  res
    .status(200)
    .cookie("accessToken", "", { ...cookieOptions, maxAge: 0 })
    .cookie("refreshToken", "", { ...cookieOptions, maxAge: 0 })
    .json({ success: true, message: "Logged out successfully" });
});
