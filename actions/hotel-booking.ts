'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';

export async function bookHotelRoom(
  roomId: string,
  hotelId: string,
  checkIn: Date,
  checkOut: Date,
  totalPrice: number
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to book a room",
        redirectToLogin: true
      };
    }
    
    // Calculate total price based on number of nights
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    // Create booking record
    const booking = await db.hotelBooking.create({
      data: {
        userId: session.user.id,
        hotelId: hotelId,
        roomId: roomId,
        checkIn: checkIn,
        checkOut: checkOut,
        totalPrice: totalPrice * nights,
        status: 'PENDING',
      }
    });

    console.log(`Hotel booking created with ID: ${booking.id}`);
    revalidatePath(`/hotel-room/${hotelId}`);
    
    const redirectUrl = `/booking-summary?bookingId=${booking.id}&hotelId=${hotelId}&roomId=${roomId}`;
    console.log(`Redirecting to: ${redirectUrl}`);
    
    return {
      success: true,
      message: "Room booked successfully",
      bookingId: booking.id,
      redirectUrl: redirectUrl
    };
  } catch (error) {
    console.error("Error booking room:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to book room"
    };
  }
}

export async function getHotelBookingDetails(id: string) {
  try {
    if (!id) {
      console.error("No hotel booking ID provided");
      return {
        success: false,
        message: "No hotel booking ID provided"
      };
    }

    console.log(`Fetching hotel booking details for ID: ${id}`);
    
    const hotelBooking = await db.hotelBooking.findUnique({
      where: { id },
      include: {
        hotel: true,
        room: true
      }
    });

    if (!hotelBooking) {
      console.error(`Hotel booking with ID ${id} not found`);
      return {
        success: false,
        message: "Hotel booking not found"
      };
    }

    console.log(`Found hotel booking: ${JSON.stringify(hotelBooking, null, 2)}`);
    
    return {
      success: true,
      data: hotelBooking
    };
  } catch (error) {
    console.error("Error fetching hotel booking details:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch hotel booking details"
    };
  }
} 