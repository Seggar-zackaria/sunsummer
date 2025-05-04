"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCallback, useState, useEffect } from "react";
import { flightSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-succes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateFlight, getFlight } from "@/actions/flight";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FlightFormValues } from "@/lib/definitions";
import { useRouter } from "next/navigation";

interface EditFlightFormProps {
  flightId: string;
}

export default function EditFlightForm({ flightId }: EditFlightFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [isLoadingFlight, setIsLoadingFlight] = useState(true);
  const router = useRouter();

  // Initialize form
  const form = useForm<FlightFormValues>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      flightNumber: "",
      departureCity: "",
      arrivalCity: "",
      date: "",
      airline: "",
      price: 0,
      duration: 0,
      stops: 0,
      departureTime: "",
      arrivalTime: "",
      status: "SCHEDULED" as const,
    },
  });

  // Fetch flight data
  useEffect(() => {
    const loadFlightData = async () => {
      try {
        setIsLoadingFlight(true);
        const response = await getFlight(flightId);
        
        if (response.status === 200 && response.data) {
          const flight = response.data;
          
          // Format date and time for form
          const departureDate = new Date(flight.departureTime);
          const arrivalDate = new Date(flight.arrivalTime);
          
          const formattedDate = format(departureDate, "yyyy-MM-dd");
          const formattedDepartureTime = format(departureDate, "HH:mm");
          const formattedArrivalTime = format(arrivalDate, "HH:mm");
          
          // Set form values
          form.reset({
            flightNumber: flight.flightNumber,
            departureCity: flight.departureCity,
            arrivalCity: flight.arrivalCity,
            date: formattedDate,
            airline: flight.airline,
            price: flight.price,
            duration: flight.duration,
            stops: flight.stops,
            departureTime: formattedDepartureTime,
            arrivalTime: formattedArrivalTime,
            status: flight.status,
          });
        } else {
          setError("Flight not found");
        }
      } catch (error) {
        console.error("Error loading flight:", error);
        setError("Failed to load flight data");
      } finally {
        setIsLoadingFlight(false);
      }
    };

    loadFlightData();
  }, [flightId, form]);

  const isFormValid = form.formState.isValid;

  const onSubmit = useCallback(async (values: FlightFormValues) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await updateFlight(flightId, values);
      
      if (response.status === 200) {
        setSuccess(response.message);
        setTimeout(() => {
          router.push("/dashboard/admin/flight");
        }, 1500);
      } else {
        setError(response.error || "Failed to update flight");
      }
    } catch (error) {
      console.error("Update error:", error);
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  }, [flightId, router]);

  if (isLoadingFlight) {
    // TODO: Add a skeleton loader
    return <div className="flex justify-center items-center min-h-[400px]">Loading flight data...</div>;
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="flightNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flight Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter flight number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

           
                <FormField
              control={form.control}
              name="airline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Airline</FormLabel>
                  <FormControl>
                      <Input 
                       {...field}
                        placeholder="Enter the Airline Company"
                      />
                  </FormControl>
                  <FormDescription>update an airline ex: airAlgerie</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departureCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departure City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter departure city" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="arrivalCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arrival City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter arrival city" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                        disabled={(date) =>
                          date <= new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stops"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Stops</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departureTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departure Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="arrivalTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arrival Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="DELAYED">Delayed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormError message={error} />
          <FormSuccess message={success} />

          <Button
            type="submit"
            disabled={loading || !isFormValid}
            className={cn(
              "w-full",
              !isFormValid && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? "Updating Flight..." : "Update Flight"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 