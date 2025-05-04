import { db } from "@/lib/db";
import EditRoomForm from "@/components/room-form/EditRoomForm";
import { PageWrapper } from "@/components/PageWrapper";
import { notFound } from "next/navigation";
import { getHotels } from "@/actions/room";

async function getRoomById(id: string) {
  try {
    const room = await db.room.findUnique({
      where: { id },
      select: {
        id: true,
        hotelId: true,
        type: true,
        description: true,
        capacity: true,
        price: true,
        available: true,
        amenities: true,
        images: true,
      },
    });
    return room;
  } catch (error) {
    console.error("Error fetching room:", error);
    return null;
  }
}

interface EditRoomPageProps {
  params: {
    id: string;
  };
}

export default async function EditRoomPage({ params }: EditRoomPageProps) {
  const { id } = await params;

  const [room, hotels] = await Promise.all([
    getRoomById(id),
    getHotels(),
  ]);

  if (!room) {
    notFound();
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Edit Room</h3>
          <p className="text-sm text-muted-foreground">
            Make changes to the room information
          </p>
        </div>
        <EditRoomForm hotels={hotels} initialData={room} />
      </div>
    </PageWrapper>
  );
}
