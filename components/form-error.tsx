import { GoAlertFill } from "react-icons/go";
import { Alert, AlertTitle } from "@/components/ui/alert";

interface FormErrorProps {
  message: string | undefined;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <Alert variant="destructive">
      <GoAlertFill className="h-4 w-4" />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
}
