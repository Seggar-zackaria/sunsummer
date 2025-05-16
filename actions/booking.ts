'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import type { ContactFormData } from '@/components/ContactDetailsForm';
import type { PassengerData } from '@/components/PassengerDetails';
import { CombinedBooking } from '@/components/table-of-data/columns';

interface BookingConfirmationParams {
  contactDetails: ContactFormData;
  passengerDetails: PassengerData[];
  bookingId?: string;
  hotelId?: string;
  flightId?: string;
  roomId?: string;
}

interface BookingConfirmationResult {
  success: boolean;
  bookingId?: string;
  error?: string;
}

export async function createBookingConfirmation({
  contactDetails,
  passengerDetails,
  bookingId,
  hotelId,
  flightId,
  roomId
}: BookingConfirmationParams): Promise<BookingConfirmationResult> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Update user contact info
    await db.user.update({
      where: { id: userId },
      data: {
        phone: `+${contactDetails.countryCode}${contactDetails.mobileNumber}`,
        address: `${contactDetails.address}, ${contactDetails.townCity}, ${contactDetails.postcode}, ${contactDetails.country}`
      }
    });

    // If we have an existing booking ID, update it
    if (bookingId) {
      const updatedBooking = await db.hotelBooking.update({
        where: {
          id: bookingId,
          userId: userId
        },
        data: {
          status: 'CONFIRMED'
        }
      });

      revalidatePath('/booking-summary');
      revalidatePath('/booking-confirmation');

      return {
        success: true,
        bookingId: updatedBooking.id
      };
    }

    // Otherwise create a new booking, ensuring all required fields are provided
    if (!hotelId || !roomId) {
      return {
        success: false,
        error: 'Missing required booking information'
      };
    }

    const newBooking = await db.hotelBooking.create({
      data: {
        status: 'CONFIRMED',
        userId: userId,
        hotelId: hotelId,
        roomId: roomId,
        checkIn: new Date(), // This should be replaced with actual dates from the booking flow
        checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
        totalPrice: 0 // This should be calculated based on actual prices
      }
    });

    // If we have a flight ID, create a flight booking as well
    if (flightId) {
      await db.flightBooking.create({
        data: {
          userId: userId,
          flightId: flightId,
          seatNumber: 'A1', // This should be dynamically assigned
          status: 'CONFIRMED',
          price: 0 // This should be calculated based on actual prices
        }
      });
    }

    revalidatePath('/booking-summary');
    revalidatePath('/booking-confirmation');

    return {
      success: true,
      bookingId: newBooking.id
    };
  } catch (error) {
    console.error('Error confirming booking:', error);
    return {
      success: false,
      error: 'Failed to confirm booking'
    };
  }
}

// Fetch both hotel and flight bookings, combine them into a unified data structure
export async function getCombinedBookings() {
  try {
    // Fetch hotel bookings with related data
    const hotelBookings = await db.hotelBooking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            phone: true
          }
        },
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        room: {
          select: {
            id: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch flight bookings with related data
    const flightBookings = await db.flightBooking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            phone: true
          }
        },
        flight: {
          select: {
            id: true,
            flightNumber: true,
            airline: true,
            departureCity: true,
            arrivalCity: true,
            departureTime: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform hotel bookings to unified format
    const hotelBookingsFormatted: CombinedBooking[] = hotelBookings.map(booking => ({
      id: booking.id,
      type: 'HOTEL',
      userId: booking.userId,
      userName: booking.user.name,
      userImage: booking.user.image,
      userPhone: booking.user.phone,
      userEmail: booking.user.email,
      status: booking.status,
      createdAt: booking.createdAt,
      hotelName: booking.hotel.name,
      roomType: booking.room.type,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      price: booking.totalPrice
    }));

    // Transform flight bookings to unified format
    const flightBookingsFormatted: CombinedBooking[] = flightBookings.map(booking => ({
      id: booking.id,
      type: 'FLIGHT',
      userId: booking.userId,
      userName: booking.user.name,
      userImage: booking.user.image,
      userPhone: booking.user.phone,
      userEmail: booking.user.email,
      status: booking.status,
      createdAt: booking.createdAt,
      flightNumber: booking.flight.flightNumber,
      airline: booking.flight.airline,
      departureCity: booking.flight.departureCity,
      arrivalCity: booking.flight.arrivalCity,
      departureTime: booking.flight.departureTime,
      seatNumber: booking.seatNumber,
      price: booking.price
    }));

    // Combine and sort both booking types by creation date
    const combinedBookings = [...hotelBookingsFormatted, ...flightBookingsFormatted]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      success: true,
      data: combinedBookings
    };
  } catch (error) {
    console.error("Error fetching combined bookings:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch bookings",
    };
  }
}

