import { getCombinedBookingsWithVoyages } from "@/actions/booking";
import { PageWrapper } from "@/components/PageWrapper";
import { bookingsColumns } from "@/components/table-of-data/columns";
import { DataTable } from "@/components/table-of-data/data-table";

export default async function BookingsPage() {
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

  return (
    <PageWrapper>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">All Bookings</h2>
        </div>
        
        <DataTable 
          columns={bookingsColumns} 
          data={bookingsResult.data}
          filterColumn="type"
        />
      </div>
    </PageWrapper>
  );
} 