import { FaCheckCircle } from "react-icons/fa";
import { Alert, AlertTitle } from "@/components/ui/alert";

interface FormSuccessProps {
  message: string | undefined;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;

  return (
    <Alert variant="succes">
      <FaCheckCircle className="h-4 w-4" />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
}