// Fetch both hotel and flight bookings, combine them into a unified data structure
// with voyage detection (hotel + flight booked by same user within 10 minutes)
export async function getCombinedBookingsWithVoyages() {
  try {
    // Fetch hotel bookings with related data
    const hotelBookings = await db.hotelBooking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            phone: true
          }
        },
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        room: {
          select: {
            id: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch flight bookings with related data
    const flightBookings = await db.flightBooking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            phone: true
          }
        },
        flight: {
          select: {
            id: true,
            flightNumber: true,
            airline: true,
            departureCity: true,
            arrivalCity: true,
            departureTime: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Look for potential voyage combinations
    // We'll identify voyages when a user has both hotel and flight bookings
    // created within a small time window (e.g., 10 minutes)
    const voyageBookings: CombinedBooking[] = [];
    const usedBookingIds = new Set<string>();
    const TIME_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds

    // Identify voyages (hotel and flight bookings by the same user within 10 minutes)
    for (const hotelBooking of hotelBookings) {
      for (const flightBooking of flightBookings) {
        // Skip if either booking is already part of a voyage
        if (usedBookingIds.has(hotelBooking.id) || usedBookingIds.has(flightBooking.id)) {
          continue;
        }

        // Check if same user and bookings created within time threshold
        if (hotelBooking.userId === flightBooking.userId) {
          const timeDiff = Math.abs(
            hotelBooking.createdAt.getTime() - flightBooking.createdAt.getTime()
          );
          
          if (timeDiff <= TIME_THRESHOLD) {
            // Create a voyage booking
            const voyageId = `voyage-${hotelBooking.id}-${flightBooking.id}`;
            
            // Mark these bookings as used
            usedBookingIds.add(hotelBooking.id);
            usedBookingIds.add(flightBooking.id);
            
            // Create the voyage booking object
            voyageBookings.push({
              id: voyageId,
              type: 'VOYAGE',
              userId: hotelBooking.userId,
              userName: hotelBooking.user.name,
              userImage: hotelBooking.user.image,
              userPhone: hotelBooking.user.phone,
              userEmail: hotelBooking.user.email,
              // Use the most progress status (COMPLETED > CONFIRMED > PENDING > CANCELLED)
              status: getHighestPriorityStatus(hotelBooking.status, flightBooking.status),
              // Use the earlier booking date as the voyage creation date
              createdAt: hotelBooking.createdAt < flightBooking.createdAt 
                ? hotelBooking.createdAt 
                : flightBooking.createdAt,
              // Hotel booking details
              hotelName: hotelBooking.hotel.name,
              roomType: hotelBooking.room.type,
              checkIn: hotelBooking.checkIn,
              checkOut: hotelBooking.checkOut,
              hotelBookingId: hotelBooking.id,
              // Flight booking details
              flightNumber: flightBooking.flight.flightNumber,
              airline: flightBooking.flight.airline,
              departureCity: flightBooking.flight.departureCity,
              arrivalCity: flightBooking.flight.arrivalCity,
              departureTime: flightBooking.flight.departureTime,
              seatNumber: flightBooking.seatNumber,
              flightBookingId: flightBooking.id,
              // Combined price
              price: hotelBooking.totalPrice + flightBooking.price
            });
            
            // Break the inner loop since we found a match for this hotel booking
            break;
          }
        }
      }
    }

    // Transform remaining hotel bookings to unified format (those not in voyages)
    const hotelBookingsFormatted: CombinedBooking[] = hotelBookings
      .filter(booking => !usedBookingIds.has(booking.id))
      .map(booking => ({
        id: booking.id,
        type: 'HOTEL',
        userId: booking.userId,
        userName: booking.user.name,
        userImage: booking.user.image,
        userPhone: booking.user.phone,
        userEmail: booking.user.email,
        status: booking.status,
        createdAt: booking.createdAt,
        hotelName: booking.hotel.name,
        roomType: booking.room.type,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        price: booking.totalPrice
      }));

    // Transform remaining flight bookings to unified format (those not in voyages)
    const flightBookingsFormatted: CombinedBooking[] = flightBookings
      .filter(booking => !usedBookingIds.has(booking.id))
      .map(booking => ({
        id: booking.id,
        type: 'FLIGHT',
        userId: booking.userId,
        userName: booking.user.name,
        userImage: booking.user.image,
        userPhone: booking.user.phone,
        userEmail: booking.user.email,
        status: booking.status,
        createdAt: booking.createdAt,
        flightNumber: booking.flight.flightNumber,
        airline: booking.flight.airline,
        departureCity: booking.flight.departureCity,
        arrivalCity: booking.flight.arrivalCity,
        departureTime: booking.flight.departureTime,
        seatNumber: booking.seatNumber,
        price: booking.price
      }));

    // Combine all bookings and sort by creation date
    const combinedBookings = [
      ...voyageBookings,
      ...hotelBookingsFormatted, 
      ...flightBookingsFormatted
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      success: true,
      data: combinedBookings
    };
  } catch (error) {
    console.error("Error fetching combined bookings:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch bookings",
    };
  }
}

