import express from "express";
import {
  getProjects,
  validateProject,
  getDonations,
  getDonationStats,
  getProjectStats
} from "./adminController.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js"; // Admin authentication middleware

const router = express.Router();

router.use(verifyJWT);

// Project management routes
router.get("/projects", getProjects);
router.patch("/projects/:id/validate", validateProject);

// Donation management routes
router.get("/donations", getDonations);
router.get("/stats/donations", getDonationStats);
router.get("/stats/projects", getProjectStats);

export default router;