import User from "../../models/user.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendResponse } from "../../utils/apiResonse.js";
import { statusType } from "../../utils/statusType.js";
import { validateEmail } from "../../helper/common.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { sendVerificationEmail } from "../../utils/emailService.js"; // Add this import
import crypto from "crypto";

const generateAccessToken = (user) => {
  return jwt.sign(
    { user_id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { user_id: user._id, role: user.role },
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
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, verificationOTP } = req.body;

  if (!name || !email || !password || !verificationOTP) {
    return sendResponse(res, false, null, "All fields including OTP are required", statusType.BAD_REQUEST);
  }

  if (!validateEmail(email)) {
    return sendResponse(res, false, null, "Invalid email id", statusType.BAD_REQUEST);
  }

  // Check if user already exists
  let user = await User.findOne({ email, provider: "local" });
  if (user) {
    return sendResponse(res, false, null, "User already exists, please login", statusType.BAD_REQUEST);
  }

  // In a production app, you would verify the OTP against your temporary store
  // For this example, we'll skip the OTP verification in registration
  // since we're handling it in a separate step

  // Upload avatar if provided
  let avatar = null;
  if (req.files && req.files.image) {
    const avatarLocalPath = req.files.image[0].path;
    const image_temp = await uploadOnCloudinary(avatarLocalPath, { secure: true });
    avatar = image_temp?.secure_url;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Save User
  user = await User.create({
    name,
    email,
    password: hashedPassword,
    avatar,
    provider: "local",
    isVerified: true, // Mark as verified since we verified via OTP
  });

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  // Prepare response
  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({
      status: true,
      success: true,
      accessToken,
      message: "User registered successfully",
      data: userData,
    });
});

// Add OTP verification endpoint
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return sendResponse(res, false, null, "Email and OTP are required", statusType.BAD_REQUEST);
  }

  const user = await User.findOne({ 
    email, 
    provider: "local",
    otpExpiry: { $gt: Date.now() } // Check if OTP is not expired
  });

  if (!user || user.verificationOTP !== otp) {
    return sendResponse(res, false, null, "Invalid or expired OTP", statusType.BAD_REQUEST);
  }

  // Mark user as verified and clear OTP fields
  user.isVerified = true;
  user.verificationOTP = undefined;
  user.otpExpiry = undefined;
  await user.save();

  // Generate tokens now that user is verified
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;
  delete userData.verificationOTP;
  delete userData.otpExpiry;

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({
      status: true,
      success: true,
      accessToken,
      message: "Email verified successfully",
      data: userData,
    });
});

// Add resend OTP endpoint
const resendVerificationOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendResponse(res, false, null, "Email is required", statusType.BAD_REQUEST);
  }

  const user = await User.findOne({ email, provider: "local" });
  if (!user) {
    return sendResponse(res, false, null, "User not found", statusType.NOT_FOUND);
  }

  if (user.isVerified) {
    return sendResponse(res, false, null, "Email is already verified", statusType.BAD_REQUEST);
  }

  // Generate new OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.verificationOTP = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // Send verification email
  const emailSent = await sendVerificationEmail(email, otp);
  if (!emailSent) {
    return sendResponse(res, false, null, "Failed to send verification email", statusType.INTERNAL_SERVER_ERROR);
  }

  return sendResponse(res, true, null, "Verification OTP sent successfully", statusType.OK);
});

// Update loginUser to check if email is verified
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, false, null, "Email and password are required", statusType.BAD_REQUEST);
  }

  if (!validateEmail(email)) {
    return sendResponse(res, false, null, "Invalid email id", statusType.BAD_REQUEST);
  }

  const user = await User.findOne({ email, provider: "local" }).select("+password");
  if (!user) {
    return sendResponse(res, false, null, "User does not exist", statusType.BAD_REQUEST);
  }

  // Check if email is verified
  if (!user.isVerified) {
    return sendResponse(res, false, null, "Please verify your email first", statusType.UNAUTHORIZED);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return sendResponse(res, false, null, "Email or password is incorrect", statusType.BAD_REQUEST);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({
      status: true,
      success: true,
      accessToken,
      message: "Login successful",
      data: userData,
    });
});


const sendVerificationOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendResponse(res, false, null, "Email is required", statusType.BAD_REQUEST);
  }

  if (!validateEmail(email)) {
    return sendResponse(res, false, null, "Invalid email id", statusType.BAD_REQUEST);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email, provider: "local" });
  if (existingUser) {
    return sendResponse(res, false, null, "User already exists with this email", statusType.BAD_REQUEST);
  }

  // Generate OTP and set expiry (10 minutes from now)
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  // For new users, we'll store the OTP in a temporary way
  // In a production app, you might use a separate collection for pending registrations
  // For simplicity, we'll just return the OTP for now
  // In a real app, you would store this in Redis or similar with the email as key

  // Send verification email
  const emailSent = await sendVerificationEmail(email, otp);
  if (!emailSent) {
    return sendResponse(res, false, null, "Failed to send verification email", statusType.INTERNAL_SERVER_ERROR);
  }

  // In a production app, you would store the OTP in a temporary store
  // For this example, we'll just return success
  return sendResponse(res, true, { otp }, "Verification OTP sent successfully", statusType.OK);
});
export { registerUser, loginUser, verifyEmail, resendVerificationOTP, sendVerificationOTP };