// Helper function to determine the highest priority status
function getHighestPriorityStatus(status1: string, status2: string): string {
  const statusPriority: Record<string, number> = {
    'CANCELLED': 0,
    'PENDING': 1,
    'CONFIRMED': 2,
    'COMPLETED': 3
  };
  
  const priority1 = statusPriority[status1] || 0;
  const priority2 = statusPriority[status2] || 0;
  
  return priority1 >= priority2 ? status1 : status2;
}

// Function to cancel a booking
export async function cancelBooking(
  bookingId: string, 
  bookingType: 'HOTEL' | 'FLIGHT' | 'VOYAGE'
) {
  try {
    // Validate the request
    if (!bookingId) {
      return {
        success: false,
        message: "Booking ID is required"
      };
    }

    if (bookingType === 'VOYAGE') {
      // For voyage bookings, we need to parse the ID to get the hotel and flight booking IDs
      const bookingIds = bookingId.replace('voyage-', '').split('-');
      if (bookingIds.length !== 2) {
        return {
          success: false,
          message: "Invalid voyage booking ID format"
        };
      }

      const [hotelBookingId, flightBookingId] = bookingIds;
      
      // Cancel both hotel and flight bookings
      await db.$transaction([
        db.hotelBooking.update({
          where: { id: hotelBookingId },
          data: { status: 'CANCELLED' }
        }),
        db.flightBooking.update({
          where: { id: flightBookingId },
          data: { status: 'CANCELLED' }
        })
      ]);
    } else if (bookingType === 'HOTEL') {
      // Cancel hotel booking
      await db.hotelBooking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' }
      });
    } else {
      // Cancel flight booking
      await db.flightBooking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' }
      });
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard/admin/bookings');
    revalidatePath('/dashboard/bookings');

    return {
      success: true,
      message: "Booking cancelled successfully"
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to cancel booking",
    };
  }
}

// Function to create a combined hotel and flight booking (voyage)
export async function createVoyageBooking({
  userId,
  hotelId,
  roomId,
  flightId,
  checkIn,
  checkOut,
  seatNumber
}: {
  userId: string;
  hotelId: string;
  roomId: string;
  flightId: string;
  checkIn: Date;
  checkOut: Date;
  seatNumber?: string;
}) {
  try {
    // Get room and flight data to calculate prices
    const room = await db.room.findUnique({
      where: { id: roomId },
      select: { price: true }
    });
    
    const flight = await db.flight.findUnique({
      where: { id: flightId },
      select: { price: true, availableSeats: true, id: true }
    });
    
    if (!room || !flight) {
      return {
        success: false,
        message: "Room or flight not found"
      };
    }
    
    if (flight.availableSeats <= 0) {
      return {
        success: false,
        message: "No seats available for this flight"
      };
    }
    
    // Calculate hotel booking total price (nights * room price)
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const hotelPrice = room.price * nights;
    
    // Generate seat number if not provided
    const finalSeatNumber = seatNumber || generateSeatNumber();
    
    // Create both bookings in a transaction to ensure either both succeed or both fail
    const [hotelBooking, flightBooking] = await db.$transaction([
      // Create hotel booking
      db.hotelBooking.create({
        data: {
          userId,
          hotelId,
          roomId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          status: 'PENDING',
          totalPrice: hotelPrice
        }
      }),
      
      // Create flight booking
      db.flightBooking.create({
        data: {
          userId,
          flightId,
          seatNumber: finalSeatNumber,
          status: 'PENDING',
          price: flight.price
        }
      }),
      
      // Update available seats
      db.flight.update({
        where: { id: flight.id },
        data: {
          availableSeats: flight.availableSeats - 1
        }
      })
    ]);
    
    // Calculate total price
    const totalPrice = hotelPrice + flight.price;
    
    // Return success with booking IDs and total price
    return {
      success: true,
      message: "Voyage booking created successfully",
      hotelBookingId: hotelBooking.id,
      flightBookingId: flightBooking.id,
      seatNumber: finalSeatNumber,
      totalPrice
    };
  } catch (error) {
    console.error("Error creating voyage booking:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create voyage booking"
    };
  }
}

