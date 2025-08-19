"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, ArrowLeft, LogOut, Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/registrations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setNotifications(data.registrations)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "pending":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusMessage = (status) => {
    switch (status) {
      case "approved":
        return "Your registration has been approved! You can attend this event."
      case "rejected":
        return "Unfortunately, your registration was not approved."
      case "pending":
        return "Your registration is pending admin approval."
      default:
        return "Registration status unknown."
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
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
              <h1 className="text-xl font-semibold text-gray-900">My Notifications</h1>
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
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Bell className="w-6 h-6 mr-2" />
              Registration Status Updates
            </h2>
            <p className="text-gray-600">Stay updated on your event registration approvals and messages from admins.</p>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-600">You haven't registered for any events yet.</p>
              <Link href="/events" className="mt-4 inline-block">
                <Button>Browse Events</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {notifications.map((registration) => (
                <Card key={registration._id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(registration.status)}
                        <div className="flex-1">
                          <CardTitle className="text-lg">{registration.eventId.title}</CardTitle>
                          <CardDescription className="mt-1">{getStatusMessage(registration.status)}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(registration.status)}>{registration.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(registration.eventId.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {registration.eventId.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {registration.eventId.location}
                      </div>
                    </div>

                    {/* Admin Message */}
                    {registration.message && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Message from Admin:</h4>
                        <p className="text-blue-800">{registration.message}</p>
                      </div>
                    )}

                    {/* Registration Details */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Registered on: {new Date(registration.registrationDate).toLocaleDateString()}</span>
                        {registration.approvalDate && (
                          <span>
                            {registration.status === "approved" ? "Approved" : "Rejected"} on:{" "}
                            {new Date(registration.approvalDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action for Approved Events */}
                    {registration.status === "approved" && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-green-900">You're all set!</h4>
                            <p className="text-green-800 text-sm">
                              Your registration is confirmed. Don't forget to attend the event.
                            </p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                    )}
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
