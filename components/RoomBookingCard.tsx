"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { bookHotelRoom } from "@/actions/hotel-booking";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getHotelDetails } from "@/actions/hotel";

interface RoomBookingCardProps {
  roomId: string;
  hotelId: string;
  price: number;
  roomType: string;
  roomImage?: string;
  amenities?: string[];
}

// Type for saved booking data in localStorage
interface SavedBookingData {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  price: number;
  lastUpdated: number;
  guestCount?: number;
}

export default function RoomBookingCard({ 
  roomId, 
  hotelId, 
  price, 
  roomType,
  roomImage,
  amenities = []
}: RoomBookingCardProps) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date());
  const [checkOut, setCheckOut] = useState<Date | undefined>(new Date(Date.now() + 86400000)); // +1 day in ms
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [hotelCountry, setHotelCountry] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState<number>(1); // Default to 1 guest
  const router = useRouter();

  // Load hotel details to get country
  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const hotel = await getHotelDetails(hotelId);
        if (hotel && hotel.country) {
          setHotelCountry(hotel.country);
        }
      } catch (error) {
        console.error("Error fetching hotel details:", error);
      }
    };
    
    fetchHotelDetails();
  }, [hotelId]);

  // Load saved booking data on component mount
  useEffect(() => {
    // Only run in client-side
    if (typeof window === 'undefined') return;
    
    try {
      // Check for saved dates in localStorage
      const storedCheckIn = localStorage.getItem('checkInDate');
      const storedCheckOut = localStorage.getItem('checkOutDate');
      const storedGuestCount = localStorage.getItem('guestCount');
      
      // If we have check-in and check-out dates stored, use them
      if (storedCheckIn && storedCheckOut) {
        const checkInDate = new Date(storedCheckIn);
        const checkOutDate = new Date(storedCheckOut);
        
        // Only use stored dates if they're valid
        if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())) {
          // Ensure check-in date is not in the past
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (checkInDate >= today && checkOutDate > checkInDate) {
            setCheckIn(checkInDate);
            setCheckOut(checkOutDate);
          }
        }
      }
      
      // Set guest count if available
      if (storedGuestCount) {
        const parsedGuestCount = parseInt(storedGuestCount, 10);
        if (!isNaN(parsedGuestCount) && parsedGuestCount > 0) {
          setGuestCount(parsedGuestCount);
        }
      }
      
      // Also check for specific pending hotel booking data
      const savedData = localStorage.getItem('pendingHotelBooking');
      
      if (savedData) {
        const bookingData: SavedBookingData = JSON.parse(savedData);
        
        // Only restore data if it's for the same hotel and room
        if (bookingData.hotelId === hotelId && bookingData.roomId === roomId) {
          // Check if the data isn't too old (e.g., 24 hours)
          const isDataRecent = (Date.now() - bookingData.lastUpdated) < 24 * 60 * 60 * 1000;
          
          if (isDataRecent) {
            setCheckIn(bookingData.checkIn ? new Date(bookingData.checkIn) : new Date());
            setCheckOut(bookingData.checkOut ? new Date(bookingData.checkOut) : new Date(Date.now() + 86400000));
            if (bookingData.guestCount) {
              setGuestCount(bookingData.guestCount);
            }
          } else {
            // Clear outdated data
            localStorage.removeItem('pendingHotelBooking');
          }
        }
      }
    } catch (error) {
      console.error("Error loading saved booking data:", error);
      // Clear potentially corrupt data
      localStorage.removeItem('pendingHotelBooking');
    }
  }, [hotelId, roomId]);

  // Save booking selections to localStorage when they change
  useEffect(() => {
    // Skip if booking is already successful
    if (bookingSuccess) return;
    
    // Save current selection to localStorage
    if (checkIn && checkOut) {
      const bookingData: SavedBookingData = {
        hotelId,
        roomId,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        roomType,
        price,
        lastUpdated: Date.now(),
        guestCount
      };
      
      localStorage.setItem('pendingHotelBooking', JSON.stringify(bookingData));
    }
  }, [checkIn, checkOut, hotelId, roomId, roomType, price, bookingSuccess, guestCount]);

  // Calculate nights count manually
  const nightsCount = checkIn && checkOut 
    ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))) 
    : 1;
  
  const totalPrice = price * nightsCount;

  const handleBookRoom = async () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await bookHotelRoom(
        roomId,
        hotelId,
        checkIn,
        checkOut,
        price
      );

      if (result.success) {
        toast.success("Room booked successfully!");
        setBookingSuccess(true);
        // Save the booking ID
        if (result.bookingId) {
          setBookingId(result.bookingId);
          
          // Save IDs to localStorage for the booking summary to use
          localStorage.setItem('selectedHotelId', hotelId);
          localStorage.setItem('selectedRoomId', roomId);
          localStorage.setItem('bookingId', result.bookingId);
          localStorage.setItem('checkInDate', checkIn.toISOString());
          localStorage.setItem('checkOutDate', checkOut.toISOString());
          localStorage.setItem('guestCount', guestCount.toString());
        }
        // Clear the saved data after successful booking
        localStorage.removeItem('pendingHotelBooking');
      } else if (result.redirectToLogin) {
        toast.error("You must be logged in to book a room");
        router.push("/auth/login");
      } else {
        toast.error(result.message || "Failed to book room");
      }
    } catch (error) {
      toast.error("An error occurred while booking the room");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookFlight = () => {
    // Navigate to the flight booking page with the hotel's country as destination
    if (hotelCountry) {
      // Format check-in date as YYYY-MM-DD for the date parameter
      const formattedDate = checkIn ? checkIn.toISOString().split('T')[0] : '';
      router.push(`/booking-flight?to=${encodeURIComponent(hotelCountry)}${formattedDate ? `&date=${formattedDate}` : ''}`);
    } else {
      // If no hotel country, still pass the date if available
      const formattedDate = checkIn ? checkIn.toISOString().split('T')[0] : '';
      router.push(`/booking-flight${formattedDate ? `?date=${formattedDate}` : ''}`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        {roomImage && (
          <div className="relative w-full h-40 mb-2 rounded-md overflow-hidden">
            <Image
              src={roomImage}
              alt={roomType}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardTitle>
          {roomType}
        </CardTitle>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold">{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(price)}</span>
            <CardDescription className="inline-block ml-1">per night</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {amenities && amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs">{amenity}</Badge>
            ))}
            {amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">+{amenities.length - 3} more</Badge>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Check-in</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkIn ? formatDate(checkIn) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Check-out</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOut ? formatDate(checkOut) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  disabled={(date) => checkIn ? date <= checkIn : date <= new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between mb-2">
            <span>{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(price)} × {nightsCount} nights</span>
            <span>{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(price * nightsCount)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(totalPrice)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {bookingSuccess ? (
          <div className="w-full flex flex-col gap-3">
            <div className="text-center text-green-600 font-medium mb-2">
              Your hotel room has been booked successfully!
            </div>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              onClick={handleBookFlight}
            >
              Book your flight
            </Button>
            {bookingId && (
              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700" 
                onClick={() => {
                  // Update URL to include all required IDs
                  router.push(`/booking-summary?bookingId=${bookingId}&hotelId=${hotelId}&roomId=${roomId}`);
                }}
              >
                View Booking Details
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push("/dashboard/booking-hotel")}
            >
              View all bookings
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full" 
            onClick={handleBookRoom}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Book Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 