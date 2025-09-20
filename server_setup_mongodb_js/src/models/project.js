import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ["Education", "Environment", "Health", "Community", "Other"], required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectCreator" },

  goalAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },

  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

  milestones: [
    {
      title: String,
      description: String,
      image: String, // cloudinary link
      createdAt: { type: Date, default: Date.now },
    }
  ],

  donations: [
    {
      donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" },
      amount: { type: Number },
      date: { type: Date, default: Date.now }
    }
  ],

  impactMetrics: {
    treesPlanted: { type: Number, default: 0 }, // Example metric
    mealsServed: { type: Number, default: 0 },
  },
}, { timestamps: true });



const Project =  mongoose.model("Project", projectSchema);
export default Project;
