import User from "../../models/user.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { sendResponse } from "../../utils/apiResonse.js";
import { statusType } from "../../utils/statusType.js";

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

const googleAuth = asyncHandler(async (req, res) => {
  const { googleId, email, name, picture } = req.body;

  // 1️⃣ Check if user already exists
  let user = await User.findOne({ provider: "google", providerId: googleId });

  // 2️⃣ If not, create a new user
  if (!user) {
    user = await User.create({
      name,
      email,
      provider: "google",
      providerId: googleId,
      avatar: picture,
      emailVerified: true,
    });
  }

  // 3️⃣ Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  
  
  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  return sendResponse(
        res,
        true,
        { ...userData, accessToken }, // Still return accessToken in response body if needed
        "Registered Successful",
        statusType.OK
    );
});
const getCurrentUser = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return sendResponse(res, false, null, "No token", statusType.UNAUTHORIZED);

  const token = req.cookies.accessToken; // read httpOnly cookie
  console.log("token is :-", token);
  try {
    
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.user_id).select("-password -refreshToken");
    return sendResponse(res, true, user, "User fetched", statusType.SUCCESS);
  } catch (err) {
    return sendResponse(res, false, null, "Invalid token", statusType.UNAUTHORIZED);
  }
});
const logoutUser = asyncHandler(async (req, res) => {

  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json({ success: true, message: "Logged out successfully" });
});
export { getCurrentUser };
export { logoutUser };
export { googleAuth };