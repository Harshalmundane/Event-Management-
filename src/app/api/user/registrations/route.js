// src/app/api/user/registrations/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/models/Registration";
import "@/models/Event"; // Register Event model
import "@/models/User"; // Register User model

export async function GET(request) {
  try {
    await connectDB();

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Fetch user's registrations with populated event and user data
    const registrations = await Registration.find({ userId: decoded.userId })
      .populate("eventId", "title description date time location")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 }); // Changed to createdAt

    return NextResponse.json({
      message: "User registrations fetched successfully",
      registrations: registrations.map((reg) => ({
        id: reg._id,
        event: reg.eventId,
        status: reg.status,
        registeredAt: reg.createdAt,
        approvalDate: reg.approvalDate,
        adminMessage: reg.adminMessage,
        approvedBy: reg.approvedBy,
      })),
    });
  } catch (error) {
    console.error("User registrations fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}