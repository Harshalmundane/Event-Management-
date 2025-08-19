import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Registration from "@/models/Registration"
import jwt from "jsonwebtoken"

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return decoded
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    await connectDB()

    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }
    }

    const registrations = await Registration.find(dateFilter)

    const analytics = {
      totalRegistrations: registrations.length,
      approvedRegistrations: registrations.filter((r) => r.status === "approved").length,
      completedPayments: registrations.filter((r) => r.paymentStatus === "completed").length,
      refundedPayments: registrations.filter((r) => r.paymentStatus === "refunded").length,
      totalRevenue: registrations
        .filter((r) => r.paymentStatus === "completed")
        .reduce((sum, r) => sum + (r.amountPaid || 0), 0),
      totalRefunded: registrations
        .filter((r) => r.paymentStatus === "refunded")
        .reduce((sum, r) => sum + (r.refundAmount || 0), 0),
    }

    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}
