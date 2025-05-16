import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get user session
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
      }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get latest hotel booking
    const latestHotelBooking = await db.hotelBooking.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        hotel: true,
        room: true,
      },
    });
    
    // Get latest flight booking
    const latestFlightBooking = await db.flightBooking.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        flight: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      latestHotelBooking,
      latestFlightBooking,
    });
  } catch (error) {
    console.error('Error fetching latest bookings:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    }, { status: 500 });
  }
} 