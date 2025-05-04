import { db } from "@/lib/db";
import { DataTable } from "@/components/table-of-data/data-table";
import { PageWrapper } from "@/components/PageWrapper";
import { RoomColumns } from "@/components/table-of-data/columns";

async function getRooms() {
  try {
    const rooms = await db.room.findMany({
      include: {
        hotel: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        hotel: {
          name: 'asc',
        },
      },
    });

    return rooms.map(room => ({
      ...room,
      hotelName: room.hotel.name,
    }));
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }
}

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <PageWrapper>
      <DataTable
        columns={RoomColumns}
        data={rooms}
        link="/dashboard/admin/rooms/add"
        filterColumn="type"
      />
    </PageWrapper>
  );
} 