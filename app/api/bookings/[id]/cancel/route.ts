import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { cancelBooking } from '@/actions/booking';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const bookingId = params.id;
    
    // Get request body
    const body = await request.json();
    const { bookingType } = body;
    
    if (!bookingType || (bookingType !== 'HOTEL' && bookingType !== 'FLIGHT')) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking type provided' },
        { status: 400 }
      );
    }
    
    // Call the server action to cancel the booking
    const result = await cancelBooking(bookingId, bookingType);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to cancel booking' },
      { status: 500 }
    );
  }
} 