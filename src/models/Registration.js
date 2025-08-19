import mongoose from "mongoose"

const RegistrationSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    registrationDate: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalDate: { type: Date },
    message: { type: String }, // Admin message for approval/rejection
    paymentStatus: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
    paymentId: { type: String }, // Payment gateway transaction ID
    amountPaid: { type: Number, default: 0 },
    paymentDate: { type: Date },
    paymentMethod: { type: String }, // card, paypal, etc.
    refundId: { type: String }, // Refund transaction ID if applicable
    refundDate: { type: Date },
    refundAmount: { type: Number },
  },
  {
    timestamps: true,
  },
)

// Ensure one registration per user per event
RegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true })

export default mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema)
