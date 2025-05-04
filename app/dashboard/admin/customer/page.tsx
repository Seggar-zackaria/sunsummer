import { getUsers } from "@/lib/data";
import { userColumn } from "@/components/table-of-data/columns";
import { DataTable } from "@/components/table-of-data/data-table";
import { PageWrapper } from "@/components/PageWrapper";

export default async function HotelPage() {
  const users = await getUsers();

  return (
    <>
      <PageWrapper >
        <DataTable 
          columns={userColumn} 
          data={users}
          link="/dashboard/admin/customer/add"
          filterColumn="name"
        />
      </PageWrapper>
    </>
  );
}
