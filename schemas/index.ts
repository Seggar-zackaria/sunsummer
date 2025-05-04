import * as z from "zod";
import { isAfter, parse } from "date-fns";


// const formatPhoneNumber = (value: string): string => {
//   const cleaned = value.replace(/\s/g, "");
//   if (cleaned.length !== 10) return cleaned;
//   return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(
//     6,
//     8
//   )} ${cleaned.slice(8)}`;
// };

export const LoginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Invalid credentials")
    .max(32, "Password must be less than 32 characters"),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, { message: "name is required" }),
  // firstName: z.string().min(1, { message: "le prénom est obligatoire" }),
  // phoneNumber: z
  //   .string()
  //   .refine((value) => /^(05|06|07)\d{8}$/.test(value.replace(/\s/g, "")), {
  //     message: "le numéro de téléphone est invalide",
  //   })
  //   .transform(formatPhoneNumber),
  // dateOfBirth: z
  //   .string()
  //   .min(1, { message: "la date de naissance est obligatoire" }),
  // homeAddress: z.string().min(1, { message: "l'adresse est obligatoire" }),
  // gender: z.string().min(1, { message: "le genre est obligatoire" }),
  // passportNumber: z
  //   .string()
  //   .min(1, { message: "le numéro de passport est obligatoire" }),
  email: z.string().min(1, { message: "email is required" }).email(),
  password: z
    .string()
    .min(8, { message: "password most be 8 character or above" }),
});


export const ForgotPasswordSchema = z.object({
  email: z.string().min(1, { message: "email is required" }).email(),
})

export const ResetPasswordSchema = z.object({
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be 8 characters or above")
    .max(32, "Password must be less than 32 characters"),
});

export const HotelSchema = z.object({
  name: z.string().min(1, { message: "Hotel name is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  rating: z.number().min(0).max(5).default(0),
  state: z.string().min(1, { message: "State is required" }),
  price: z.number().positive({ message: "Price is required" }),
  images: z
    .any()
    .refine((files) => {
      if (typeof window === 'undefined') {
        return Array.isArray(files);
      }
      return files instanceof FileList || Array.isArray(files);
    }, "Invalid file input")
    .transform((files) => {
      if (typeof window !== 'undefined' && files instanceof FileList) {
        return Array.from(files);
      }
      return files;
    })
    .default([]),
  amenities: z.array(z.string()).min(1, { message: "At least one amenity is required" })
});


export const HotelUpdateSchema = HotelSchema.partial().extend({
  id: z.string(),
});

export const RoomSchema = z.object({
  hotelId: z.string().min(1, { message: "Hotel is required" }),
  type: z.string().min(1, { message: "Room type is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  capacity: z.number().min(1, { message: "Capacity must be at least 1" }),
  price: z.number().positive({ message: "Price is required" }),
  available: z.boolean().default(true),
  amenities: z.array(z.string()).min(1, { message: "At least one amenity is required" }),
  images: z
    .any()
    .refine((files) => {
      if (typeof window === 'undefined') {
        return Array.isArray(files);
      }
      return files instanceof FileList || Array.isArray(files);
    }, "Invalid file input")
    .transform((files) => {
      if (typeof window !== 'undefined' && files instanceof FileList) {
        return Array.from(files);
      }
      return files;
    })
    .default([])
});

export const RoomUpdateSchema = RoomSchema.partial().extend({
  id: z.string()
});

export const flightSchema = z.object({
  flightNumber: z
    .string()
    .min(1, { message: "Flight number is required" })
    .transform(val => val.toUpperCase()),
  
  airline: z
    .string()
    .min(2, { message: "Airline name must be at least 2 characters" }),
  
  departureCity: z
    .string()
    .min(2, { message: "Departure city is required" }),
  
  arrivalCity: z
    .string()
    .min(2, { message: "Arrival city is required" }),
  
  date: z
    .string()
    .min(1, { message: "Date is required" })
    .refine(val => new Date(val) > new Date(), {
      message: "Flight date must be in the future"
    }),
  
  departureTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Invalid time format (HH:mm)"
    }),
  
  arrivalTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Invalid time format (HH:mm)"
    }),
  
  price: z
    .number()
    .positive({ message: "Price must be greater than 0" }),
  
  duration: z
    .number()
    .positive({ message: "Duration must be greater than 0" }),
  
  stops: z
    .number()
    .min(0, { message: "Stops cannot be negative" }),
  
  status: z.enum(["SCHEDULED", "DELAYED", "CANCELLED", "COMPLETED"], {
    required_error: "Status is required",
  }),
}).refine((data) => {
  const depTime = parse(`${data.date} ${data.departureTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const arrTime = parse(`${data.date} ${data.arrivalTime}`, 'yyyy-MM-dd HH:mm', new Date());
  return isAfter(arrTime, depTime);
}, {
  message: "Arrival time must be after departure time",
  path: ["arrivalTime"]
}).refine((data) => data.arrivalCity !== data.departureCity, {
  message: "Arrival city must be different from departure city",
  path: ["arrivalCity"]
});


