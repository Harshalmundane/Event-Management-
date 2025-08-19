import mongoose from "mongoose"

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String }, // URL to uploaded image
    maxParticipants: { type: Number, default: 100 },
    currentParticipants: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "cancelled", "completed"], default: "active" },
    isFree: { type: Boolean, default: true },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "USD" },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Event || mongoose.model("Event", EventSchema)
