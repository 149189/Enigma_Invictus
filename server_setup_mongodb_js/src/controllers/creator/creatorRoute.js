import express from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  resendVerificationOTP ,
  sendVerificationOTP
} from "./creatorController.js";
import { googleAuth, getCurrentUser, logoutUser } from "./GoogleCreatorController.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const userRoute = express.Router();

// Local auth
userRoute.post(
  "/register",
  upload.fields([{ name: "image", maxCount: 1 }]),
  registerUser
);
userRoute.post("/login", loginUser);
userRoute.post("/verify-email", verifyEmail);
userRoute.post("/resend-verification", resendVerificationOTP);
userRoute.post("/send-verification-otp", sendVerificationOTP);
// Google auth
userRoute.post("/google", googleAuth);
userRoute.use(verifyJWT);
userRoute.get("/me", getCurrentUser);
userRoute.get("/logout", logoutUser);

export { userRoute };