// Generate a random seat number 
function generateSeatNumber() {
  const rows = 'ABCDEFGHJK'; // Skip I to avoid confusion with 1
  const row = rows.charAt(Math.floor(Math.random() * rows.length));
  const column = Math.floor(Math.random() * 30) + 1;
  return `${row}${column}`;
}

// Function to confirm a booking
export async function confirmBooking(
  bookingId: string, 
  bookingType: 'HOTEL' | 'FLIGHT' | 'VOYAGE'
) {
  try {
    // Validate the request
    if (!bookingId) {
      return {
        success: false,
        message: "Booking ID is required"
      };
    }

    if (bookingType === 'VOYAGE') {
      // For voyage bookings, we need to parse the ID to get the hotel and flight booking IDs
      const bookingIds = bookingId.replace('voyage-', '').split('-');
      if (bookingIds.length !== 2) {
        return {
          success: false,
          message: "Invalid voyage booking ID format"
        };
      }

      const [hotelBookingId, flightBookingId] = bookingIds;
      
      // Confirm both hotel and flight bookings
      await db.$transaction([
        db.hotelBooking.update({
          where: { id: hotelBookingId },
          data: { status: 'CONFIRMED' }
        }),
        db.flightBooking.update({
          where: { id: flightBookingId },
          data: { status: 'CONFIRMED' }
        })
      ]);
    } else if (bookingType === 'HOTEL') {
      // Confirm hotel booking
      await db.hotelBooking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' }
      });
    } else {
      // Confirm flight booking
      await db.flightBooking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' }
      });
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard/admin/bookings');
    revalidatePath('/dashboard/bookings');

    return {
      success: true,
      message: "Booking confirmed successfully"
    };
  } catch (error) {
    console.error("Error confirming booking:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to confirm booking"
    };
  }
}

// Function to permanently delete a booking
export async function deleteBooking(
  bookingId: string, 
  bookingType: 'HOTEL' | 'FLIGHT' | 'VOYAGE'
) {
  try {
    // Validate the request
    if (!bookingId) {
      return {
        success: false,
        message: "Booking ID is required"
      };
    }

    if (bookingType === 'VOYAGE') {
      // For voyage bookings, we need to parse the ID to get the hotel and flight booking IDs
      const bookingIds = bookingId.replace('voyage-', '').split('-');
      if (bookingIds.length !== 2) {
        return {
          success: false,
          message: "Invalid voyage booking ID format"
        };
      }

      const [hotelBookingId, flightBookingId] = bookingIds;
      
      // Delete both hotel and flight bookings in a transaction
      await db.$transaction([
        db.hotelBooking.delete({
          where: { id: hotelBookingId }
        }),
        db.flightBooking.delete({
          where: { id: flightBookingId }
        })
      ]);
    } else if (bookingType === 'HOTEL') {
      // Delete hotel booking
      await db.hotelBooking.delete({
        where: { id: bookingId }
      });
    } else {
      // Delete flight booking
      await db.flightBooking.delete({
        where: { id: bookingId }
      });
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard/admin/bookings');
    revalidatePath('/dashboard/bookings');

    return {
      success: true,
      message: "Booking deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting booking:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete booking",
    };
  }
} 