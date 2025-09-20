import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  donor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Project", 
    required: true 
  },

  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: "INR" 
  },

  // Razorpay payment fields
  orderId: { 
    type: String, 
    required: true 
  }, // Razorpay order_id
  paymentId: { 
    type: String 
  }, // Razorpay payment_id (after success)
  signature: { 
    type: String 
  }, // Razorpay signature (for validation)

  status: { 
    type: String, 
    enum: ["created", "pending", "success", "failed"], 
    default: "created" 
  },

  receiptHash: { 
    type: String 
  } // optional: sha256 hash of donation details for audit/proof
}, { timestamps: true });

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
