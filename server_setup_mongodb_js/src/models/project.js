import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ["Education", "Health", "Environment", "Community", "Other"], required: true },
  goalAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },

  // Admin validation
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

  // Optional cover image
  images: [{ type: String }],
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);
export default Project;
