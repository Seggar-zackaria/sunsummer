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
const dateFns = require('date-fns');
const { format } = dateFns;

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
    mode: "onChange", // Validate on change for better user feedback
  });

  // Calculate and update duration whenever departure/arrival times change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'departureTime' || name === 'arrivalTime' || name === 'date') {
        const { departureTime, arrivalTime, date } = form.getValues();
        
        if (departureTime && arrivalTime && date) {
          // Parse times to calculate minutes
          const [departureHour, departureMinute] = departureTime.split(':').map(Number);
          const [arrivalHour, arrivalMinute] = arrivalTime.split(':').map(Number);
          
          // Calculate total minutes for each time
          let departureMinutes = departureHour * 60 + departureMinute;
          let arrivalMinutes = arrivalHour * 60 + arrivalMinute;
          
          // Handle overnight flights
          if (arrivalMinutes < departureMinutes) {
            arrivalMinutes += 24 * 60; // Add a day in minutes
          }
          
          const durationMinutes = arrivalMinutes - departureMinutes;
          form.setValue('duration', durationMinutes, { shouldValidate: true });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const isFormValid = form.formState.isValid;

  const onSubmit = useCallback(async (values: FlightFormValues) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Ensure duration is properly set before submission
      const { departureTime, arrivalTime, date } = values;
      
      if (departureTime && arrivalTime && date) {
        // Calculate duration one more time to ensure it's correct
        const [departureHour, departureMinute] = departureTime.split(':').map(Number);
        const [arrivalHour, arrivalMinute] = arrivalTime.split(':').map(Number);
        
        let departureMinutes = departureHour * 60 + departureMinute;
        let arrivalMinutes = arrivalHour * 60 + arrivalMinute;
        
        if (arrivalMinutes < departureMinutes) {
          arrivalMinutes += 24 * 60;
        }
        
        values.duration = arrivalMinutes - departureMinutes;
      }

      const response = await addFlight(values);
      
      if (response.status === 201) {
        setSuccess(response.message || "Flight added successfully");
        form.reset();
      } else if (response.status === 400 && response.error === "Flight number already exists") {
        setError("A flight with this number already exists on this date");
      } else {
        setError(response.error || "Failed to create flight");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError("Something went wrong with the submission. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [form]);

  return (
    <div className="w-full mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Add New Flight</h1>
        <p className="text-muted-foreground mt-1">Enter the flight details below</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="flightNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Flight Number</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter flight number"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="h-10"
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
                  <FormLabel className="text-base font-medium">Airline</FormLabel>
                  <FormControl>
                      <Input 
                        {...field}
                        placeholder="Enter the Airline Company"
                        className="h-10"
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
                  <FormLabel className="text-base font-medium">Departure City</FormLabel>
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
                  <FormLabel className="text-base font-medium">Arrival City</FormLabel>
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
                  <FormLabel className="text-base font-medium">Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal h-10",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                           {field.value ? (
                            format(new Date(field.value), "MMMM d, yyyy")
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
                        onSelect={(date) => {
                          if (date) {
                            // Format date as YYYY-MM-DD directly to avoid timezone issues
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            field.onChange(`${year}-${month}-${day}`);
                          } else {
                            field.onChange("");
                          }
                        }}
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
                  <FormLabel className="text-base font-medium">Price (DZD)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-10"
                      min="0"
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
                  <FormLabel className="text-base font-medium">Number of Stops</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-10"
                      min="0"
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
                  <FormLabel className="text-base font-medium">Departure Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      className="w-full h-10"
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
                  <FormLabel className="text-base font-medium">Arrival Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      className="w-full h-10"
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
                  <FormLabel className="text-base font-medium">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10">
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

          <div className="space-y-4">
            <FormError message={error} />
            <FormSuccess message={success} />

            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className={cn(
                "w-full py-2.5 text-base font-medium",
                (!isFormValid || loading) && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? "Adding Flight..." : "Add Flight"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
