import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';

// Function to format date in "Day DD Month YYYY" format
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

// Search params interface for dynamic data loading
interface TripSummaryParams {
  bookingId?: string;
  hotelId?: string;
  flightId?: string;
  roomId?: string;
  checkInDate?: string;  // ISO date string
  checkOutDate?: string; // ISO date string
  guestCount?: string;   // String representation of number
}

// Props interface for component
interface TripSummaryProps extends TripSummaryParams {
  destinationImage?: string;
  destination?: string;
  resort?: string;
  flightIncluded?: boolean;
  departureLocation?: string;
  departureAirport?: string;
  arrivalLocation?: string;
  arrivalAirport?: string;
  departureDate?: string;
  arrivalDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  participants?: string;
  roomType?: string;
  amenities?: string[];
  totalPrice?: number;
  transportProvider?: string;
}

// Flight type with all possible properties used in the component
interface FlightData {
  id: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: number;
  price: number;
  departureCity: string;
  departureAirport: string;
  arrivalCity: string;
  arrivalAirport: string;
  airline: string;
  [key: string]: any;
}

export default async function TripSummary(props: TripSummaryProps) {
  const { 
    bookingId, 
    hotelId, 
    flightId, 
    roomId, 
    checkInDate,
    checkOutDate,
    guestCount
  } = props;
  
  // Initialize with empty tripData
  let tripData: TripSummaryProps = {};
  
  try {
    // If we have a booking ID, fetch booking data
    if (bookingId) {
      const booking = await db.hotelBooking.findUnique({
        where: { id: bookingId },
        include: {
          hotel: true,
          room: true,
          user: true
        }
      });
      
      if (booking && booking.hotel && booking.room) {
        // Calculate duration
        const checkInDate = booking.checkIn;
        const checkOutDate = booking.checkOut;
        const nights = Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Format dates
        const formattedCheckIn = formatDate(checkInDate);
        const formattedCheckOut = formatDate(checkOutDate);
        
        // Get user info
        const userName = booking.user?.name || 'Guest';
        // Get guest count from booking if available, otherwise default to 1
        let guestCountValue = 1;
        if ('guestCount' in booking && typeof booking.guestCount === 'number') {
          guestCountValue = booking.guestCount;
        }
        
        // Update trip data with booking information
        tripData = {
          destinationImage: booking.hotel.images?.[0],
          destination: `${booking.hotel.city.toUpperCase()}, ${booking.hotel.country.toUpperCase()}`,
          resort: booking.hotel.name,
          roomType: booking.room.type,
          amenities: booking.room.amenities,
          departureDate: formattedCheckIn,
          arrivalDate: formattedCheckOut,
          duration: `${nights + 1} Days - ${nights} Nights`,
          participants: `${guestCountValue} ${guestCountValue === 1 ? 'person' : 'people'} (${userName})`,
          totalPrice: booking.totalPrice
        };
        
        // Check if we need to fetch flight data
        if (flightId) {
          try {
            const flight = await db.flight.findUnique({
              where: { id: flightId }
            });
            
            if (flight) {
              // Type assertion to access all properties
              const flightData = flight as unknown as FlightData;
              
              // Format flight dates and times
              const depDate = formatDate(flightData.departureTime);
              const arrDate = formatDate(flightData.arrivalTime);
              const depTime = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(flightData.departureTime);
              const arrTime = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(flightData.arrivalTime);
              
              // Update trip data with flight information
              tripData = {
                ...tripData,
                flightIncluded: true,
                departureLocation: flightData.departureCity,
                departureAirport: flightData.departureAirport,
                arrivalLocation: flightData.arrivalCity,
                arrivalAirport: flightData.arrivalAirport,
                transportProvider: flightData.airline,
                departureTime: depTime,
                arrivalTime: arrTime
              };
            }
          } catch (error) {
            console.error("Error fetching flight data:", error);
          }
        }
      }
    }
    
    // If we have separate hotel/room IDs, fetch that data
    else if (hotelId && roomId) {
      const hotel = await db.hotel.findUnique({
        where: { id: hotelId },
        include: {
          roomTypes: {
            where: { id: roomId }
          }
        }
      });
      
      if (hotel && hotel.roomTypes.length > 0) {
        const room = hotel.roomTypes[0];
        
        // Try to get check-in, check-out dates and guest count from props
        let formattedCheckIn = '';
        let formattedCheckOut = '';
        let calculatedDuration = '';
        let calculatedParticipants = '';
        
        if (checkInDate) {
          const checkIn = new Date(checkInDate);
          formattedCheckIn = formatDate(checkIn);
        }
        
        if (checkOutDate) {
          const checkOut = new Date(checkOutDate);
          formattedCheckOut = formatDate(checkOut);
        }
        
        if (checkInDate && checkOutDate) {
          const checkIn = new Date(checkInDate);
          const checkOut = new Date(checkOutDate);
          const nights = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          calculatedDuration = `${nights + 1} Days - ${nights} Nights`;
        }
        
        if (guestCount) {
          // Convert string to number for parsing
          const guestCountString = String(guestCount);
          const parsedGuestCount = parseInt(guestCountString, 10);
          if (!isNaN(parsedGuestCount)) {
            calculatedParticipants = `${parsedGuestCount} ${parsedGuestCount === 1 ? 'person' : 'people'}`;
          }
        }
        
        tripData = {
          destinationImage: hotel.images?.[0],
          destination: `${hotel.city.toUpperCase()}, ${hotel.country.toUpperCase()}`,
          resort: hotel.name,
          roomType: room.type,
          amenities: room.amenities,
          totalPrice: room.price,
          departureDate: formattedCheckIn,
          arrivalDate: formattedCheckOut,
          duration: calculatedDuration,
          participants: calculatedParticipants || '1 person'
        };
      }
    }
    
    // If we have flight ID only, fetch flight data
    else if (flightId) {
      const flight = await db.flight.findUnique({
        where: { id: flightId }
      });
      
      if (flight) {
        // Type assertion to access all properties
        const flightData = flight as unknown as FlightData;
        
        const depDate = formatDate(flightData.departureTime);
        const arrDate = formatDate(flightData.arrivalTime);
        const depTime = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(flightData.departureTime);
        const arrTime = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(flightData.arrivalTime);
        
        // Calculate duration
        const durationHours = Math.floor(flightData.duration / 60);
        const durationMinutes = flightData.duration % 60;
        
        tripData = {
          flightIncluded: true,
          departureLocation: flightData.departureCity,
          departureAirport: flightData.departureAirport,
          arrivalLocation: flightData.arrivalCity,
          arrivalAirport: flightData.arrivalAirport,
          departureDate: depDate,
          arrivalDate: arrDate,
          departureTime: depTime,
          arrivalTime: arrTime,
          duration: `${durationHours}h ${durationMinutes}m`,
          transportProvider: flightData.airline,
          totalPrice: flightData.price
        };
      }
    }
  } catch (error) {
    console.error("Error fetching trip data:", error);
  }

  // Check if we have required data to display
  const hasData = tripData.destination || tripData.resort || 
                  (tripData.flightIncluded && (tripData.departureLocation || tripData.departureAirport));
  
  if (!hasData) {
    return (
      <Card className="border-0 shadow-none">
        <CardContent className="p-4">
          <p className="text-center text-gray-500">No trip data available. Please make sure to select a hotel or flight first.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <div className="space-y-6">
          {/* Destination Image */}
          {tripData.destinationImage && (
            <div className="relative w-full h-60">
              <Image 
                src={tripData.destinationImage} 
                alt={tripData.destination || "Destination"} 
                fill
                className="rounded-md object-cover"
              />
            </div>
          )}
          
          {/* Destination Info */}
          <div className="space-y-1">
            {tripData.destination && (
              <div className="border-l-4 border-rose-500 pl-3">
                <h2 className="text-sm font-semibold uppercase">{tripData.destination}</h2>
              </div>
            )}
            {tripData.resort && (
              <p className="text-base font-medium">{tripData.resort}</p>
            )}
            {tripData.flightIncluded && <Badge className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs font-medium">Flight included</Badge>}
          </div>
          
          {/* Trip Details */}
          <div className="space-y-3">
            {tripData.departureLocation && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Departure town/city:</span>
                <span className="font-medium text-right">{tripData.departureLocation}</span>
              </div>
            )}
            
            {tripData.arrivalLocation && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Arrival town/city:</span>
                <span className="font-medium text-right">{tripData.arrivalLocation}</span>
              </div>
            )}
            
            {tripData.departureDate && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Start date:</span>
                <span className="font-medium text-right">{tripData.departureDate}</span>
              </div>
            )}
            
            {tripData.arrivalDate && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">End date:</span>
                <span className="font-medium text-right">{tripData.arrivalDate}</span>
              </div>
            )}
            
            {tripData.duration && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium text-right">{tripData.duration}</span>
              </div>
            )}
            
            {tripData.participants && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Participants:</span>
                <span className="font-medium text-right">{tripData.participants}</span>
              </div>
            )}
          </div>
          
          {/* Flight Information */}
          {tripData.flightIncluded && tripData.departureAirport && tripData.arrivalAirport && (
            <div className="space-y-4">
              <div className="pt-3">
                <h3 className="text-sm font-semibold uppercase mb-2">OUTBOUND</h3>
                
                <div className="space-y-2">
                  {tripData.transportProvider && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-500">Transport Provider:</span>
                      <span className="font-medium text-right">{tripData.transportProvider}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Departure:</span>
                    <span className="font-medium text-right">{tripData.departureAirport}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Date/Time:</span>
                    <span className="font-medium text-right">
                      {tripData.departureDate}
                      {tripData.departureTime && <><br />{tripData.departureTime}</>}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Arrival:</span>
                    <span className="font-medium text-right">{tripData.arrivalAirport}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Date/Time:</span>
                    <span className="font-medium text-right">
                      {tripData.departureDate}
                      {tripData.arrivalTime && <><br />{tripData.arrivalTime}</>}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold uppercase mb-2">INBOUND</h3>
                
                <div className="space-y-2">
                  {tripData.transportProvider && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-500">Transport Provider:</span>
                      <span className="font-medium text-right">{tripData.transportProvider}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Departure:</span>
                    <span className="font-medium text-right">{tripData.arrivalAirport}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Date/Time:</span>
                    <span className="font-medium text-right">
                      {tripData.arrivalDate}
                      {tripData.departureTime && <><br />{tripData.departureTime}</>}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Arrival:</span>
                    <span className="font-medium text-right">{tripData.departureAirport}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Date/Time:</span>
                    <span className="font-medium text-right">
                      {tripData.arrivalDate}
                      {tripData.arrivalTime && <><br />{tripData.arrivalTime}</>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Amenities */}
          {(tripData.roomType || (tripData.amenities && tripData.amenities.length > 0)) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Just for you:</h3>
              <ul className="space-y-1">
                {tripData.roomType && (
                  <li className="flex items-start text-sm">
                    <span className="text-rose-500 mr-2">•</span>
                    <span>{tripData.roomType}</span>
                  </li>
                )}
                {tripData.amenities?.map((amenity, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-rose-500 mr-2">•</span>
                    <span>{amenity}</span>
                  </li>
                ))}
                {tripData.flightIncluded && (
                  <li className="flex items-start text-sm">
                    <span className="text-rose-500 mr-2">•</span>
                    <span>Offers with flights are ATOL/ABTA protected for your peace of mind</span>
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {/* Total Price */}
          {tripData.totalPrice && (
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="font-semibold">Total inc. taxes</span>
              <div className="flex items-center">
                <span className="text-xl font-bold">£{tripData.totalPrice}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 