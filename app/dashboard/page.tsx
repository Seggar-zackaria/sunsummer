"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { SessionDebug } from "@/components/session-debug";
import { StatsCard } from "@/components/statistic-card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  CreditCard, 
  Calendar,
  Hotel,
  Plane,
  PenSquare
} from "lucide-react";
import Link from "next/link";

// Dummy data for demonstration - replace with real data from your API/database
const mockData = {
  totalUsers: 1234,
  totalRevenue: 45600,
  totalOrders: 789,
  revenueIncrease: 12.5,
  ordersIncrease: -4.2,
  userGrowthData: [
    { month: "Jan", users: 100 },
    { month: "Feb", users: 150 },
    { month: "Mar", users: 200 },
    { month: "Apr", users: 180 },
    { month: "May", users: 250 },
    { month: "Jun", users: 300 },
  ]
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-40">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Welcome back, {user?.name || "User"}!</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/profile">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <PenSquare className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-center">Update Profile</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Edit your personal information
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/bookings">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-center">My Bookings</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  View and manage your bookings
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/hotels">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Hotel className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-center">Book Hotel</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Browse and book hotels
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/flights">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Plane className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-center">Book Flight</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Search and book flights
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* User Profile Card */}
        {user && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {user.image && (
                  <div className="relative h-24 w-24 rounded-full overflow-hidden">
                    <Image 
                      src={user.image}
                      alt={user.name || "User avatar"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-lg">{user.name || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <p className="text-lg capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                    <p className="text-lg">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button asChild variant="outline">
                  <Link href="/dashboard/profile">
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}