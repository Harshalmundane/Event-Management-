"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, Lock, Calendar, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get("eventId")
  const amount = searchParams.get("amount")

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState("")
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  useEffect(() => {
    if (eventId) {
      fetchEventDetails()
    }
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      const data = await response.json()
      if (response.ok) {
        setEvent(data.event)
      }
    } catch (error) {
      console.error("Error fetching event details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPaymentData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setMessage("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId,
          amount: Number.parseFloat(amount),
          paymentData,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Payment successful! Registration completed.")
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 2000)
      } else {
        setMessage(data.message || "Payment failed")
      }
    } catch (error) {
      setMessage("Payment processing error. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const formatPrice = (price, currency = "USD") => {
    const symbols = { USD: "$", EUR: "€", GBP: "£", INR: "₹" }
    return `${symbols[currency] || "$"}${price.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event not found</h2>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
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
              <Link href="/events" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Payment</h1>
              <Badge variant="outline" className="ml-3">
                Secure Checkout
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Review your registration details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <p className="text-gray-600">{event.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(Number.parseFloat(amount), event.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Secure Payment
                </CardTitle>
                <CardDescription>Enter your payment information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      name="cardholderName"
                      type="text"
                      required
                      value={paymentData.cardholderName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      required
                      value={paymentData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        type="text"
                        required
                        value={paymentData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        type="text"
                        required
                        value={paymentData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  {message && (
                    <div
                      className={`p-3 rounded-md ${
                        message.includes("successful")
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <Button type="submit" disabled={processing} className="w-full">
                    {processing ? (
                      "Processing Payment..."
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay {formatPrice(Number.parseFloat(amount), event.currency)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">Your payment information is secure and encrypted</p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
