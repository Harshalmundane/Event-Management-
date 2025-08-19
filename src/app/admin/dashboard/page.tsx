
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, LogOut, Bell } from "lucide-react"
import Link from "next/link"

// Define interfaces for type safety
interface Registration {
  id: string;
  event?: { title: string; date: string; time: string; location: string };
  status: "approved" | "pending" | "rejected";
  approvalDate?: string;
}

interface Stats {
  totalRegistered: number;
  approvedRegistrations: number;
  pendingRegistrations: number;
  rejectedRegistrations: number;
}

interface ApiResponse {
  stats: Stats;
  registrations: Registration[];
}

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [stats, setStats] = useState<Stats>({
    totalRegistered: 0,
    approvedRegistrations: 0,
    pendingRegistrations: 0,
    rejectedRegistrations: 0,
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
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data: ApiResponse = await response.json()
        setStats(data.stats)
        setRegistrations(data.registrations)
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
      const response = await fetch("/api/admin/registrations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data: ApiResponse = await response.json()
      if (response.ok) {
        // Count pending and recently updated registrations
        const pendingCount = data.registrations.filter((reg: Registration) => reg.status === "pending").length
        const recentlyUpdated = data.registrations.filter(
          (reg: Registration) =>
            reg.status !== "pending" &&
            reg.approvalDate &&
            new Date(reg.approvalDate) > new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
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
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <Badge variant="outline" className="ml-3">
                Administrator
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/notifications">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Admin!</h2>
            <p className="text-gray-600">
              Manage event registrations, payments, and create new events.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRegistered}</div>
                <p className="text-xs text-muted-foreground">Total registrations</p>
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
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRegistrations}</div>
                <p className="text-xs text-muted-foreground">Pending registrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejectedRegistrations}</div>
                <p className="text-xs text-muted-foreground">Rejected registrations</p>
              </CardContent>
            </Card>
          </div>

          {/* Registrations Section */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
              <CardDescription>Latest event registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {registrations.length > 0 ? (
                  registrations.slice(0, 5).map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{registration.event?.title || "N/A"}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(registration.event?.date)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {registration.event?.time || "N/A"}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {registration.event?.location || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(registration.status)}>{registration.status}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No registrations found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your events and registrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/admin/create-event">
                <Button className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Create New Event
                </Button>
              </Link>
              <Link href="/admin/registrations">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Registrations
                </Button>
              </Link>
              <Link href="/admin/payments">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Payments
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}