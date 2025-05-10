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

    revalidatePath(`/hotel-room/${hotelId}`);
    
    return {
      success: true,
      message: "Room booked successfully",
      bookingId: booking.id
    };
  } catch (error) {
    console.error("Error booking room:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to book room"
    };
  }
} 