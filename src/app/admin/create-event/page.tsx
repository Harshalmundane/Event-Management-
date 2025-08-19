"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Upload, Calendar, MapPin, Users, Clock, LogOut, DollarSign } from "lucide-react"
import Link from "next/link"

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxParticipants: "",
    image: null as File | null,
    isFree: true,
    price: "",
    currency: "USD",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] Create Event page loaded successfully")

    const checkAuthentication = () => {
      setTimeout(() => {
        const token = localStorage.getItem("token")
        const userRole = localStorage.getItem("userRole")

        console.log("[v0] Token exists:", !!token)
        console.log("[v0] User role:", userRole)

        if (!token) {
          console.log("[v0] No token found, redirecting to signin")
          window.location.href = "/signin"
          return
        }

        if (userRole !== "admin") {
          console.log("[v0] User is not admin, redirecting to signin")
          window.location.href = "/signin"
          return
        }

        console.log("[v0] Admin authentication successful")
        setIsAuthenticated(true)
        setIsLoading(false)
      }, 100)
    }

    checkAuthentication()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "price" && value && Number.parseFloat(value) > 0 ? { isFree: false } : {}),
    }))
  }

  const handlePricingToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isFree: checked,
      price: checked ? "0" : prev.price,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    console.log("[v0] Form submission started")
    console.log("[v0] Form data:", formData)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("date", formData.date)
      formDataToSend.append("time", formData.time)
      formDataToSend.append("location", formData.location)
      formDataToSend.append("maxParticipants", formData.maxParticipants)

      const eventPrice = Number.parseFloat(formData.price) || 0
      const isEventFree = formData.isFree && eventPrice === 0

      formDataToSend.append("isFree", isEventFree.toString())
      formDataToSend.append("price", eventPrice.toString())
      formDataToSend.append("currency", formData.currency)
      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }

      const token = localStorage.getItem("token")
      console.log("[v0] Sending request to /api/events/create")

      const response = await fetch("/api/events/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()
      console.log("[v0] API response:", data)

      if (response.ok) {
        setMessage("Event created successfully!")
        console.log("[v0] Event created successfully")
        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          maxParticipants: "",
          image: null,
          isFree: true,
          price: "",
          currency: "USD",
        })
        setImagePreview(null)
        setTimeout(() => {
          window.location.href = "/admin/dashboard"
        }, 2000)
      } else {
        console.log("[v0] API error:", data.message)
        setMessage(data.message || "Failed to create event")
      }
    } catch (error) {
      console.log("[v0] Network error:", error)
      setMessage("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  console.log("[v0] Rendering Create Event page")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Create New Event</h1>
              <Badge variant="secondary" className="ml-3">
                Administrator
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
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Event Details
              </CardTitle>
              <CardDescription>Fill in the information below to create a new event</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter event title"
                  />
                </div>

                {/* Event Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Event Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your event..."
                    rows={4}
                  />
                </div>

                {/* Date and Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Event Date *
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Event Time *
                    </Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      required
                      value={formData.time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Location and Max Participants Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Location *
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Event location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants" className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Max Participants
                    </Label>
                    <Input
                      id="maxParticipants"
                      name="maxParticipants"
                      type="number"
                      min="1"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      placeholder="100"
                    />
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center text-base font-medium">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Event Pricing
                      </Label>
                      <p className="text-sm text-gray-600">Set whether this event is free or requires payment</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="isFree" className="text-sm">
                        Free Event
                      </Label>
                      <Switch id="isFree" checked={formData.isFree} onCheckedChange={handlePricingToggle} />
                    </div>
                  </div>

                  {!formData.isFree && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Event Price *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          required={!formData.isFree}
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <select
                          id="currency"
                          name="currency"
                          value={formData.currency}
                          onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="INR">INR (₹)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image" className="flex items-center">
                    <Upload className="w-4 h-4 mr-1" />
                    Event Image
                  </Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Event preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                {/* Message Display */}
                {message && (
                  <div
                    className={`p-3 rounded-md ${
                      message.includes("successfully")
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Link href="/admin/dashboard">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
