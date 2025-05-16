import { PageWrapper } from "@/components/PageWrapper";
import { FlightCount, HotelCount, UserCount, getUserCountsByMonth } from '@/lib/data';
import { Users, Plane, Hotel, Package } from "lucide-react";
import { StatsCard } from "@/components/statistic-card";
import { Chart } from "@/components/chart-area-stacked";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const userCount = await UserCount();
  const flightBookingsCount = await FlightCount();
  const hotelBookingsCount = await HotelCount();
  const userCounts = await getUserCountsByMonth();

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard 
            title="Total Users"
            value={userCount}
            icon={<Users className="size-4" />}
          />
          <StatsCard 
            title="Flight Bookings"
            value={flightBookingsCount}
            icon={<Plane className="size-4" />}
          />
          <StatsCard 
            title="Hotel Bookings"
            value={hotelBookingsCount}
            icon={<Hotel className="size-4" />}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/admin/hotel/add">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Hotel className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-center">Add Hotel</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Add new hotel to the system
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/flight/add">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Plane className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-center">Add Flight</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Add new flight route
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/rooms/add">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Package className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-center">Add Room</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Add new room type
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/bookings">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Package className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-center">All Bookings</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Manage all bookings
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* User Growth Chart */}
          <Chart data={userCounts} />

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Hotels</p>
                      <p className="text-2xl font-bold">{hotelBookingsCount}</p>
                    </div>
                    <Hotel className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Flights</p>
                      <p className="text-2xl font-bold">{flightBookingsCount}</p>
                    </div>
                    <Plane className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold">{userCount}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
