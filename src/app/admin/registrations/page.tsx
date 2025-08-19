"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, LogOut, Check, X, MessageSquare, Calendar, User, Mail } from "lucide-react"
import Link from "next/link"

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [message, setMessage] = useState("")
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [adminMessage, setAdminMessage] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/registrations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setRegistrations(data.registrations)
      }
    } catch (error) {
      console.error("Error fetching registrations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (registrationId, status, message = "") => {
    setProcessing(registrationId)
    setMessage("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/registrations/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registrationId,
          status,
          message,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Registration ${status} successfully!`)
        fetchRegistrations() // Refresh the list
        setDialogOpen(false)
        setAdminMessage("")
        setSelectedRegistration(null)
      } else {
        setMessage(data.message || `Failed to ${status} registration`)
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setProcessing(null)
    }
  }

  const openMessageDialog = (registration, status) => {
    setSelectedRegistration({ ...registration, actionStatus: status })
    setDialogOpen(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registrations...</p>
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
              <Link href="/admin/dashboard" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Registration Management</h1>
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

          {/* Registrations List */}
          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
              <p className="text-gray-600">No users have registered for events yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {registrations.map((registration) => (
                <Card key={registration._id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center">
                          <Calendar className="w-5 h-5 mr-2" />
                          {registration.eventId.title}
                        </CardTitle>
                        <CardDescription className="mt-2">{registration.eventId.description}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(registration.status)}>{registration.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* User Information */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          User Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium w-16">Name:</span>
                            <span>{registration.userId.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            <span className="font-medium w-16">Email:</span>
                            <span>{registration.userId.email}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium w-20">Registered:</span>
                            <span>{formatDate(registration.registrationDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Event Information */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Event Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium w-16">Date:</span>
                            <span>{formatDate(registration.eventId.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium w-16">Time:</span>
                            <span>{registration.eventId.time}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium w-16">Location:</span>
                            <span>{registration.eventId.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Admin Message */}
                    {registration.message && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <h5 className="font-medium text-blue-900 mb-1">Admin Message:</h5>
                        <p className="text-blue-800 text-sm">{registration.message}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {registration.status === "pending" && (
                      <div className="flex justify-end space-x-3 mt-6">
                        <Button
                          onClick={() => openMessageDialog(registration, "rejected")}
                          variant="outline"
                          size="sm"
                          disabled={processing === registration._id}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => openMessageDialog(registration, "approved")}
                          size="sm"
                          disabled={processing === registration._id}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {processing === registration._id ? "Processing..." : "Approve"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Message Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              {selectedRegistration?.actionStatus === "approved" ? "Approve" : "Reject"} Registration
            </DialogTitle>
            <DialogDescription>
              Send a message to {selectedRegistration?.userId.name} about their registration for{" "}
              {selectedRegistration?.eventId.title}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder={
                  selectedRegistration?.actionStatus === "approved"
                    ? "Congratulations! Your registration has been approved..."
                    : "We're sorry, but your registration could not be approved..."
                }
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  handleApproval(selectedRegistration._id, selectedRegistration.actionStatus, adminMessage)
                }
                disabled={processing === selectedRegistration?._id}
              >
                {processing === selectedRegistration?._id
                  ? "Processing..."
                  : selectedRegistration?.actionStatus === "approved"
                    ? "Approve Registration"
                    : "Reject Registration"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
