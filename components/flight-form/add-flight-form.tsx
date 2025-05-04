"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";
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
import { addFlight } from "@/actions/flight";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlightFormValues } from "@/lib/definitions";
import { AirportSelect } from "./airport-select";
import { format } from "date-fns";

export default function AddFlightForm() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  // Initialize form at top level
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

  const isFormValid = form.formState.isValid;

  const onSubmit = useCallback(async (values: FlightFormValues) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await addFlight(values);
      
      if (response.status === 201) {
        setSuccess(response.message);
        form.reset();
      } else if (response.status === 400 && response.error === "Flight number already exists") {
        setError("A flight with this number already exists on this date");
      } else {
        setError(response.error || "Failed to create flight");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  }, [form]);

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
                    <Input 
                      {...field} 
                      placeholder="Enter flight number"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
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
                  <FormDescription>add an airline ex: airAlgerie</FormDescription>
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
                    <AirportSelect
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Search departure airport..."
                    />
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
                    <AirportSelect
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Search arrival airport..."
                    />
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
                            format(field.value, "MMMM d, yyyy")
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
                        disabled={(date) => date < new Date()}
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
                  <FormLabel>Price (DZD)</FormLabel>
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
            disabled={loading}
            className={cn(
              "w-full",
              !isFormValid && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? "Adding Flight..." : "Add Flight"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
