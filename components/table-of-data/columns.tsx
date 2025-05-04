"use client"
import { ColumnDef } from "@tanstack/react-table";
import { Hotel, User } from "@/lib/definitions";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { Badge } from "@/components/ui/badge";
import { FaArrowRight, FaStar } from "react-icons/fa";
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
import { Bed, MoreHorizontal } from "lucide-react";
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
import { format as dateFormat } from "date-fns";
import { deleteFlight } from "@/actions/flight";
import React from "react";
import Image from "next/image";
import { deleteRoom } from "@/actions/room";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
                    <FaStar className={`w-4 h-4 ${rating > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
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
                    {row.original.departureCity} <FaArrowRight /> {row.original.arrivalCity}
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
                        Departure: {departureTime ? dateFormat(new Date(departureTime), "PPp") : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Arrival: {arrivalTime ? dateFormat(new Date(arrivalTime), "PPp") : "N/A"}
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

export const userColumn: ColumnDef<User>[] = [
    {
        header: 'name',
        accessorKey: "name"
    },
    {
        header: 'image',
        accessorKey: 'image',
        cell: ({ row }) => {
            const imageUrl = row.original.image;
            return imageUrl ? (
                <div className="relative h-10 w-10">
                    <Image
                        src={imageUrl}
                        alt={`${row.original.name}'s profile picture`}
                        fill
                        className="rounded-full object-cover"
                        sizes="40px"
                    />
                </div>
            ) : (
                <div className="h-10 w-10 rounded-full bg-muted" />
            );
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
                                                    alert(result.error || result.message || "Failed to delete U");
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