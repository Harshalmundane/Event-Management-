"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Users, UserPlus, LogIn } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EventManager</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Home
            </Link>
            <Link href="/events" className="text-gray-700 hover:text-blue-600 font-medium">
              Events
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/signin">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </Button>
            </Link>
            <Link href="/admin/signup">
              <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                <Users className="h-4 w-4" />
                <span>Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
