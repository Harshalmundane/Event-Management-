"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, LogOut, Bell } from "lucide-react"
import Link from "next/link"

// Define the Registration interface
interface Registration {
  id: string
  status: "approved" | "pending" | "rejected"
  approvalDate?: string
  event?: {
    title: string
    date: string
    time: string
    location: string
  }
}

// Define the Stats interface
interface DashboardStats {
  totalRegistered: number
  approvedRegistrations: number
  upcomingCount: number
}

export default function UserDashboard() {
  const [userRegistrations, setUserRegistrations] = useState<Registration[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistered: 0,
    approvedRegistrations: 0,
    upcomingCount: 0,
  })
  const [notificationCount, setNotificationCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchNotificationCount()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setUserRegistrations(data.registrations)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/registrations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        // Count pending and recently updated registrations
        const pendingCount = data.registrations.filter((reg: Registration) => reg.status === "pending").length
        const recentlyUpdated = data.registrations.filter(
          (reg: Registration) =>
            reg.status !== "pending" &&
            reg.approvalDate &&
            new Date(reg.approvalDate) > new Date(Date.now() - 24 * 60 * 60 * 1000),
        ).length
        setNotificationCount(pendingCount + recentlyUpdated)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <h1 className="text-xl font-semibold text-gray-900">My Dashboard</h1>
              <Badge variant="outline" className="ml-3">
                User
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/notifications">
                <Button variant="outline" size="sm" className="relative bg-transparent">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 px-1 py-0 text-xs min-w-[1.25rem] h-5">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
            <p className="text-gray-600">
              Manage your event registrations and stay updated with the latest activities.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRegistered}</div>
                <p className="text-xs text-muted-foreground">Events registered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approvedRegistrations}</div>
                <p className="text-xs text-muted-foreground">Approved registrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingCount}</div>
                <p className="text-xs text-muted-foreground">Upcoming events</p>
              </CardContent>
            </Card>
          </div>

          {/* Events Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>My Registrations</CardTitle>
                <CardDescription>Events you registered for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userRegistrations.length > 0 ? (
                    userRegistrations.slice(0, 3).map((registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{registration.event?.title || "No event title"}</h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {registration.event?.date ? formatDate(registration.event.date) : "No date"}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {registration.event?.time || "No time"}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {registration.event?.location || "No location"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(registration.status)}>{registration.status}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No event registrations yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>What would you like to do?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/events">
                  <Button className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Browse Events
                  </Button>
                </Link>
                <Link href="/notifications">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Bell className="w-4 h-4 mr-2" />
                    My Notifications
                    {notificationCount > 0 && (
                      <Badge className="ml-auto px-1 py-0 text-xs min-w-[1.25rem] h-5">{notificationCount}</Badge>
                    )}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}