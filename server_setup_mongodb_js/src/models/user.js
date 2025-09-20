import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
  {
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

    donationHistory: [
      {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        paymentId: { type: String }, // from Razorpay or mock payment gateway
      },
    ],

    followedProjects: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Project" }
    ],

    totalDonated: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },

    verificationOTP: String,
    otpExpiry: Date
  },
  { timestamps: true }
);

donorSchema.index({ email: 1, provider: 1 }, { unique: true });

const Donor =  mongoose.model("Donor", donorSchema);
export default Donor;
