import mongoose from "mongoose";

const projectCreatorSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      minlength: 6,
      select: false,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    providerId: {
      type: String,
      sparse: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
  organization: { type: String }, // optional (e.g., NGO, community group)

  projects: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Project" }
  ],

  verified: { type: Boolean, default: false }, // set true after admin verifies

  status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },

    verificationOTP: String,
    otpExpiry: Date
}, { timestamps: true });



const ProjectCreator =  mongoose.model("ProjectCreator", projectCreatorSchema);
export default ProjectCreator;
