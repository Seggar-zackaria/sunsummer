"use client"
import { ColumnDef } from "@tanstack/react-table";
import { Hotel, User } from "@/lib/definitions";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {useLocation} from "@/hooks/useLocation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { deleteHotel } from "@/actions/hotel";
import { deleteFlight } from "@/actions/flight";
import { deleteRoom } from "@/actions/room";
import { confirmBooking, cancelBooking, deleteBooking } from "@/actions/booking";
import { ArrowRight, Bed, Check, Mail, MoreHorizontal, Star, User as UserIcon, X, Trash2 } from "lucide-react";
import { DataTableColumnHeader } from "@/components/table-of-data/Column-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Separator } from "@radix-ui/react-separator";

// Helper function to format dates
const formatDateTime = (date: Date | string): string => {
  if (!date) return "N/A";
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function StateCell({ row }: { row: { original: Hotel } }) {
  const { getStateByCode } = useLocation();
  const hotel = row.original;
  const state = getStateByCode(hotel.country ?? '', hotel.state ?? '');
  return <div className="text-left">{state?.name ?? hotel.state}</div>;
}

export const Hotelcolumns: ColumnDef<Hotel>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader 
                column={column} 
                title="name" 
                filterColumn="name"
            />
            )
        }
    },
    {
        header: "Rating",
        accessorKey: "rating",
        cell: ({ row }) => {
            const rating = row.original.rating
            return (
                <div className="text-left flex items-center gap-2">
                    <Star className={`w-4 h-4 ${rating > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                    {rating}
                </div>
            )
        }
    },
    {
        accessorKey: "price",
        header: () => <div className="text-left">Price</div>,
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
            }).format(price)
            return <div className="text-left">{formatted}</div>
        }
    },
    {
        header: "Amenities",
        accessorKey: "amenities",
        cell: ({ row }) => {
            const amenities = row.original.amenities
            const amenitiesLength = amenities.length
            return <HoverCard>
                <HoverCardTrigger>
                    <Button variant="link" size="lg" className="text-left">{amenitiesLength} </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-fit flex flex-wrap gap-2 border border-neutral-400 rounded-md p-6 bg-muted text-primary">
                    {amenities.map((amenity) => (
                            <Badge key={amenity}>{amenity}</Badge>
                    ))}
                </HoverCardContent>
            </HoverCard>
        }
    },
    {
        header: "Country",
        accessorKey: "country",
        cell: ({ row }) => {
            const country = row.original.country
            return <div className="text-left">{country}</div>
        }
    },
    {
        header: "State",
        accessorKey: "state",
        cell: ({ row }) => <StateCell row={row} />
    },
    {
        header: "City",
        accessorKey: "city",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const hotel = row.original
            return <div className="text-left">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <div className="size-8 p-0 inline-flex items-center justify-center rounded-md border border-transparent hover:bg-neutral-100 hover:border hover:border-neutral-400">
                            <span className="sr-only">open menu</span>
                            <MoreHorizontal className="w-4 h-4" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() => {
                                navigator.clipboard.writeText(hotel?.name || "")
                            }}
                        >
                            Copy hotel name
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link href={`/dashboard/admin/hotel/edit/${hotel.id}`}>
                            <DropdownMenuItem>
                                    Edit
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={(e)=> e.preventDefault()}>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <span>
                                        Delete
                                    </span>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the hotel.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive"
                                            onClick={async () => {
                                                if (!hotel.id) return;
                                                const result = await deleteHotel(hotel.id);
                                                if (!result.success) {
                                                    alert(result.message);
                                                }
                                            }}
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        }
    }
]

interface Flight {
  id: string
  flightNumber: string
  airline: string
  departureCity: string
  arrivalCity: string
  departureTime: Date
  arrivalTime: Date
  status: "SCHEDULED" | "DELAYED" | "CANCELLED" | "COMPLETED"
  price: number
  duration: number
  stops: number
}

export const FlightColumn: ColumnDef<Flight>[] = [
    {
        accessorKey: "flightNumber",
        header: ({ column }) => (
            <DataTableColumnHeader 
                column={column} 
                title="Flight Number"
            />
        ),
    },
    {
        accessorKey: "airline",
        header: ({ column }) => (
            <DataTableColumnHeader 
                column={column} 
                title="Airline"
            />
        ),
    },
    {
        header: "Route",
        accessorKey: "departureCity",
        cell: ({row}) => {
            return (
                <div className="flex items-center gap-2">
                    {row.original.departureCity} <ArrowRight className="w-4 h-4" /> {row.original.arrivalCity}
                </div>
            )
        }
    },
    {
        header: "Schedule",
        accessorKey: "departureTime",
        cell: ({row}) => {
            const departureTime = row.original.departureTime;
            const arrivalTime = row.original.arrivalTime;
            
            return (
                <div className="flex flex-col gap-1">
                    <div className="text-sm">
                        Departure: {departureTime ? formatDateTime(departureTime) : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Arrival: {arrivalTime ? formatDateTime(arrivalTime) : "N/A"}
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader 
                column={column} 
                title="Status"
            />
        ),
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <Badge variant={
                    status === "COMPLETED" ? "success" :
                    status === "SCHEDULED" ? "default" :
                    status === "DELAYED" ? "warning" :
                    "destructive"
                }>
                    {status.toLowerCase()}
                </Badge>
            )
        }
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            const price = row.getValue("price")
            if (price === undefined || price === null || isNaN(Number(price))) {
                return <div>N/A</div>
            }
            const formatted = new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
            }).format(Number(price))
            return <div className="text-left">{formatted}</div>
        }
    },
    {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => {
            const duration = row.original.duration
            return <div>{duration !== undefined && duration !== null && !isNaN(duration) ? `${duration} mins` : 'N/A'}</div>
        }
    },
    {
        accessorKey: "stops",
        header: "Stops",
        cell: ({ row }) => {
            const stops = row.original.stops
            if (stops === undefined || stops === null || isNaN(stops)) {
                return <div>N/A</div>
            }
            return <div>{stops === 0 ? <Badge variant={'success'}>Direct</Badge> : `${stops} stops`}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const flight = row.original
            return <div className="text-left">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <div className="size-8 p-0 inline-flex items-center justify-center rounded-md border border-transparent hover:bg-neutral-100 hover:border hover:border-neutral-400">
                            <span className="sr-only">open menu</span>
                            <MoreHorizontal className="w-4 h-4" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() => {
                                navigator.clipboard.writeText(flight?.flightNumber || "")
                            }}
                        >
                            Copy flight number
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link href={`/dashboard/admin/flight/edit/${flight.id}`}>
                            <DropdownMenuItem>
                                    Edit
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={(e)=> e.preventDefault()}>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <span>
                                        Delete
                                    </span>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the flight.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive"
                                            onClick={async () => {
                                                if (!flight.id) return;
                                                const result = await deleteFlight(flight.id);
                                                if (result.status !== 200) {
                                                    alert(result.error || result.message || "Failed to delete flight");
                                                }
                                            }}
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        }
    }
]

// Component for user avatar that uses session data for current user
const UserAvatar = ({ user }: { user: User }) => {
    const { data: sessionData } = useSession();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Set image URL, prioritizing the current user's session image if it's the same user
    useEffect(() => {
        if (sessionData?.user?.id === user.id && sessionData?.user?.image) {
            // If this is the current user, use the session image which is guaranteed to be up-to-date
            setImageUrl(sessionData.user.image);
        } else {
            // Otherwise use the image from the database
            setImageUrl(user.image || null);
        }
        
        // Check if user is admin
        setIsAdmin(sessionData?.user?.role === 'ADMIN');
    }, [sessionData, user]);
    
    return (
        <div className="flex items-center justify-center">
            <Avatar className="h-12 w-12 border-2 border-border">
                <AvatarImage 
                    src={imageUrl || ""} 
                    alt={`${user.name || 'User'}'s avatar`}
                    className="object-cover"
                />
                <AvatarFallback className="bg-primary/10">
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-6 w-6 text-primary" />}
                </AvatarFallback>
            </Avatar>
        </div>
    );
};

export const userColumn: ColumnDef<User>[] = [
    {
        id: "avatar",
        header: "Avatar",
        cell: ({ row }) => {
            const user = row.original;
            return <UserAvatar user={user} />;
        }
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => {
            const email = row.original.email;
            return (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {email}
                </div>
            );
        }
    },
    {
        accessorKey: "role",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => {
            const role = row.original.role;
            return (
                <Badge variant={role === "ADMIN" ? "default" : "outline"}>
                    {role?.toLowerCase() || "user"}
                </Badge>
            );
        }
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Joined Date" />
        ),
        cell: ({ row }) => {
            const date = row.original.createdAt;
            if (!date) return null;
            return (
                <div className="text-muted-foreground">
                    {date instanceof Date 
                        ? date.toLocaleDateString()
                        : new Date(date).toLocaleDateString()}
                </div>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original;
            return <div className="text-left">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <div className="size-8 p-0 inline-flex items-center justify-center rounded-md border border-transparent hover:bg-neutral-100 hover:border hover:border-neutral-400">
                            <span className="sr-only">open menu</span>
                            <MoreHorizontal className="w-4 h-4" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() => {
                                navigator.clipboard.writeText(user?.email || "")
                            }}
                        >
                            Copy email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link href={`/dashboard/admin/users/edit/${user.id}`}>
                            <DropdownMenuItem>
                                Edit
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={(e)=> e.preventDefault()}>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <span>
                                        Delete
                                    </span>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the user account.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive"
                                            onClick={async () => {
                                                if (!user.id) return;
                                                try {
                                                    // Replace with actual deleteUser function when available
                                                    const response = await fetch(`/api/users/${user.id}`, {
                                                        method: 'DELETE'
                                                    });
                                                    
                                                    if (!response.ok) {
                                                        throw new Error('Failed to delete user');
                                                    }
                                                    
                                                    // Refresh or redirect as needed
                                                    window.location.reload();
                                                } catch (error) {
                                                    alert("Failed to delete user");
                                                }
                                            }}
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        }
    }
]

export type Room = {
    id: string;
    hotelId: string;
    hotelName: string;
    type: string;
    description: string;
    capacity: number;
    price: number;
    available: boolean;
    amenities: string[];
    images: string[];
  };

export const RoomColumns: ColumnDef<Room>[] = [
    {
        accessorKey: "images",
        header: 'Images',
        cell: ({ row }) => {
          const images = row.getValue("images") as string[];
          return (
            <div className="flex -space-x-2">
              {images.slice(0, 1).map((image, index) => (
                <Avatar key={`${row.original.id}-image-${index}`} className="border-2 border-background">
                  <AvatarImage src={image} alt={`Room ${index + 1}`} />
                  <AvatarFallback><Bed className="w-4 h-4" /></AvatarFallback>
                </Avatar>
              ))}
            </div>
          );
        },
      },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Room Type" />
      ),
    },
    {
      accessorKey: "hotelName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Hotel" />
      ),
    },
    {
      accessorKey: "capacity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Capacity" />
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("fr-DZ", {
          style: "currency",
          currency: "DZD",
        }).format(price);
  
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "available",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const available = row.getValue("available");
  
        return (
          <Badge variant={available ? "default" : "destructive"}>
            {available ? "Available" : "Unavailable"}
          </Badge>
        );
      },
    },
    {
        accessorKey: "amenities",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Amenities" />
          ),
        cell: ({ row }) => {
            const amenities = row.original.amenities
            const amenitiesLength = amenities.length
            return <HoverCard>
                <HoverCardTrigger>
                    <Button variant="link" size="lg" className="text-left font-bold">{amenitiesLength} </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-fit flex flex-wrap gap-2 border border-neutral-400 rounded-md p-6 bg-muted text-primary">
                    {amenities.map((amenity) => (
                            <Badge key={amenity}>{amenity}</Badge>
                    ))}
                </HoverCardContent>
            </HoverCard>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const room = row.original
            return <div className="text-left">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <div className="size-8 p-0 inline-flex items-center justify-center rounded-md border border-transparent hover:bg-neutral-100 hover:border hover:border-neutral-400">
                            <span className="sr-only">open menu</span>
                            <MoreHorizontal className="w-4 h-4" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() => {
                            }}
                        >
                            Copy room number
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link href={`/dashboard/admin/rooms/edit/${room.id}`}>
                            <DropdownMenuItem>
                                    Edit
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={(e)=> e.preventDefault()}>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <span>
                                        Delete
                                    </span>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the room.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive"
                                            onClick={async () => {
                                                if (!room.id) return;
                                                const result = await deleteRoom(room.id);
                                                if (result.status !== 200) {
                                                    alert(result.error || result.message || "Failed to delete room");
                                                }
                                            }}
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        }
    }
  ]; 
  
