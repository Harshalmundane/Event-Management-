import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import connectDB from '@/lib/mongodb';
import Registration from "@/models/Registration"
import Event from "@/models/Event"

export async function POST(request) {
  try {
    console.log("[v0] Payment processing started")

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[v0] No auth token provided")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    console.log("[v0] Token verified for user:", decoded.userId)

    const { eventId, amount, paymentData } = await request.json()
    console.log("[v0] Payment request:", { eventId, amount })

    console.log("[v0] Connecting to database...")
    await connectDB()
    console.log("[v0] Database connected successfully")

    // Verify event exists and is paid
    const event = await Event.findById(eventId)
    console.log("[v0] Event found:", event ? { id: event._id, isFree: event.isFree, price: event.price } : "null")

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.isFree || event.price !== amount) {
      console.log("[v0] Payment amount mismatch:", {
        eventPrice: event.price,
        requestedAmount: amount,
        isFree: event.isFree,
      })
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 })
    }

    // Check if user already registered
    const existingRegistration = await Registration.findOne({
      userId: decoded.userId,
      eventId: eventId,
    })

    if (existingRegistration) {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 })
    }

    // Processing payment...
    console.log("[v0] Processing payment...")
    const paymentSuccess = await processPayment(paymentData, amount)
    console.log("[v0] Payment result:", paymentSuccess)

    if (!paymentSuccess.success) {
      console.log("[v0] Payment failed:", paymentSuccess.error)
      return NextResponse.json({ error: paymentSuccess.error }, { status: 400 })
    }

    // Create registration with payment info
    const registration = new Registration({
      userId: decoded.userId,
      eventId: eventId,
      status: "pending",
      paymentStatus: "completed",
      paymentId: paymentSuccess.paymentId,
      amountPaid: amount,
      paymentDate: new Date(),
    })

    await registration.save()

    console.log("[v0] Registration created successfully")
    return NextResponse.json({
      message: "Payment successful and registration created",
      registrationId: registration._id,
      paymentId: paymentSuccess.paymentId,
    })
  } catch (error) {
    console.error("[v0] Payment processing error:", error)
    return NextResponse.json({ error: "Payment processing failed. Please try again." }, { status: 500 })
  }
}

// Simulate payment processing (replace with actual Stripe/PayPal integration)
async function processPayment(paymentData, amount) {
  // This is a mock payment processor
  // In production, integrate with Stripe, PayPal, or other payment gateways

  // Basic validation
  if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
    return { success: false, error: "Invalid payment data" }
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock success (90% success rate for demo)
  const success = Math.random() > 0.1

  if (success) {
    return {
      success: true,
      paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  } else {
    return { success: false, error: "Payment declined" }
  }
}
