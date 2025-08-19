import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodbdb"
import Registration from "@/models/Registration"

export async function GET(request) {
  try {
    console.log("[v0] User dashboard API called")

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    await connectDB()

    // Get user's registrations with event details
    const userRegistrations = await Registration.find({ userId: decoded.userId })
      .populate("eventId")
      .sort({ createdAt: -1 })

    // Get upcoming events user is registered for
    const upcomingEvents = userRegistrations.filter((reg) => reg.eventId && new Date(reg.eventId.date) >= new Date())

    // Get stats
    const totalRegistered = userRegistrations.length
    const approvedRegistrations = userRegistrations.filter((reg) => reg.status === "approved").length
    const upcomingCount = upcomingEvents.length

    return NextResponse.json({
      stats: {
        totalRegistered,
        approvedRegistrations,
        upcomingCount,
      },
      registrations: userRegistrations.map((reg) => ({
        id: reg._id,
        event: reg.eventId,
        status: reg.status,
        registeredAt: reg.createdAt,
        approvalDate: reg.approvalDate,
        adminMessage: reg.adminMessage,
      })),
    })
  } catch (error) {
    console.error("[v0] User dashboard error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
