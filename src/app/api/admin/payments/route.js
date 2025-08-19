import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Registration from "@/models/Registration"

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    // Get all payments with user and event details
    const payments = await Registration.find({
      paymentStatus: { $exists: true },
      amountPaid: { $gt: 0 },
    })
      .populate("userId", "name email")
      .populate("eventId", "title date location")
      .sort({ paymentDate: -1 })

    // Calculate stats
    const stats = {
      totalRevenue: 0,
      completedPayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
    }

    payments.forEach((payment) => {
      if (payment.paymentStatus === "completed") {
        stats.totalRevenue += payment.amountPaid || 0
        stats.completedPayments++
      } else if (payment.paymentStatus === "pending") {
        stats.pendingPayments++
      } else if (payment.paymentStatus === "failed") {
        stats.failedPayments++
      }
    })

    return NextResponse.json({ payments, stats })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
