import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { HotelSchema, HotelUpdateSchema } from "@/schemas";
import { flightSchema } from "@/schemas";

export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  password?: string | null;
  role?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  accounts?: Account[] | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Account = {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
  user?: User;
};

export type Hotel = {
    id?: string;
    name?: string;
    description?: string;
    address?: string;
    city?: string;
    country?: string;
    state?: string | null;
    rating: number;
    price: number;
    images?: string[];
    amenities: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export type CreateHotelForm = z.infer<typeof HotelSchema>;
export type UpdateHotelForm = z.infer<typeof HotelUpdateSchema>;

// Separate props for subcomponents
export interface HotelFormComponentProps {
  form: UseFormReturn<CreateHotelForm> | UseFormReturn<UpdateHotelForm>;
}

// Props for location details component
export interface HotelLocationDetailsProps extends HotelFormComponentProps {
  initialCountry?: string;
  initialState?: string;
  initialCity?: string;
}

// Props for image input component
export interface ImageInputProps<T extends CreateHotelForm | UpdateHotelForm> {
  form: UseFormReturn<T>;
  existingImages?: string[];
}

export type FlightFormValues = {
  flightNumber: string;
  status: "SCHEDULED" | "DELAYED" | "CANCELLED" | "COMPLETED";
  date: string;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  stops: number;
  duration: number;
};
