"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TripType = "roundTrip" | "oneWay";

const SearchForm = () => {
  const [searchType, setSearchType] = useState<"flight" | "hotel">("flight");
  const [tripType, setTripType] = useState<TripType>("roundTrip");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7))
  });
  const [singleDate, setSingleDate] = useState<Date | undefined>(new Date());
  const [roomsCount, setRoomsCount] = useState(1);
  const [guestsCount, setGuestsCount] = useState(1);
  const [isRoomGuestOpen, setIsRoomGuestOpen] = useState(false);

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as "flight" | "hotel");
  };

  const handleTripTypeChange = (value: TripType) => {
    setTripType(value);
  };

  const handleRoomsChange = (value: number) => {
    if (value >= 1 && value <= 5) {
      setRoomsCount(value);
    }
  };

  const handleGuestsChange = (value: number) => {
    if (value >= 1 && value <= 10) {
      setGuestsCount(value);
    }
  };

  return (
    <div className="max-w-6xl mx-auto -mt-16 relative z-20 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Tabs defaultValue="flight" onValueChange={handleSearchTypeChange}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="flight" className="flex items-center gap-3 ">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
              </svg>
              Flight
            </TabsTrigger>
            <TabsTrigger value="hotel" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 7v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7"/>
                <rect x="8" y="2" width="8" height="5" rx="1"/>
                <path d="M8 10h8"/>
                <path d="M8 14h8"/>
              </svg>
              Hotel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flight" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="departure" className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <Input
                  id="departure"
                  placeholder="New York"
                  className="w-full"
                  aria-label="Enter departure location"
                />
              </div>
              
              <div>
                <label htmlFor="arrival" className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <Input
                  id="arrival"
                  placeholder="Dubai"
                  className="w-full"
                  aria-label="Enter arrival location"
                />
              </div>
              
              <div>
                <label htmlFor="trip-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Trip
                </label>
                <Select
                  onValueChange={(value) => handleTripTypeChange(value as TripType)}
                  defaultValue={tripType}
                >
                  <SelectTrigger id="trip-type" aria-label="Select trip type">
                    <SelectValue placeholder="Select trip type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roundTrip">Round Trip</SelectItem>
                    <SelectItem value="oneWay">One Way</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tripType === "roundTrip" ? "Trip Dates" : "Departure Date"}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && !singleDate && "text-muted-foreground"
                      )}
                      aria-label={tripType === "roundTrip" ? "Select date range" : "Select departure date"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tripType === "roundTrip" ? (
                        dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
                            </>
                          ) : (
                            format(dateRange.from, "PPP")
                          )
                        ) : (
                          <span>Pick dates</span>
                        )
                      ) : (
                        singleDate ? format(singleDate, "PPP") : <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode={tripType === "roundTrip" ? "range" : "single"}
                      selected={tripType === "roundTrip" ? dateRange : singleDate}
                      onSelect={tripType === "roundTrip" 
                        ? setDateRange 
                        : (date) => setSingleDate(date)
                      }
                      initialFocus
                      numberOfMonths={2}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="w-full sm:w-auto">
                <label htmlFor="rooms-guests" className="block text-sm font-medium text-gray-700 mb-1">
                  Rooms & Guests
                </label>
                <Popover open={isRoomGuestOpen} onOpenChange={setIsRoomGuestOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isRoomGuestOpen}
                      className="w-full justify-between"
                      aria-label="Select rooms and guests"
                    >
                      {`${roomsCount} Room${roomsCount > 1 ? 's' : ''}, ${guestsCount} Guest${guestsCount > 1 ? 's' : ''}`}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-4" align="start">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Rooms (max 5)</h4>
                        <div className="flex items-center border rounded-md overflow-hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none px-3 h-9"
                            onClick={() => handleRoomsChange(roomsCount - 1)}
                            disabled={roomsCount <= 1}
                            aria-label="Decrease rooms"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <div className="flex-1 text-center">{roomsCount}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none px-3 h-9"
                            onClick={() => handleRoomsChange(roomsCount + 1)}
                            disabled={roomsCount >= 5}
                            aria-label="Increase rooms"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Guests (max 10)</h4>
                        <div className="flex items-center border rounded-md overflow-hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none px-3 h-9"
                            onClick={() => handleGuestsChange(guestsCount - 1)}
                            disabled={guestsCount <= 1}
                            aria-label="Decrease guests"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <div className="flex-1 text-center">{guestsCount}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none px-3 h-9"
                            onClick={() => handleGuestsChange(guestsCount + 1)}
                            disabled={guestsCount >= 10}
                            aria-label="Increase guests"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button 
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white"
                aria-label="Show available flights"
              >
                Show Flights
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="hotel" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="hotel-location" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Destination
                </label>
                <Input
                  id="hotel-location"
                  placeholder="Bali, Indonesia"
                  className="w-full"
                  aria-label="Enter hotel location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stay Dates</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                      aria-label="Select date range"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
                          </>
                        ) : (
                          format(dateRange.from, "PPP")
                        )
                      ) : (
                        <span>Pick dates</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      initialFocus
                      numberOfMonths={2}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="w-full sm:w-auto">
                <label htmlFor="hotel-rooms-guests" className="block text-sm font-medium text-gray-700 mb-1">
                  Rooms & Guests
                </label>
                <Popover open={isRoomGuestOpen} onOpenChange={setIsRoomGuestOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isRoomGuestOpen}
                      className="w-full justify-between"
                      aria-label="Select rooms and guests"
                    >
                      {`${roomsCount} Room${roomsCount > 1 ? 's' : ''}, ${guestsCount} Guest${guestsCount > 1 ? 's' : ''}`}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-4" align="start">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Rooms (max 5)</h4>
                        <div className="flex items-center border rounded-md overflow-hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none px-3 h-9"
                            onClick={() => handleRoomsChange(roomsCount - 1)}
                            disabled={roomsCount <= 1}
                            aria-label="Decrease rooms"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <div className="flex-1 text-center">{roomsCount}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none px-3 h-9"
                            onClick={() => handleRoomsChange(roomsCount + 1)}
                            disabled={roomsCount >= 5}
                            aria-label="Increase rooms"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Guests (max 10)</h4>
                        <div className="flex items-center border rounded-md overflow-hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none px-3 h-9"
                            onClick={() => handleGuestsChange(guestsCount - 1)}
                            disabled={guestsCount <= 1}
                            aria-label="Decrease guests"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <div className="flex-1 text-center">{guestsCount}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none px-3 h-9"
                            onClick={() => handleGuestsChange(guestsCount + 1)}
                            disabled={guestsCount >= 10}
                            aria-label="Increase guests"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button 
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white"
                aria-label="Show available hotels"
              >
                Show Hotels
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SearchForm; 