import Project from "../../models/project.js";
import Donation from "../../models/donation.js";
import Admin from "../../models/admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

// Register admin (to be used only once, then remove this endpoint)
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
    });

    if (admin) {
      res.status(201).json({
        success: true,
        message: "Admin registered successfully",
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          token: generateToken(admin._id),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid admin data",
      });
    }
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check if admin exists and password is correct
    const admin = await Admin.findOne({ email }).select("+password");
    
    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        success: true,
        message: "Login successful",
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          token: generateToken(admin._id),
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get current admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    
    res.json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("Error getting admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all projects with filtering options
export const getProjects = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get projects with pagination and population
    const projects = await Project.find(filter)
      .populate({
        path: "creator",
        select: "name email",
      })
      .populate({
        path: "validatedBy",
        select: "name email",
        match: { validatedBy: { $exists: true } }
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

// Validate/Reject a project
export const validateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const adminId = req.admin.id; // Assuming admin ID is available from authentication middleware

    // Validate input
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status is required and must be either 'approved' or 'rejected'",
      });
    }

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when rejecting a project",
      });
    }

    // Check if project exists
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if project is already processed
    if (project.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Project has already been ${project.status}`,
      });
    }

    // Check if admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Update project status
    project.status = status;
    project.validatedBy = adminId;
    
    // Add rejection reason if provided
    if (status === "rejected" && rejectionReason) {
      project.rejectionReason = rejectionReason;
    }
    
    const updatedProject = await project.save();
    
    // Populate the updated project with creator and validator info
    await updatedProject.populate([
      { path: "creator", select: "name email" },
      { path: "validatedBy", select: "name email" }
    ]);

    res.status(200).json({
      success: true,
      message: `Project ${status} successfully`,
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error validating project:", error);
    
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

// Get all donations with filtering options
export const getDonations = async (req, res) => {
  try {
    const { projectId, status, page = 1, limit = 20 } = req.query;
    
    // Build filter object
    const filter = {};
    if (projectId) filter.project = projectId;
    if (status) filter.status = status;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get donations with pagination and population
    const donations = await Donation.find(filter)
      .populate({
        path: "donor",
        select: "name email",
      })
      .populate({
        path: "project",
        select: "title creator",
        populate: {
          path: "creator",
          select: "name"
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination info
    const total = await Donation.countDocuments(filter);
    
    // Calculate total amount for the filtered donations
    const totalAmount = await Donation.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    res.status(200).json({
      success: true,
      donations,
      summary: {
        totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
        totalDonations: total
      },
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get donation statistics
export const getDonationStats = async (req, res) => {
  try {
    // Get total donations count and amount
    const totalStats = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get donations by status
    const statusStats = await Donation.aggregate([
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get donations by project
    const projectStats = await Donation.aggregate([
      {
        $group: {
          _id: "$project",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 }
    ]);
    
    // Populate project names
    const populatedProjectStats = await Project.populate(projectStats, {
      path: "_id",
      select: "title"
    });
    
    res.status(200).json({
      success: true,
      stats: {
        total: totalStats.length > 0 ? totalStats[0] : { totalAmount: 0, count: 0 },
        byStatus: statusStats,
        topProjects: populatedProjectStats
      }
    });
  } catch (error) {
    console.error("Error fetching donation stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get project statistics
export const getProjectStats = async (req, res) => {
  try {
    // Get projects by status
    const statusStats = await Project.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalGoal: { $sum: "$goalAmount" },
          totalRaised: { $sum: "$raisedAmount" }
        }
      }
    ]);
    
    // Get projects by category
    const categoryStats = await Project.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalGoal: { $sum: "$goalAmount" },
          totalRaised: { $sum: "$raisedAmount" }
        }
      }
    ]);
    
    // Get recently created projects (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentStats = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        byStatus: statusStats,
        byCategory: categoryStats,
        recent: recentStats
      }
    });
  } catch (error) {
    console.error("Error fetching project stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};