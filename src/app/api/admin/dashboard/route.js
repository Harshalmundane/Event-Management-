import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Event from "@/models/Event";
import Registration from "@/models/Registration";

export async function GET(request) {
  try {
    console.log("[v0] Admin dashboard API called");

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectDB();

    // Get admin's events and stats
    const adminEvents = await Event.find({ createdBy: decoded.userId });
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({
      date: { $gte: new Date() },
    });
    const pendingApprovals = await Registration.countDocuments({
      status: "pending",
    });

    // Get admin's events with registration counts
    const eventsWithRegistrations = await Promise.all(
      adminEvents.map(async (event) => {
        const registrationCount = await Registration.countDocuments({
          eventId: event._id,
        });
        const pendingCount = await Registration.countDocuments({
          eventId: event._id,
          status: "pending",
        });
        return {
          ...event.toObject(),
          registrationCount,
          pendingCount,
        };
      })
    );

    // Get recent activities
    const recentRegistrations = await Registration.find()
      .populate("userId", "name email")
      .populate("eventId", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivities = recentRegistrations.map((reg) => ({
      type: "registration",
      message: `${reg.userId.name} registered for ${reg.eventId.title}`,
      time: reg.createdAt,
      status: reg.status,
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        totalEvents,
        activeEvents,
        pendingApprovals,
      },
      adminEvents: eventsWithRegistrations,
      recentActivities,
    });
  } catch (error) {
    console.error("[v0] Admin dashboard error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}