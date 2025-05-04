
import { PageWrapper } from "@/components/PageWrapper";
import {FlightCount, HotelCount, UserCount, getUserCountsByMonth } from '@/lib/data'
import {Users, Plane, Hotel} from "lucide-react" 
import { StatsCard } from "@/components/statistic-card";
import { Chart } from "@/components/chart-area-stacked";

export const metadata = {
  title: "Dashboard",
  description: "Dashboard",
}

export default async function DashboardPage() {


  const userCount = await UserCount();
  const flightBookingsCount = await FlightCount()
  const hotelBookingsCount = await HotelCount()
  const userCounts = await getUserCountsByMonth();
  return (
<PageWrapper>
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
        <section className="grid lg:grid-cols-2 gap-4">
          <Chart data={userCounts} />
        </section>
    </PageWrapper>
  );
}
