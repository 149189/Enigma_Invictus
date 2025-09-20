import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  logoutAdmin
} from "./adminController.js";
import { adminProtect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protect all routes after this middleware
router.use(adminProtect);

// Protected routes
router.get("/profile", getAdminProfile);
router.get("/logout", logoutAdmin);

export default router;
