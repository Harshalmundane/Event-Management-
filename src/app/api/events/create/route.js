import { NextResponse } from "next/server"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
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
    console.log("[v0] Event creation request received")
    await connectDB()
    console.log("[v0] Database connected successfully")

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    console.log("[v0] Auth header:", authHeader ? "Present" : "Missing")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[v0] No valid authorization header found")
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    console.log("[v0] Token extracted, length:", token.length)

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
      console.log("[v0] Token decoded successfully, userId:", decoded.userId)
    } catch (error) {
      console.log("[v0] Token verification failed:", error.message)
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin
    const user = await User.findById(decoded.userId)
    console.log("[v0] User found:", user ? `${user.name} (${user.role})` : "Not found")

    if (!user || user.role !== "admin") {
      console.log("[v0] Access denied - user is not admin")
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const title = formData.get("title")
    const description = formData.get("description")
    const date = formData.get("date")
    const time = formData.get("time")
    const location = formData.get("location")
    const maxParticipants = formData.get("maxParticipants")
    const imageFile = formData.get("image")
    const isFree = formData.get("isFree") === "true"
    const price = formData.get("price")
    const currency = formData.get("currency") || "USD"

    console.log("[v0] Form data received:", { title, date, time, location, maxParticipants, isFree, price, currency })

    // Validate required fields
    if (!title || !description || !date || !time || !location) {
      return NextResponse.json({ message: "All required fields must be filled" }, { status: 400 })
    }

    // Handle image upload (for now, we'll store a placeholder)
    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      // In a real app, you'd upload to a service like Cloudinary or AWS S3
      // For now, we'll use a placeholder
      imageUrl = `/placeholder.svg?height=300&width=500&query=${encodeURIComponent(title + " event")}`
    }

    // Create new event
    const newEvent = new Event({
      title,
      description,
      date: new Date(date),
      time,
      location,
      image: imageUrl,
      maxParticipants: maxParticipants ? Number.parseInt(maxParticipants) : 100,
      createdBy: decoded.userId,
      isFree,
      price: isFree ? 0 : Number.parseFloat(price) || 0,
      currency,
    })

    await newEvent.save()
    console.log("[v0] Event created successfully:", newEvent._id)

    return NextResponse.json({
      message: "Event created successfully",
      event: newEvent,
    })
  } catch (error) {
    console.error("[v0] Event creation error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
