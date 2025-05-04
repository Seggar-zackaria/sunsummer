import EditFlightForm from "@/components/flight-form/edit-flight-form";
import { PageWrapper } from "@/components/PageWrapper";

interface EditFlightPageProps {
  params: {
    id: string;
  };
}

export default function EditFlightPage({ params }: EditFlightPageProps) {
  return (
    <PageWrapper>
        <EditFlightForm flightId={params.id} />
    </PageWrapper>
  );
} 