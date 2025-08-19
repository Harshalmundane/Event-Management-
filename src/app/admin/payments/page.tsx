
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Search, Download, DollarSign, CreditCard, RefreshCw, LogOut } from "lucide-react"
import Link from "next/link"

// Define interfaces for type safety
interface Payment {
  _id: string;
  eventId?: { title: string; date: string };
  userId?: { name: string; email: string };
  paymentId?: string;
  amountPaid: number;
  paymentStatus: "completed" | "pending" | "failed" | "refunded";
  paymentDate?: string;
  refundAmount?: number;
  refundDate?: string;
  refundId?: string;
}

interface Stats {
  totalRevenue: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalRefunded: number;
}

interface ApiResponse {
  payments: Payment[];
  stats: Stats;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending" | "failed" | "refunded">("all")
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    refundedPayments: 0,
    totalRefunded: 0,
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter])

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("[v0] Token from localStorage:", token ? "Token exists" : "No token found")

      const response = await fetch("/api/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("[v0] API Response status:", response.status)
      console.log("[v0] API Response ok:", response.ok)

      if (response.ok) {
        const data: ApiResponse = await response.json()
        console.log("[v0] API Response data:", data)
        setPayments(data.payments)
        setStats(data.stats)
      } else {
        console.log("[v0] API Error response:", await response.text())
      }
    } catch (error) {
      console.error("[v0] Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = [...payments]

    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.eventId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.paymentStatus === statusFilter)
    }

    setFilteredPayments(filtered)
  }

  const handleRefund = async (registrationId: string, amount: number) => {
    if (!confirm(`Are you sure you want to refund $${amount.toFixed(2)}?`)) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/payments/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ registrationId, amount }),
      })

      if (response.ok) {
        fetchPayments() // Refresh data
      }
    } catch (error) {
      console.error("Error processing refund:", error)
    }
  }

  const exportPayments = () => {
    const csvContent = [
      ["Date", "Event", "User", "Email", "Amount", "Status", "Refund Info", "Payment ID"].join(","),
      ...filteredPayments.map((payment) =>
        [
          payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "N/A",
          payment.eventId?.title || "N/A",
          payment.userId?.name || "N/A",
          payment.userId?.email || "N/A",
          payment.amountPaid || 0,
          payment.paymentStatus,
          payment.paymentStatus === "refunded" && payment.refundDate
            ? `${formatPrice(payment.refundAmount || 0)}, ${new Date(payment.refundDate).toLocaleDateString()}, ID: ${payment.refundId || "N/A"}`
            : "-",
          payment.paymentId || "N/A",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatPrice = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
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
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Payment Management</h1>
              <Badge variant="secondary" className="ml-3">
                Administrator
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={exportPayments} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">All completed payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CreditCard className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedPayments}</div>
                <p className="text-xs text-muted-foreground">Successful payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <RefreshCw className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                <p className="text-xs text-muted-foreground">Awaiting processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <CreditCard className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.failedPayments}</div>
                <p className="text-xs text-muted-foreground">Failed transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Refunded</CardTitle>
                <RefreshCw className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(stats.totalRefunded)}</div>
                <p className="text-xs text-muted-foreground">{stats.refundedPayments} refunds</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by event, user, email, or payment ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Payment Status</Label>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "all" | "completed" | "pending" | "failed" | "refunded")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payment transactions for your events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Event</th>
                      <th className="text-left p-2">User</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Refund Info</th>
                      <th className="text-left p-2">Payment ID</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => (
                        <tr key={payment._id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{payment.eventId?.title || "N/A"}</p>
                              <p className="text-sm text-gray-500">
                                {payment.eventId?.date ? new Date(payment.eventId.date).toLocaleDateString() : ""}
                              </p>
                            </div>
                          </td>
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{payment.userId?.name || "N/A"}</p>
                              <p className="text-sm text-gray-500">{payment.userId?.email || "N/A"}</p>
                            </div>
                          </td>
                          <td className="p-2 font-medium">{formatPrice(payment.amountPaid || 0)}</td>
                          <td className="p-2">
                            <Badge className={getStatusColor(payment.paymentStatus)}>{payment.paymentStatus}</Badge>
                          </td>
                          <td className="p-2">
                            {payment.paymentStatus === "refunded" && payment.refundDate ? (
                              <div className="text-sm">
                                <p className="font-medium text-blue-600">{formatPrice(payment.refundAmount || 0)}</p>
                                <p className="text-gray-500">{new Date(payment.refundDate).toLocaleDateString()}</p>
                                {payment.refundId && <p className="text-xs text-gray-400">ID: {payment.refundId}</p>}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-2 text-sm text-gray-600">{payment.paymentId || "N/A"}</td>
                          <td className="p-2">
                            {payment.paymentStatus === "completed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRefund(payment._id, payment.amountPaid)}
                              >
                                Refund
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-gray-500">
                          No payments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}