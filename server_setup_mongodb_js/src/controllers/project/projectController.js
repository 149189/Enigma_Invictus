import Project from "../../models/project.js";
import User from "../../models/user.js";
import { verifyProjectById } from "../../services/aiService.js";

// Create a new crowdfunding project
export const createProject = async (req, res) => {
  try {
    const { title, description, category, goalAmount, images } = req.body;
    const creatorId = req.user.id; // Assuming user ID is available from authentication middleware

    // Validate required fields
    if (!title || !description || !category || !goalAmount) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category, and goal amount are required",
      });
    }

    // Validate goal amount is a positive number
    if (isNaN(goalAmount) || goalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Goal amount must be a positive number",
      });
    }

    // Validate category is from allowed values
    const allowedCategories = ["Education", "Health", "Environment", "Community", "Other"];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category. Must be one of: Education, Health, Environment, Community, Other",
      });
    }

    // Check if user exists and is active
    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is banned. Cannot create project",
      });
    }

    // Create the project
    const project = new Project({
      creator: creatorId,
      title: title.trim(),
      description: description.trim(),
      category,
      goalAmount: parseFloat(goalAmount),
      images: images || [],
    });

    // Save the project to database
    const savedProject = await project.save();

    // Run AI verification for this project (dry run to decide locally)
    let refreshed;
    try {
      const aiResult = await verifyProjectById(String(savedProject._id), { dryRun: true });
      if (aiResult && typeof aiResult.prediction !== 'undefined' && typeof aiResult.confidence === 'number') {
        const confidence = aiResult.confidence;
        const prediction = aiResult.prediction; // 1 = approved, 0 = rejected (as per AI service)
        const notes = aiResult.notes || '';

        // Apply 50% threshold for auto-approval only if AI predicts approval
        if (prediction === 1 && confidence >= 0.5) {
          savedProject.status = 'approved';
          savedProject.autoVerified = true;
          savedProject.verificationConfidence = confidence;
          savedProject.verificationNotes = notes;
          savedProject.verifiedAt = new Date();
          await savedProject.save();
        } else {
          // Keep pending but store AI metadata for admin review/UI
          savedProject.autoVerified = false;
          savedProject.verificationConfidence = confidence;
          savedProject.verificationNotes = notes;
          await savedProject.save();
        }
      }
    } catch (_) {
      // If AI service failed, continue without blocking creation
    }

    // Load latest version with creator populated
    refreshed = await Project.findById(savedProject._id).populate({
      path: "creator",
      select: "name email avatar",
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully. AI auto-verification has been applied.",
      project: refreshed,
    });
  } catch (error) {
    console.error("Error creating project:", error);

    // Handle duplicate key errors (if any)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A project with similar details already exists",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all projects (with optional filtering)
export const getProjects = async (req, res) => {
  try {
    const { category, status, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get projects with pagination and population
    const projects = await Project.find(filter)
      .populate({
        path: "creator",
        select: "name avatar",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination info
    const total = await Project.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      projects,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a single project by ID
export const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id).populate({
      path: "creator",
      select: "name avatar email",
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    
    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update a project (only by creator)
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;
    
    // Find the project
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    
    // Check if user is the creator
    if (project.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own projects",
      });
    }
    
    // Prevent updating certain fields
    delete updates.creator;
    delete updates.raisedAmount;
    delete updates.status;
    delete updates.validatedBy;
    
    // Update the project
    Object.assign(project, updates);
    const updatedProject = await project.save();
    
    await updatedProject.populate({
      path: "creator",
      select: "name avatar email",
    });
    
    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a project (only by creator)
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    
    // Check if user is the creator
    if (project.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own projects",
      });
    }
    
    await Project.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};