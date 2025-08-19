import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import User from "@/models/User"

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/eventmanager")
  } catch (error) {
    console.error("Database connection error:", error)
    throw new Error("Database connection failed")
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    // Create response
    const response = NextResponse.json(
      {
        message: "Sign in successful",
        token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 },
    )

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return response
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ message: "Internal server error: " + error.message }, { status: 500 })
  }
}
