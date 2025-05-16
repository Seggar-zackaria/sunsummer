'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';

// Generate a random seat number
const generateSeatNumber = () => {
  const rows = 'ABCDEFGHJK'; // Skip I to avoid confusion with 1
  const row = rows.charAt(Math.floor(Math.random() * rows.length));
  const column = Math.floor(Math.random() * 30) + 1;
  return `${row}${column}`;
};

export async function bookFlight(
  flightId: string,
  price: number
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to book a flight",
        redirectToLogin: true
      };
    }
    
    // Check if flight exists and has available seats
    const flight = await db.flight.findUnique({
      where: { id: flightId },
    });
    
    if (!flight) {
      return {
        success: false,
        message: "Flight not found"
      };
    }
    
    if (flight.availableSeats <= 0) {
      return {
        success: false,
        message: "No seats available for this flight"
      };
    }
    
    // Generate a seat number
    const seatNumber = generateSeatNumber();
    
    // Create booking record
    const booking = await db.flightBooking.create({
      data: {
        userId: session.user.id,
        flightId: flightId,
        seatNumber: seatNumber,
        price: price,
        status: 'PENDING',
      }
    });
    
    // Update available seats count
    await db.flight.update({
      where: { id: flightId },
      data: {
        availableSeats: flight.availableSeats - 1
      }
    });

    revalidatePath(`/booking-flight`);
    
    return {
      success: true,
      message: "Flight booked successfully",
      bookingId: booking.id,
      seatNumber: seatNumber,
      redirectUrl: `/booking-summary?bookingId=${booking.id}&flightId=${flightId}`
    };
  } catch (error) {
    console.error("Error booking flight:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to book flight"
    };
  }
}

export async function getFlightBookingDetails(id: string) {
  try {
    const flightBooking = await db.flightBooking.findUnique({
      where: { id },
      include: {
        flight: true
      }
    });

    if (!flightBooking) {
      return {
        success: false,
        message: "Flight booking not found"
      };
    }

    return {
      success: true,
      data: flightBooking
    };
  } catch (error) {
    console.error("Error fetching flight booking details:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch flight booking details"
    };
  }
} 