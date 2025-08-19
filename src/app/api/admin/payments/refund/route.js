import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Registration from "@/models/Registration"

export async function POST(request) {
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

    const { registrationId, amount } = await request.json()

    await connectDB()

    const registration = await Registration.findById(registrationId)
    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    if (registration.paymentStatus !== "completed") {
      return NextResponse.json({ error: "Cannot refund non-completed payment" }, { status: 400 })
    }

    // Simulate refund processing (replace with actual payment gateway)
    const refundSuccess = await processRefund(registration.paymentId, amount)

    if (!refundSuccess.success) {
      return NextResponse.json({ error: refundSuccess.error }, { status: 400 })
    }

    // Update registration with refund info
    registration.paymentStatus = "refunded"
    registration.refundId = refundSuccess.refundId
    registration.refundDate = new Date()
    registration.refundAmount = amount
    registration.status = "rejected" // Cancel the registration

    await registration.save()

    return NextResponse.json({
      message: "Refund processed successfully",
      refundId: refundSuccess.refundId,
    })
  } catch (error) {
    console.error("Refund processing error:", error)
    return NextResponse.json({ error: "Refund processing failed" }, { status: 500 })
  }
}

// Simulate refund processing (replace with actual payment gateway)
async function processRefund(paymentId, amount) {
  // This is a mock refund processor
  // In production, integrate with Stripe, PayPal, or other payment gateways

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock success (95% success rate for demo)
  const success = Math.random() > 0.05

  if (success) {
    return {
      success: true,
      refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  } else {
    return { success: false, error: "Refund processing failed" }
  }
}
