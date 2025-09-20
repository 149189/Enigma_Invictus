import Project from "../../models/project.js";
import User from "../../models/user.js";
import { verifyProjectById } from "../../services/aiService.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
// Create a new crowdfunding project
export const createProject = async (req, res) => {
  try {
    const { title, description, category, goalAmount } = req.body;
    const creatorId = req.user.id;

    if (!title || !description || !category || !goalAmount) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      // Upload each image to Cloudinary
      for (const file of req.files) {
        const uploaded = await uploadOnCloudinary(file.path, { secure: true });
        if (uploaded?.secure_url) {
          imageUrls.push(uploaded.secure_url);
        }
      }
    }

    const project = new Project({
      creator: creatorId,
      title: title.trim(),
      description: description.trim(),
      category,
      goalAmount: parseFloat(goalAmount),
      images: imageUrls, // Save Cloudinary URLs
    });

    const savedProject = await project.save();
    res.status(201).json({ success: true, project: savedProject });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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