// Define combined booking type
export type CombinedBooking = {
    id: string;
    type: 'HOTEL' | 'FLIGHT' | 'VOYAGE';
    userId: string;
    userName?: string | null;
    userImage?: string | null;
    userPhone?: string | null;
    userEmail?: string | null;
    status: string;
    createdAt: Date;
    // Hotel booking specific
    hotelName?: string;
    roomType?: string;
    checkIn?: Date;
    checkOut?: Date;
    // Flight booking specific
    flightNumber?: string;
    airline?: string;
    departureCity?: string;
    arrivalCity?: string;
    departureTime?: Date;
    seatNumber?: string;
    // For VOYAGE type - linking hotel and flight bookings
    hotelBookingId?: string;
    flightBookingId?: string;
    // For all booking types
    price: number;
};

export const bookingsColumns: ColumnDef<CombinedBooking>[] = [
    {
        id: "user",
        header: "User",
        cell: ({ row }) => {
            const booking = row.original;
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage 
                            src={booking.userImage || ""} 
                            alt={`${booking.userName || 'User'}'s avatar`}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10">
                            {booking.userName ? booking.userName.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5 text-primary" />}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{booking.userName || 'Unknown User'}</span>
                        <span className="text-xs text-muted-foreground">{booking.userEmail}</span>
                    </div>
                </div>
            );
        }
    },
    {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => {
            const booking = row.original;
            return (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.userPhone || 'No phone'}</span>
                </div>
            );
        }
    },
    {
        id: "bookingDetails",
        header: "Booking Details",
        cell: ({ row }) => {
            const booking = row.original;
            
            if (booking.type === 'VOYAGE') {
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-teal-600">Voyage Package</span>
                        <div className="flex flex-col gap-2 mt-1">
                            {/* Hotel details */}
                            <div className="p-2 bg-muted/50 rounded-md">
                                <span className="font-medium text-sm">Hotel: {booking.hotelName}</span>
                                <div className="text-xs text-muted-foreground">
                                    {booking.roomType && <div>Room: {booking.roomType}</div>}
                                    {booking.checkIn && booking.checkOut && (
                                        <div>
                                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Flight details */}
                            <div className="p-2 bg-muted/50 rounded-md">
                                <span className="font-medium text-sm">Flight: {booking.airline} - {booking.flightNumber}</span>
                                <div className="text-xs flex items-center gap-1">
                                    <span>{booking.departureCity}</span>
                                    <ArrowRight className="w-3 h-3" />
                                    <span>{booking.arrivalCity}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {booking.departureTime && (
                                        <div>Departure: {formatDateTime(booking.departureTime)}</div>
                                    )}
                                    {booking.seatNumber && (
                                        <div>Seat: {booking.seatNumber}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            } else if (booking.type === 'HOTEL') {
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{booking.hotelName}</span>
                        <span className="text-sm">{booking.roomType}</span>
                        <div className="text-xs text-muted-foreground mt-1">
                            {booking.checkIn && booking.checkOut && (
                                <>
                                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                </>
                            )}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{booking.airline} - {booking.flightNumber}</span>
                        <div className="text-sm flex items-center gap-1 mt-1">
                            <span>{booking.departureCity}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>{booking.arrivalCity}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {booking.departureTime && (
                                <>
                                    Departure: {formatDateTime(booking.departureTime)}
                                </>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Seat: {booking.seatNumber}
                        </div>
                    </div>
                );
            }
        }
    },
    {
        accessorKey: "type",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => {
            const type = row.original.type;
            return (
                <Badge variant={
                    type === 'HOTEL' ? 'outline' : 
                    type === 'FLIGHT' ? 'default' :
                    'success'  // VOYAGE type gets a success variant
                }>
                    {type.toLowerCase()}
                </Badge>
            );
        }
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge variant={
                    status === "CONFIRMED" ? "success" :
                    status === "PENDING" ? "warning" :
                    status === "COMPLETED" ? "default" :
                    "destructive"
                }>
                    {status.toLowerCase()}
                </Badge>
            );
        }
    },
    {
        accessorKey: "price",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ row }) => {
            const price = row.original.price;
            return (
                <div className="font-medium">
                    {new Intl.NumberFormat("fr-DZ", {
                        style: "currency",
                        currency: "DZD",
                    }).format(price)}
                </div>
            );
        }
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Booking Date" />
        ),
        cell: ({ row }) => {
            const date = row.original.createdAt;
            return date ? (
                <div className="text-muted-foreground">
                    {new Date(date).toLocaleDateString()}
                </div>
            ) : null;
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const booking = row.original;
            const { data: sessionData } = useSession();
            const isAdmin = sessionData?.user?.role === 'ADMIN';

            return (
                <div className="text-left">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div className="size-8 p-0 inline-flex items-center justify-center rounded-md border border-transparent hover:bg-neutral-100 hover:border hover:border-neutral-400">
                                <span className="sr-only">open menu</span>
                                <MoreHorizontal className="w-4 h-4" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                onClick={() => {
                                    navigator.clipboard.writeText(booking.id);
                                    toast.success("Booking ID copied to clipboard");
                                }}
                            >
                                Copy booking ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <Link href={`/dashboard/admin/${booking.type.toLowerCase()}s/bookings/${booking.id}`}>
                                <DropdownMenuItem>
                                    View details
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            
                            {/* Only show confirm button for PENDING bookings */}
                            {booking.status === 'PENDING' && (
                                <>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <div className="flex items-center gap-2 w-full cursor-pointer">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Confirm booking
                                                </div>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirm this booking?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        <span>
                                                            {booking.type === 'VOYAGE' 
                                                                ? "This will confirm both the hotel and flight bookings."
                                                                : "This will confirm the booking."}
                                                        </span>
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={async (e) => {
                                                            const button = e.currentTarget;
                                                            const originalText = button.textContent;
                                                            
                                                            try {
                                                                button.textContent = "Confirming...";
                                                                button.disabled = true;
                                                                
                                                                const result = await confirmBooking(booking.id, booking.type);
                                                                
                                                                if (!result.success) {
                                                                    toast.error(result.message || "Failed to confirm booking");
                                                                    button.textContent = originalText;
                                                                    button.disabled = false;
                                                                } else {
                                                                    toast.success("Booking confirmed successfully");
                                                                    window.location.reload();
                                                                }
                                                            } catch (error) {
                                                                toast.error("Failed to confirm booking");
                                                                button.textContent = originalText;
                                                                button.disabled = false;
                                                            }
                                                        }}
                                                    >
                                                        Confirm
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            
                            <DropdownMenuItem onSelect={(e)=> e.preventDefault()}>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <div className="flex items-center gap-2 w-full cursor-pointer">
                                            <X className="h-4 w-4 text-red-500" />
                                            Cancel booking
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                <span>
                                                    {booking.type === 'VOYAGE' 
                                                        ? "This will cancel both the hotel and flight bookings."
                                                        : "This will cancel the booking."}
                                                </span>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>No, keep it</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive"
                                                onClick={async (e) => {
                                                    const button = e.currentTarget;
                                                    const originalText = button.textContent;
                                                    
                                                    try {
                                                        button.textContent = "Cancelling...";
                                                        button.disabled = true;
                                                        
                                                        const result = await cancelBooking(booking.id, booking.type);
                                                        
                                                        if (!result.success) {
                                                            toast.error(result.message || "Failed to cancel booking");
                                                            button.textContent = originalText;
                                                            button.disabled = false;
                                                        } else {
                                                            toast.success(
                                                                booking.type === 'VOYAGE' 
                                                                    ? "Voyage booking cancelled successfully" 
                                                                    : `${booking.type} booking cancelled successfully`
                                                            );
                                                            window.location.reload();
                                                        }
                                                    } catch (error) {
                                                        toast.error("Failed to cancel booking");
                                                        console.error("Error cancelling booking:", error);
                                                        button.textContent = originalText;
                                                        button.disabled = false;
                                                    }
                                                }}
                                            >
                                                Yes, cancel booking
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuItem>
                            {isAdmin && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={(e)=> e.preventDefault()}>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <span className="flex items-center gap-2 w-full cursor-pointer">
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                    Delete booking
                                                </span>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete this booking?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        <span className="text-red-500 d-block">
                                                            {booking.type === 'VOYAGE' 
                                                                ? "This will permanently delete both the hotel and flight bookings. This action cannot be undone."
                                                                : "This will permanently delete the booking from. This action cannot be undone."}
                                                        </span>
                                                        <br />
                                                        
                                                        {booking.status !== 'CANCELLED' && (
                                                            <span className="mt-3 text-yellow-700">
                                                                <strong>Warning:</strong> This booking is still {booking.status.toLowerCase()}. 
                                                                Consider cancelling it first instead of deleting.
                                                            </span>
                                                        )}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-red-600 hover:bg-red-700"
                                                        onClick={async (e) => {
                                                            const button = e.currentTarget;
                                                            const originalText = button.textContent;
                                                            
                                                            try {
                                                                button.textContent = "Deleting...";
                                                                button.disabled = true;
                                                                
                                                                const result = await deleteBooking(booking.id, booking.type);
                                                                
                                                                if (!result.success) {
                                                                    toast.error(result.message || "Failed to delete booking");
                                                                    button.textContent = originalText;
                                                                    button.disabled = false;
                                                                } else {
                                                                    toast.success(
                                                                        booking.type === 'VOYAGE' 
                                                                            ? "Voyage booking deleted successfully" 
                                                                            : `${booking.type} booking deleted successfully`
                                                                    );
                                                                    window.location.reload();
                                                                }
                                                            } catch (error) {
                                                                toast.error("Failed to delete booking");
                                                                console.error("Error deleting booking:", error);
                                                                button.textContent = originalText;
                                                                button.disabled = false;
                                                            }
                                                        }}
                                                    >
                                                        Yes, delete permanently
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        }
    }
]; 
  