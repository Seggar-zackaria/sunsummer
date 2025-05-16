"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useRouter } from "next/navigation";
import { Country } from "country-state-city";

// Format date as YYYY-MM-DD
function formatYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date in pretty format (Month Day, Year)
function formatPretty(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Function to find country code from name
function findCountryCodeByName(countryName: string): string | null {
  const searchTerm = countryName.toLowerCase().trim();
  const countries = Country.getAllCountries();
  
  // First try exact match
  const exactMatch = countries.find(
    country => country.name.toLowerCase() === searchTerm
  );
  
  if (exactMatch) return exactMatch.isoCode;
  
  // Then try partial match
  const partialMatch = countries.find(
    country => country.name.toLowerCase().includes(searchTerm)
  );
  
  if (partialMatch) return partialMatch.isoCode;
  
  return null;
}

const SearchForm = () => {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7))
  });
  const [roomsCount, setRoomsCount] = useState(1);
  const [guestsCount, setGuestsCount] = useState(1);
  const [isRoomGuestOpen, setIsRoomGuestOpen] = useState(false);
  const [hotelDestination, setHotelDestination] = useState("");

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

  const handleHotelSearch = () => {
    // Create date params
    let startDate = "";
    let endDate = "";
    
    if (dateRange?.from) {
      startDate = formatYMD(dateRange.from);
    }
    
    if (dateRange?.to) {
      endDate = formatYMD(dateRange.to);
    }
    
    // Save important data to localStorage for use in booking flows
    if (typeof window !== 'undefined') {
      if (dateRange?.from) {
        localStorage.setItem('checkInDate', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        localStorage.setItem('checkOutDate', dateRange.to.toISOString());
      }
      localStorage.setItem('guestCount', guestsCount.toString());
      localStorage.setItem('roomCount', roomsCount.toString());
    }
    
    // Try to convert location name to country code if it matches a country
    const countryCode = findCountryCodeByName(hotelDestination);
    const searchLocation = countryCode || hotelDestination;
    
    router.push(`/booking-hotel?location=${encodeURIComponent(searchLocation)}&rooms=${roomsCount}&guests=${guestsCount}&checkIn=${startDate}&checkOut=${endDate}`);
  };

  return (
    <div className="max-w-6xl mx-auto -mt-16 relative z-20 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 7v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7"/>
            <rect x="8" y="2" width="8" height="5" rx="1"/>
            <path d="M8 10h8"/>
            <path d="M8 14h8"/>
          </svg>
          <h2 className="text-lg font-medium">Search your Journey</h2>
        </div>
          
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="hotel-location" className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <Input
                id="hotel-location"
                placeholder="Bali, Indonesia"
                className="w-full"
                aria-label="Enter hotel location"
                value={hotelDestination}
                onChange={(e) => setHotelDestination(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="hotel-rooms-guests" className="block text-sm font-medium text-gray-700 mb-1">
                Guests & Rooms
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
                    {`${guestsCount} Guest${guestsCount > 1 ? 's' : ''}, ${roomsCount} Room${roomsCount > 1 ? 's' : ''}`}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-4" align="start">
                  <div className="space-y-6">
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
                    
                    
                  </div>
                </PopoverContent>
              </Popover>
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
                          {formatPretty(dateRange.from)} - {formatPretty(dateRange.to)}
                        </>
                      ) : (
                        formatPretty(dateRange.from)
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
          
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
            <Button 
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white"
              aria-label="Show available hotels"
              onClick={handleHotelSearch}
            >
              Show Hotels
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm; 