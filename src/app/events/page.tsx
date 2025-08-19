"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, LogOut, ArrowLeft, DollarSign, CreditCard } from "lucide-react"
import Link from "next/link"

// Define the Event interface
interface Event {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  currentParticipants: number
  maxParticipants: number
  status: string
  isFree: boolean
  price: number
  currency?: string
  image?: string
}

// Define the currency type
type Currency = "USD" | "EUR" | "GBP" | "INR"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events")
      const data = await response.json()
      if (response.ok) {
        setEvents(data.events)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (eventId: string, isFree: boolean = true, price: number = 0) => {
    setRegistering(eventId)
    setMessage("")

    try {
      const token = localStorage.getItem("token")

      if (!isFree && price > 0) {
        // For paid events, redirect to payment page
        window.location.href = `/payment?eventId=${eventId}&amount=${price}`
        return
      }

      // For free events, proceed with direct registration
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Registration submitted successfully! Waiting for admin approval.")
        // Refresh events to update registration status
        fetchEvents()
      } else {
        setMessage(data.message || "Registration failed")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setRegistering(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatPrice = (price: number, currency: Currency = "USD") => {
    const symbols: Record<Currency, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
    }
    return `${symbols[currency] || "$"}${price.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Browse Events</h1>
              <Badge variant="outline" className="ml-3">
                User
              </Badge>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Message Display */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-md ${
                message.includes("successfully")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Events Grid */}
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events available</h3>
              <p className="text-gray-600">Check back later for upcoming events!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {event.image && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={event.image || "/placeholder.svg?height=200&width=400"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant="outline" className="ml-2">
                          {event.status}
                        </Badge>
                        {event.isFree ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Free
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {formatPrice(event.price, event.currency as Currency)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {event.currentParticipants}/{event.maxParticipants} participants
                      </div>
                      {!event.isFree && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Registration Fee: {formatPrice(event.price, event.currency as Currency)}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleRegister(event._id, event.isFree, event.price)}
                      disabled={registering === event._id || event.currentParticipants >= event.maxParticipants}
                      className="w-full"
                    >
                      {registering === event._id ? (
                        "Processing..."
                      ) : event.currentParticipants >= event.maxParticipants ? (
                        "Event Full"
                      ) : event.isFree ? (
                        "Register for Free"
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay & Register ({formatPrice(event.price, event.currency as Currency)})
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}