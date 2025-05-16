import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { CheckCircle2, Calendar, MapPin, Phone, Mail, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TripSummary from "@/components/TripSummary";

// Client Components with Suspense
const NavbarWithSuspense = () => (
  <Suspense fallback={<div className="h-16 w-full bg-gray-900"></div>}>
    <Navbar />
  </Suspense>
);

const FooterWithSuspense = () => (
  <Suspense fallback={<div className="h-60 w-full bg-emerald-50"></div>}>
    <Footer />
  </Suspense>
);

export const metadata: Metadata = {
  title: 'Booking Confirmation',
  description: 'Your booking has been confirmed',
};

interface BookingConfirmationParams {
  searchParams: {
    bookingId?: string;
    hotelId?: string;
    flightId?: string;
    roomId?: string;
  }
}

export default async function BookingConfirmationPage({ searchParams }: BookingConfirmationParams) {
  const { bookingId, hotelId, flightId, roomId } = searchParams;
  
  // Get booking details if available
  let booking;
  if (bookingId) {
    try {
      booking = await db.hotelBooking.findUnique({
        where: { id: bookingId },
        include: {
          hotel: true,
          room: true,
          user: true,
        },
      });
    } catch (error) {
      console.error("Error fetching booking:", error);
    }
  }

  return (
    <>
      <NavbarWithSuspense />
      
      <main className="max-w-screen-xl mx-auto px-4 py-8 pt-16">
        <div className="bg-emerald-50 rounded-lg p-8 mb-12 flex flex-col items-center text-center">
          <div className="bg-emerald-100 rounded-full p-4 mb-4">
            <CheckCircle2 size={48} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Thank you for your booking. We've sent a confirmation to your email with all the details.
          </p>
          
          {booking && (
            <div className="mt-6 text-gray-700">
              <p className="font-medium">Booking Reference: <span className="font-bold">{booking.id.substring(0, 8).toUpperCase()}</span></p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trip Details */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              <div className="border-l-4 border-teal-500 pl-4 py-1 mb-6">
                <h2 className="text-lg font-medium">Your Booking Details</h2>
              </div>

              {/* Trip Summary */}
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <Suspense fallback={<div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-md"></div>}>
                  {/* @ts-ignore Server Component using async/await */}
                  <TripSummary 
                    bookingId={bookingId}
                    hotelId={hotelId}
                    flightId={flightId}
                    roomId={roomId}
                  />
                </Suspense>
              </div>

              {/* What's Next Section */}
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium mb-4">What's Next</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">Check Your Email</h4>
                      <p className="text-gray-600 text-sm">We've sent you a confirmation email with all the details of your booking.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">Mark Your Calendar</h4>
                      <p className="text-gray-600 text-sm">Add your travel dates to your calendar so you don't forget.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">Plan Your Activities</h4>
                      <p className="text-gray-600 text-sm">Start planning what you'll do at your destination.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Help and Support */}
          <div className="lg:col-span-1">
            <div className="border-l-4 border-teal-500 pl-4 py-1 mb-6">
              <h2 className="text-lg font-medium">Help & Support</h2>
            </div>
            
            <div className="bg-white border rounded-lg p-6 shadow-sm space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Need assistance?</h3>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  <span className="text-gray-600">0-000 000 000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-500" />
                  <span className="text-gray-600">support@yourtravel.com</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Manage Your Booking</h3>
                <Button variant="outline" className="w-full justify-between" asChild>
                  <Link href="/dashboard/bookings">
                    View in your account
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Explore More</h3>
                <Button className="w-full justify-between bg-rose-500 hover:bg-rose-600" asChild>
                  <Link href="/hotels">
                    Browse more destinations
                    <Home size={16} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <FooterWithSuspense />
    </>
  );
} 