import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EditHotelForm from "@/components/hotel-form/EditHotelForm";
import { PageWrapper } from "@/components/PageWrapper";

interface EditHotelPageProps {
  params: {
    id: string;
  };
}

async function getHotelById(id: string) {
  try {
    const hotel = await db.hotel.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        city: true,
        country: true,
        state: true,
        rating: true,
        price: true,
        images: true,
        amenities: true,
      },
    });
    return hotel;
  } catch (error) {
    console.error("Error fetching hotel:", error);
    return null;
  }
}

export default async function EditHotelPage({ params }: EditHotelPageProps) {
  const {id} = await params;
  const hotel = await getHotelById(id);

  if (!hotel) {
    notFound();
  }

  return (
    <PageWrapper>
      <EditHotelForm initialData={hotel} />
    </PageWrapper>
  );
}