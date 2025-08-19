// pages/api/signup.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongo";
import User from "@/models/User";

export async function POST(request) {
  try {
    console.log("[v0] Signup API called");
    await connectDB();

    const { name, email, password, role, adminCode } = await request.json();
    console.log("[v0] Received signup data:", { name, email, role });

    if (!name || !email || !password) {
      console.log("[v0] Missing required fields");
      return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 });
    }

    if (role === "admin") {
      const validAdminCode = process.env.ADMIN_CODE || "ADMIN123";
      if (!adminCode || adminCode !== validAdminCode) {
        console.log("[v0] Invalid admin code provided");
        return NextResponse.json({ message: "Invalid admin code" }, { status: 400 });
      }
    }

    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      console.log("[v0] User already exists with email:", emailLower);
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("[v0] Password hashed successfully");

    const newUser = new User({
      name,
      email: emailLower,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();
    console.log("[v0] User created successfully:", newUser._id);

    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Signup error:", error);
    return NextResponse.json({ message: "Internal server error: " + error.message }, { status: 500 });
  }
}