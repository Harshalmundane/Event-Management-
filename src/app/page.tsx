import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Clock, MapPin, Bell } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Manage Your Events Effortlessly</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Create, organize, and track events with our powerful management platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
            <Link href="/events">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Leave Reminder Section */}
      <section className="py-16 bg-yellow-50 border-l-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <Bell className="h-8 w-8 text-yellow-600" />
            <div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-2">Leave Reminder</h2>
              <p className="text-yellow-700 text-lg">
                Don not forget to set up your leave reminders for upcoming events. Stay organized and never miss important
                dates!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Manage Events</h2>
            <p className="text-xl text-gray-600">Powerful tools to streamline your event management workflow</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Event Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create and organize events with detailed scheduling and planning tools
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Team Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Manage team members, assign roles, and coordinate responsibilities</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Track event timelines, deadlines, and important milestones</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>Venue Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Manage venues, locations, and coordinate logistics seamlessly</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of event organizers who trust our platform</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Sign Up as User
              </Button>
            </Link>
            <Link href="/admin/signup">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 text-white hover:bg-gray-800 bg-transparent"
              >
                Sign Up as Admin
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
