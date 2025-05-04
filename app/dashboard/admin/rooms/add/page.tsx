import AddRoomForm from "@/components/room-form/AddRoomForm";
import { PageWrapper } from "@/components/PageWrapper";
import { getHotels } from "@/actions/room";


export default async function AddRoomPage() {
  const hotels = await getHotels();

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Add New Room</h3>
          <p className="text-sm text-muted-foreground">
            Create a new room and assign it to a hotel
          </p>
        </div>
        <AddRoomForm hotels={hotels} />
      </div>
    </PageWrapper>
  );
} 