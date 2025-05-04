import { getAllFlights } from "@/actions/flight";
import { FlightColumn } from "@/components/table-of-data/columns";
import { DataTable } from "@/components/table-of-data/data-table";
import { PageWrapper } from "@/components/PageWrapper";

export default async function HotelPage() {
  const flight = await getAllFlights();

  return (
    <>
      
      <PageWrapper >
        <DataTable 
          columns={FlightColumn} 
          data={flight.data}
          link="/dashboard/admin/flight/add"
          filterColumn="flightNumber"
        />
      </PageWrapper>
    </>
  );
}
