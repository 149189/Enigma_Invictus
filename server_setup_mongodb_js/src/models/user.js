import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
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
      unique: true
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

    avatar: {
      type: String,
    },

    // user account control
    status: {
      type: String,
      enum: ["active", "banned"],
      default: "active",
    },

    // optional OTP login/verification fields
    verificationOTP: String,
    otpExpiry: Date
  },
  { timestamps: true }
);

// Ensure unique (email + provider) combination
userSchema.index({ email: 1, provider: 1 }, { unique: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
