import { getHotelList } from "@/lib/data";
import { Hotelcolumns } from "@/components/table-of-data/columns";
import { DataTable } from "@/components/table-of-data/data-table";
import { PageWrapper } from "@/components/PageWrapper";

export default async function HotelPage() {
  const hotel = await getHotelList();

  return (
    <>
      
      <PageWrapper >
        <DataTable 
        columns={Hotelcolumns} 
        data={hotel}
        link="/dashboard/admin/hotel/add"
        filterColumn="name"
        />
      </PageWrapper>
    </>
  );
}
