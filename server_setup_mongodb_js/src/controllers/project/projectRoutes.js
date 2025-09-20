import express from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from "./projectController.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js"; // Assuming you have authentication middleware

const router = express.Router();

// All routes are verifyJWTed except getting projects
router.post("/", verifyJWT, createProject);
router.get("/", getProjects);
router.get("/:id", getProject);
router.put("/:id", verifyJWT, updateProject);
router.delete("/:id", verifyJWT, deleteProject);

export default router;