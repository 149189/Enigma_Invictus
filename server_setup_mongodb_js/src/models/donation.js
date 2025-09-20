import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String }, // from Razorpay or gateway
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
}, { timestamps: true });

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
