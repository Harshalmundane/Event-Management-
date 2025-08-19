import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Event from "@/models/Event"

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/eventmanager")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

export async function GET() {
  try {
    console.log("[v0] Fetching events request received")
    await connectDB()
    console.log("[v0] Database connected for events fetch")

    // Fetch all active events
    const events = await Event.find({ status: "active" }).populate("createdBy", "name email").sort({ date: 1 })
    console.log("[v0] Events found:", events.length)

    return NextResponse.json({
      message: "Events fetched successfully",
      events,
    })
  } catch (error) {
    console.error("[v0] Events fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
