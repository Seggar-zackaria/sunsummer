import { getCombinedBookingsWithVoyages } from "@/actions/booking";
import { PageWrapper } from "@/components/PageWrapper";
import { bookingsColumns } from "@/components/table-of-data/columns";
import { DataTable } from "@/components/table-of-data/data-table";
import { auth } from "@/auth";

export default async function UserBookingsPage() {
  const session = await auth();
  const bookingsResult = await getCombinedBookingsWithVoyages();
  
  if (!bookingsResult.success || !bookingsResult.data) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-semibold mb-4">Error Loading Bookings</h2>
          <p className="text-muted-foreground">{bookingsResult.message || "Unable to fetch booking data"}</p>
        </div>
      </PageWrapper>
    );
  }

  // Filter bookings for the current user
  const userBookings = bookingsResult.data.filter(
    booking => booking.userId === session?.user?.id
  );

  return (
    <PageWrapper>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
        </div>
        
        <DataTable 
          columns={bookingsColumns} 
          data={userBookings}
          filterColumn="type"
        />
      </div>
    </PageWrapper>
  );
} 