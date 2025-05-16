"use client";

import React, { Suspense, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getHotelDetails} from "@/actions/hotel"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRoomsByHotelId } from '@/actions/room';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import RoomBookingCard from '@/components/RoomBookingCard';
import { Skeleton } from '@/components/ui/skeleton';
import ImageCarouselModal from '@/components/ImageCarouselModal';
import Navbar from '@/components/Navbar';

// Skeleton loaders
const RoomAmenitiesSkeleton = () => (
  <div className="mb-8">
    <Skeleton className="h-6 w-40 mb-4" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array(8).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  </div>
);

const RoomListSkeleton = () => (
  <div className="mb-8">
    <Skeleton className="h-6 w-40 mb-4" />
    <div className="space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

const HotelAmenitiesSkeleton = () => (
  <div className="mb-8">
    <Skeleton className="h-6 w-40 mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
      {Array(9).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  </div>
);

const BookingCardSkeleton = () => (
  <div className="sticky top-8">
    <Skeleton className="h-[450px] w-full rounded-lg" />
  </div>
);

// Room amenities component
const RoomAmenities = ({ rooms }: { rooms: any[] }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Room Properties</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.length > 0 && rooms[0].amenities && rooms[0].amenities.map((amenity: string, index: number) => (
          <div key={index} className="bg-gray-100 p-4 rounded-lg">
            <Badge variant="outline" className="mb-2">{amenity}</Badge>
          </div>
        ))}
        {(!rooms.length || !rooms[0].amenities || !rooms[0].amenities.length) && (
          <div className="col-span-full text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No amenities information available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Room list component with selection ability
const RoomList = ({ rooms, onSelectRoom, selectedRoomId }: { 
  rooms: any[]; 
  onSelectRoom: (room: any) => void;
  selectedRoomId: string | null;
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Choose your Room</h2>
      <div className="space-y-4">
        {rooms.length > 0 ? rooms.map((room) => (
          <div key={room.id} className={`border rounded-lg p-4 flex items-center gap-4 ${selectedRoomId === room.id ? 'border-green-500 bg-green-50' : ''}`}>
            <div className="w-20 h-20 rounded-md relative overflow-hidden">
              {room.images && room.images[0] && (
                <Image 
                  src={room.images[0]} 
                  alt={room.type} 
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">room type : {room.type}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {room.amenities && room.amenities.slice(0, 3).map((amenity: string, index: number) => (
                      <Badge key={index} variant="secondary">{amenity}</Badge>
                    ))}
                    {room.amenities && room.amenities.length > 3 && (
                      <Badge variant="outline">+{room.amenities.length - 3} more</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(room.price)}</div>
                  <div className="text-sm text-gray-500">per night</div>
                </div>
              </div>
            </div>
            {room.isAvailable !== false ? (
              <Button 
                className={`ml-auto ${selectedRoomId === room.id ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                onClick={() => onSelectRoom(room)}
              >
                {selectedRoomId === room.id ? 'Selected' : 'Reserve'}
              </Button>
            ) : (
              <div className="ml-auto px-4 py-2 bg-gray-100 text-gray-500 rounded-md font-medium">Sold out</div>
            )}
          </div>
        )) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No available rooms found for this hotel.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Hotel amenities component
const HotelAmenities = ({ hotel }: { hotel: any }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Hotel Amenities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
        {hotel.amenities && hotel.amenities.map((amenity: string, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <span>{amenity}</span>
          </div>
        ))}
        {(!hotel.amenities || !hotel.amenities.length) && (
          <div className="col-span-full text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hotel amenities information available</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function HotelRoomPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const hotelDetails = await getHotelDetails(resolvedParams.id);
        const hotelRooms = await getRoomsByHotelId(resolvedParams.id);
        
        setHotel(hotelDetails);
        setRooms(hotelRooms);
        
        // Set the first room as default selected
        if (hotelRooms && hotelRooms.length > 0) {
          setSelectedRoom(hotelRooms[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [resolvedParams.id]);

  const handleSelectRoom = (room: any) => {
    setSelectedRoom(room);
    // Scroll to booking card on mobile
    if (window.innerWidth < 1024) {
      const bookingCard = document.getElementById('booking-card');
      if (bookingCard) {
        bookingCard.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4 mt-16">
          <Skeleton className="h-8 w-40 mb-8" />
          <Skeleton className="h-[450px] w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RoomAmenitiesSkeleton />
              <RoomListSkeleton />
              <HotelAmenitiesSkeleton />
            </div>
            <div className="lg:col-span-1">
              <BookingCardSkeleton />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!hotel) {
    return <div className="container mx-auto p-8">Hotel not found</div>;
  }

  return (
    <>
    <Navbar />
    <div className="container mx-auto p-4">
      
      <Link href="/booking-hotel" >
        <Button variant="link" className="bg-white hover:bg-white/90 text-blue-500 mb-4 mt-16">
          <ArrowLeft size={16} /> Back to Hotel List
        </Button>
      </Link>
      {/* Hotel Image Gallery */}
      <div className="grid grid-cols-12 gap-2 mb-8 h-[450px]">
        <div className="col-span-6 h-full relative">
          {hotel.images && hotel.images[0] && (
            <Image 
              src={hotel.images[0]} 
              alt={hotel.name} 
              fill
              className="object-cover rounded-l-lg"
            />
          )}
        </div>
        <div className="col-span-6 grid grid-cols-2 grid-rows-2 gap-2 h-full">
          {hotel.images?.slice(1, 5).map((image: string, index: number) => (
            <div key={index} className="relative h-full w-full">
              <Image 
                src={image} 
                alt={`${hotel.name} ${index + 2}`} 
                fill
                className={`object-cover ${index === 2 ? 'rounded-tr-lg' : ''} ${index === 3 ? 'rounded-br-lg' : ''}`}
              />
              {index === 3 && hotel.images && hotel.images.length > 0 && (
                <div className="absolute bottom-4 right-4 z-10">
                  <ImageCarouselModal
                    images={hotel.images}
                    hotelName={hotel.name}
                    trigger={
                      <Button variant="outline" className="bg-white hover:bg-white/90">
                        View all photos
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Overview */}
          
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4">Overview</h2>
            <div className="mb-6">
        <h1 className="text-2xl ">{hotel.name}</h1>
        <div className="flex items-center gap-1 mt-2">
          {hotel.rating && (
            <>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${
                      i < Math.floor(hotel.rating) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : i < hotel.rating 
                          ? "fill-yellow-400 text-yellow-400 fill-opacity-50" 
                          : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <MapPin size={14} />
          <span>{hotel.address}, {hotel.city}, {hotel.state}, {hotel.country}</span>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-gray-600 mb-4">{hotel.description}</p>
          </div>

          {/* Room Amenities */}
          <RoomAmenities rooms={rooms} />

          {/* Available Rooms */}
          <RoomList 
            rooms={rooms} 
            onSelectRoom={handleSelectRoom} 
            selectedRoomId={selectedRoom?.id || null} 
          />

          {/* Hotel Amenities */}
          <HotelAmenities hotel={hotel} />
        </div>

        {/* Booking Card - Right Column */}
        <div className="lg:col-span-1" id="booking-card">
          {selectedRoom && (
            <div className="sticky top-8">
              <RoomBookingCard 
                roomId={selectedRoom.id}
                hotelId={hotel.id}
                price={selectedRoom.price}
                roomType={selectedRoom.type}
                roomImage={selectedRoom.images?.[0] || ''}
                amenities={selectedRoom.amenities || []}
              />
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
