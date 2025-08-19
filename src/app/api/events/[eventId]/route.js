import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodbdb"
import Event from "@/models/Event"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const { eventId } = await params
    const event = await Event.findById(eventId)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
