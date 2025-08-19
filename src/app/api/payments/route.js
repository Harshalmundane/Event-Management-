import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Registration from "@/models/Registration";
import User from "@/models/User";
import Event from "@/models/Event"; // Explicitly import Event model
import { ObjectId } from "mongodb";

// Cache MongoDB connection
let isConnected = false;

export async function GET(request) {
  try {
    console.log("[v0] Fetching payments");

    // Validate authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[v0] No auth token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify JWT token
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded.userId) {
        console.log("[v0] Token missing userId");
        return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
      }
    } catch (error) {
      console.log("[v0] Invalid or expired token");
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.log("[v0] Token verified for user:", decoded.userId);

    // Connect to database
    if (!isConnected) {
      console.log("[v0] Connecting to database...");
      await connectDB();
      isConnected = true;
      console.log("[v0] Database connected successfully");
    }

    // Fetch payments for the authenticated user
    const payments = await Registration.find(
      { userId: decoded.userId },
      "eventId amountPaid paymentStatus paymentId paymentDate refundAmount refundDate refundId"
    )
      .populate({
        path: "eventId",
        select: "title date",
        model: Event,
      })
      .populate({
        path: "userId",
        select: "name email",
        model: User,
      });

    // Calculate stats with default values to handle null/undefined
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
      _id: payment._id,
      paymentId: payment.paymentId || "N/A",
      eventId: {
        title: payment.eventId?.title || "Unknown Event",
        date: payment.eventId?.date ? new Date(payment.eventId.date).toISOString() : null,
      },
      userId: {
        name: payment.userId?.name || "Unknown User",
        email: payment.userId?.email || "N/A",
      },
      amountPaid: payment.amountPaid || 0,
      paymentStatus: payment.paymentStatus || "unknown",
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString() : null,
      refundAmount: payment.refundAmount || 0,
      refundDate: payment.refundDate ? new Date(payment.refundDate).toISOString() : null,
      refundId: payment.refundId || null,
    }));

    return NextResponse.json({
      message: "Payments retrieved successfully",
      payments: formattedPayments,
      stats,
    });
  } catch (error) {
    console.error("[v0] Error fetching payments:", error.message);
    return NextResponse.json(
      { error: "Failed to retrieve payments. Please try again." },
      { status: 500 }
    );
  }
}