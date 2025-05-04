"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FormError } from "@/components/form-error";
import { Loader2 } from "lucide-react";

const searchFormSchema = z.object({
  originCode: z.string().length(3, "Airport code must be 3 characters"),
  destinationCode: z.string().length(3, "Airport code must be 3 characters"),
  departureDate: z.date({
    required_error: "Departure date is required",
  }),
  adults: z.number().min(1).max(9).default(1),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

interface FlightSearchFormProps {
  onSearch: (values: SearchFormValues) => void;
  isLoading: boolean;
}

export function FlightSearchForm({ onSearch, isLoading }: FlightSearchFormProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      originCode: "",
      destinationCode: "",
      adults: 1,
    },
  });

  const handleSubmit = (values: SearchFormValues) => {
    setError(null);
    if (values.originCode === values.destinationCode) {
      setError("Origin and destination cannot be the same");
      return;
    }
    onSearch(values);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="originCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Airport code (e.g. JFK)"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      maxLength={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destinationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Airport code (e.g. LAX)"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      maxLength={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departureDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Departure Date</FormLabel>
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
                        selected={field.value}
                        onSelect={field.onChange}
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
              name="adults"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passengers</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      min={1}
                      max={9}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && <FormError message={error} />}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <SearchIcon className="mr-2 h-4 w-4" />
                Search Flights
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
} 