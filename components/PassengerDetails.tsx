'use client';

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Passenger data schema with validation
const passengerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  dateOfBirth: z.string()
    .min(8, "Date of birth is required")
    .refine(
      (value) => {
        // Basic DD/MM/YYYY format validation
        return /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(value);
      },
      { message: "Date of birth must be in DD/MM/YYYY format" }
    )
    .refine(
      (value) => {
        // Validate that the date is valid and not in the future
        try {
          const [day, month, year] = value.split('/').map(Number);
          const date = new Date(year, month - 1, day);
          return (
            date.getDate() === day &&
            date.getMonth() === month - 1 &&
            date.getFullYear() === year &&
            date <= new Date()
          );
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid date of birth" }
    )
});

export type PassengerData = z.infer<typeof passengerSchema>;

interface PassengerDetailsProps {
  passengerNumber: number;
  onPassengerDataChange?: (data: PassengerData, isValid: boolean) => void;
  initialData?: Partial<PassengerData>;
}

export default function PassengerDetails({ 
  passengerNumber = 1,
  onPassengerDataChange,
  initialData = {}
}: PassengerDetailsProps) {
  // Initialize form with validation
  const form = useForm<PassengerData>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: initialData.title || '',
      firstName: initialData.firstName || '',
      surname: initialData.surname || '',
      dateOfBirth: initialData.dateOfBirth || ''
    },
    mode: "onChange" // Validate on change for immediate feedback
  });

  // Watch all form values to notify parent component
  const watchedValues = form.watch();
  const isValid = form.formState.isValid;
  
  useEffect(() => {
    if (onPassengerDataChange) {
      onPassengerDataChange(watchedValues, isValid);
    }
  }, [watchedValues, isValid, onPassengerDataChange]);

  return (
    <div className="space-y-6" data-passenger-form>
      <div className="border-l-4 border-teal-500 pl-4 py-1">
        <h2 className="text-lg font-medium">Adult {passengerNumber}</h2>
      </div>

      <Form {...form}>
        <form className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-12 sm:col-span-2">
                <FormLabel htmlFor={`title-${passengerNumber}`} className="text-sm">Title <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger id={`title-${passengerNumber}`} className="w-full">
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Miss">Miss</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                    <SelectItem value="Prof">Prof</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="col-span-12 sm:col-span-4">
                <FormLabel htmlFor={`first-name-${passengerNumber}`} className="text-sm">First name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    id={`first-name-${passengerNumber}`}
                    placeholder="Enter first name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem className="col-span-12 sm:col-span-4">
                <FormLabel htmlFor={`surname-${passengerNumber}`} className="text-sm">Last name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    id={`surname-${passengerNumber}`}
                    placeholder="Enter surname"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="col-span-12 sm:col-span-2">
                <FormLabel htmlFor={`dob-${passengerNumber}`} className="text-sm">Date of birth <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    id={`dob-${passengerNumber}`}
                    placeholder="DD/MM/YYYY"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
} 