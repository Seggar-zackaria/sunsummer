"use client";

import { useState } from "react";
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
import { CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { bookHotelRoom } from "@/app/hotel-room/[id]/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface RoomBookingCardProps {
  roomId: string;
  hotelId: string;
  price: number;
  roomType: string;
}

export default function RoomBookingCard({ 
  roomId, 
  hotelId, 
  price, 
  roomType 
}: RoomBookingCardProps) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date());
  const [checkOut, setCheckOut] = useState<Date | undefined>(new Date(Date.now() + 86400000)); // +1 day in ms
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
        router.push("/booking-hotel");
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(price)}</CardTitle>
        <CardDescription>per night</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <Button 
          className="w-full" 
          onClick={handleBookRoom}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Book Now"}
        </Button>
      </CardFooter>
    </Card>
  );
} 