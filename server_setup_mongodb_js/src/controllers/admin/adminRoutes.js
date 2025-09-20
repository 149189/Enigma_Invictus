import express from "express";
import {
  getProjects,
  validateProject,
  getDonations,
  getDonationStats,
  getProjectStats,
  registerAdmin,
  loginAdmin,
  getAdminProfile
} from "./adminController.js";
import { adminProtect } from "../../middlewares/auth.middleware.js"; // Admin authentication middleware

const router = express.Router();

// router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

router.use(adminProtect);


// Protected route
router.get("/profile", getAdminProfile);

// Project management routes
router.get("/projects", getProjects);
router.patch("/projects/:id/validate", validateProject);

// Donation management routes
router.get("/donations", getDonations);
router.get("/stats/donations", getDonationStats);
router.get("/stats/projects", getProjectStats);

export default router;