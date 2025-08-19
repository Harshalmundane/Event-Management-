import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Registration from "@/models/Registration"

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

    // Fetch user's registrations with populated event data
    const registrations = await Registration.find({ userId: decoded.userId })
      .populate("eventId", "title description date time location")
      .populate("approvedBy", "name email")
      .sort({ registrationDate: -1 })

    return NextResponse.json({
      message: "User registrations fetched successfully",
      registrations,
    })
  } catch (error) {
    console.error("User registrations fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
