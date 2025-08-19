import { NextResponse } from "next/server"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import Registration from "@/models/Registration"
import Event from "@/models/Event"
import User from "@/models/User"

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

export async function POST(request) {
  try {
    await connectDB()

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin
    const user = await User.findById(decoded.userId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const { registrationId, status, message } = await request.json()

    if (!registrationId || !status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 })
    }

    // Find the registration
    const registration = await Registration.findById(registrationId).populate("eventId")
    if (!registration) {
      return NextResponse.json({ message: "Registration not found" }, { status: 404 })
    }

    // Update registration status
    registration.status = status
    registration.approvedBy = decoded.userId
    registration.approvalDate = new Date()
    if (message) {
      registration.message = message
    }

    await registration.save()

    // If approved, increment event participant count
    if (status === "approved") {
      await Event.findByIdAndUpdate(registration.eventId._id, {
        $inc: { currentParticipants: 1 },
      })
    }

    return NextResponse.json({
      message: `Registration ${status} successfully`,
      registration,
    })
  } catch (error) {
    console.error("Registration approval error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
