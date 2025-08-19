import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Event from "@/models/Event";
import { ObjectId } from "mongodb";

// Cache the MongoDB connection
let isConnected = false;

export async function POST(request) {
  try {
    console.log("[v0] Payment processing started");

    // Validate Authorization header
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
    } catch (error) {
      console.log("[v0] Invalid or expired token");
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.log("[v0] Token verified for user:", decoded.userId);

    // Parse and validate request body
    const { eventId, amount, paymentData } = await request.json();
    if (!eventId || !amount || !paymentData) {
      console.log("[v0] Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate eventId format
    if (!ObjectId.isValid(eventId)) {
      console.log("[v0] Invalid eventId format");
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Validate amount
    const parsedAmount = Number.parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.log("[v0] Invalid amount");
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    // Connect to MongoDB
    if (!isConnected) {
      console.log("[v0] Connecting to database...");
      await connectDB();
      isConnected = true;
      console.log("[v0] Database connected successfully");
    }

    // Verify event exists and is paid
    const event = await Event.findById(eventId);
    console.log("[v0] Event found:", event ? { id: event._id, isFree: event.isFree, price: event.price } : "null");

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.isFree || event.price !== parsedAmount) {
      console.log("[v0] Payment amount mismatch:", {
        eventPrice: event.price,
        requestedAmount: parsedAmount,
        isFree: event.isFree,
      });
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    // Check for existing registration
    const existingRegistration = await Registration.findOne({
      userId: decoded.userId,
      eventId,
    });

    if (existingRegistration) {
      console.log("[v0] Duplicate registration detected");
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 });
    }

    // Process payment
    console.log("[v0] Processing payment...");
    const paymentSuccess = await processPayment(paymentData, parsedAmount);
    console.log("[v0] Payment result:", paymentSuccess);

    if (!paymentSuccess.success) {
      console.log("[v0] Payment failed:", paymentSuccess.error);
      return NextResponse.json({ error: paymentSuccess.error }, { status: 400 });
    }

    // Create registration
    const registration = new Registration({
      userId: decoded.userId,
      eventId,
      status: "pending",
      paymentStatus: "completed",
      paymentId: paymentSuccess.paymentId,
      amountPaid: parsedAmount,
      paymentDate: new Date(),
    });

    await registration.save();
    console.log("[v0] Registration created successfully");

    return NextResponse.json({
      message: "Payment successful and registration created",
      registrationId: registration._id,
      paymentId: paymentSuccess.paymentId,
    });
  } catch (error) {
    console.error("[v0] Payment processing error:", error.message);
    return NextResponse.json({ error: "Payment processing failed. Please try again." }, { status: 500 });
  }
}

// Mock payment processor (replace with real payment gateway in production)
async function processPayment(paymentData, amount) {
  // Basic validation
  if (
    !paymentData.cardNumber ||
    !paymentData.expiryDate ||
    !paymentData.cvv ||
    !paymentData.cardholderName
  ) {
    return { success: false, error: "Invalid payment data" };
  }

  // Additional validation (example)
  if (!/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ""))) {
    return { success: false, error: "Invalid card number" };
  }
  if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
    return { success: false, error: "Invalid expiry date format (MM/YY)" };
  }
  if (!/^\d{3,4}$/.test(paymentData.cvv)) {
    return { success: false, error: "Invalid CVV" };
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock success (90% success rate for demo)
  const success = Math.random() > 0.1;

  if (success) {
    return {
      success: true,
      paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  } else {
    return { success: false, error: "Payment declined" };
  }
}