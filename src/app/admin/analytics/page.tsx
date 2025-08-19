"use client"; // Mark as a Client Component

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, DollarSign, Users, BarChart3, LogOut } from "lucide-react";
import Link from "next/link";

// Define the shape of the dateRange state
interface DateRange {
  startDate: string; // Using string since input type="date" returns strings
  endDate: string;
}

// Define the shape of the analytics data
interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    conversionRate: number;
  };
  revenueByMonth: Array<{ month: string; transactions: number; revenue: number }>;
  topEvents: Array<{ title: string; registrations: number; averagePrice: number; totalRevenue: number }>;
  paymentMethods: Array<{ method: string; count: number; percentage: number }>;
  recentTrends: Array<{ title: string; description: string; value: string; type: "positive" | "negative" | "neutral" }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: {
      totalRevenue: 0,
      totalTransactions: 0,
      averageTransactionValue: 0,
      conversionRate: 0,
    },
    revenueByMonth: [],
    topEvents: [],
    paymentMethods: [],
    recentTrends: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
    endDate: new Date().toISOString().split("T")[0], // today
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/admin/analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data); // Match the API response structure { success: true, data: {...} }
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field: keyof DateRange, value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const formatPrice = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`; // Fixed the syntax error
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
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
              <h1 className="text-xl font-semibold text-gray-900">Payment Analytics</h1>
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
          {/* Date Range Filter */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
              <CardDescription>Select date range for analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateChange("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateChange("endDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(analytics.overview.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">In selected period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">Completed payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(analytics.overview.averageTransactionValue)}</div>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(analytics.overview.conversionRate)}</div>
                <p className="text-xs text-muted-foreground">Registration to payment</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            {/* Revenue by Month */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.revenueByMonth.length > 0 ? (
                    analytics.revenueByMonth.map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium">{month.month}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">{month.transactions} transactions</span>
                          <span className="font-semibold">{formatPrice(month.revenue)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No revenue data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Events */}
            <Card>
              <CardHeader>
                <CardTitle>Top Events by Revenue</CardTitle>
                <CardDescription>Highest earning events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topEvents.length > 0 ? (
                    analytics.topEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>{event.registrations} registrations</span>
                            <span>{formatPrice(event.averagePrice)} avg price</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{formatPrice(event.totalRevenue)}</div>
                          <div className="text-xs text-gray-500">#{index + 1}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No event data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods and Recent Trends */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.paymentMethods.length > 0 ? (
                    analytics.paymentMethods.map((method, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                          ></div>
                          <span className="text-sm font-medium capitalize">{method.method || "Card"}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">{method.count} transactions</span>
                          <span className="font-semibold">{formatPercentage(method.percentage)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No payment method data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Trends</CardTitle>
                <CardDescription>Key insights and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentTrends.length > 0 ? (
                    analytics.recentTrends.map((trend, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            trend.type === "positive"
                              ? "bg-green-500"
                              : trend.type === "negative"
                                ? "bg-red-500"
                                : "bg-blue-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{trend.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{trend.description}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            trend.type === "positive"
                              ? "text-green-700 border-green-200"
                              : trend.type === "negative"
                                ? "text-red-700 border-red-200"
                                : "text-blue-700 border-blue-200"
                          }
                        >
                          {trend.value}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Payment System Active</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Your payment system is ready to process transactions
                          </p>
                        </div>
                        <Badge variant="outline" className="text-blue-700 border-blue-200">
                          Ready
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}