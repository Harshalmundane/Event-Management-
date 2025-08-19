import { NextResponse } from "next/server"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import Registration from "@/models/Registration"
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

export async function GET(request) {
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

    // Fetch all registrations with populated user and event data
    const registrations = await Registration.find()
      .populate("userId", "name email")
      .populate("eventId", "title description date time location")
      .populate("approvedBy", "name email")
      .sort({ registrationDate: -1 })

    return NextResponse.json({
      message: "Registrations fetched successfully",
      registrations,
    })
  } catch (error) {
    console.error("Registrations fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
