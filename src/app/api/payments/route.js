import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/models/Registration";
import User from "@/models/User"; // Import your User model

export async function GET(request) {
  try {
    // Validate authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify JWT token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    // Connect to database
    await connectDB();

    // Fetch payments for the authenticated user
    const payments = await Registration.find(
      { userId: decoded.userId },
      "eventId amountPaid paymentStatus paymentId paymentDate refundAmount refundDate refundId"
    )
      .populate("eventId", "title date")
      .populate("userId", "name email");

    // Calculate stats
    const stats = {
      totalRevenue: payments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0),
      completedPayments: payments.filter((p) => p.paymentStatus === "completed").length,
      pendingPayments: payments.filter((p) => p.paymentStatus === "pending").length,
      failedPayments: payments.filter((p) => p.paymentStatus === "failed").length,
      refundedPayments: payments.filter((p) => p.paymentStatus === "refunded").length,
      totalRefunded: payments.reduce((sum, payment) => sum + (payment.refundAmount || 0), 0),
    };

    // Format payments response
    const formattedPayments = payments.map((payment) => ({
      _id: payment._id, // Needed for handleRefund
      paymentId: payment.paymentId,
      eventId: {
        title: payment.eventId?.title || "Unknown Event",
        date: payment.eventId?.date || null,
      },
      userId: {
        name: payment.userId?.name || "Unknown User",
        email: payment.userId?.email || "N/A",
      },
      amountPaid: payment.amountPaid || 0,
      paymentStatus: payment.paymentStatus,
      paymentDate: payment.paymentDate,
      refundAmount: payment.refundAmount || 0,
      refundDate: payment.refundDate || null,
      refundId: payment.refundId || null,
    }));

    return NextResponse.json({
      message: "Payments retrieved successfully",
      payments: formattedPayments,
      stats,
    });
  } catch (error) {
    console.error("[v0] Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to retrieve payments. Please try again." },
      { status: 500 }
    );
  }
}