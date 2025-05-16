import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactDetailsForm from "@/components/ContactDetailsForm";
import PassengerDetails from "@/components/PassengerDetails";
import TripSummary from "@/components/TripSummary";
import BookingSummaryClient from "@/app/booking-summary/page.client";

// Helper function to format dates in the same format as TripSummary component
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

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

// Wrap client components with Suspense
const ContactDetailsFormWithSuspense = () => (
  <Suspense fallback={<div className="h-[200px] w-full bg-gray-100 animate-pulse rounded-md"></div>}>
    <ContactDetailsForm />
  </Suspense>
);

const PassengerDetailsWithSuspense = ({ passengerNumber }: { passengerNumber: number }) => (
  <Suspense fallback={<div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md"></div>}>
    <PassengerDetails passengerNumber={passengerNumber} />
  </Suspense>
);

// TripSummary wrapper to handle the async component
const TripSummaryWrapper = ({ 
  searchParams 
}: { 
  searchParams: { 
    bookingId?: string; 
    hotelId?: string; 
    flightId?: string; 
    roomId?: string;
    hotelBookingId?: string; 
    flightBookingId?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: string;
  } 
}) => {
  // For backward compatibility, if we have hotelBookingId/flightBookingId but no bookingId,
  // use those values as bookingId
  const bookingId = searchParams.bookingId || searchParams.hotelBookingId || searchParams.flightBookingId;
  
  return (
    <Suspense fallback={<div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-md"></div>}>
      {/* @ts-ignore Server Component using async/await */}
      <TripSummary 
        bookingId={bookingId}
        hotelId={searchParams.hotelId}
        flightId={searchParams.flightId}
        roomId={searchParams.roomId}
        checkInDate={searchParams.checkInDate}
        checkOutDate={searchParams.checkOutDate}
        guestCount={searchParams.guestCount}
        departureDate={searchParams.checkInDate ? formatDate(new Date(searchParams.checkInDate)) : undefined}
        arrivalDate={searchParams.checkOutDate ? formatDate(new Date(searchParams.checkOutDate)) : undefined}
        participants={searchParams.guestCount ? `${searchParams.guestCount} ${parseInt(searchParams.guestCount) === 1 ? 'person' : 'people'}` : undefined}
      />
    </Suspense>
  );
};

// Main page component
export default function BookingSummaryPage({
  searchParams
}: {
  searchParams: { 
    bookingId?: string; 
    hotelId?: string; 
    flightId?: string; 
    roomId?: string;
    hotelBookingId?: string; 
    flightBookingId?: string; 
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: string;
  }
}) {
  return (
    <>
      <NavbarWithSuspense />
      
      <BookingSummaryClient searchParams={searchParams}>
        <main className="max-w-screen-xl mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="text-center mb-8 border-b mt-16 pb-4">
            <h1 className="text-xl font-semibold text-gray-700">Your contact details</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-10">
              {/* Contact Details Form */}
              <ContactDetailsFormWithSuspense />
              
              {/* Passenger Details */}
              <PassengerDetailsWithSuspense passengerNumber={1} />
            </div>
            
            {/* Right Column - Trip Summary */}
            <div className="lg:col-span-1">
              <TripSummaryWrapper searchParams={searchParams} />
              
              {/* Contact and Support Information */}
              <div className="mt-8 space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-semibold uppercase">NEED HELP? CALL US</h3>
                  <p className="text-lg font-bold mt-1">0-000 000 000</p>
                  <p className="text-xs text-gray-500 mt-2">
                    We are open Monday to Friday from 11:00 am to 7:00 pm (local call charges apply)
                  </p>
                </div>
                
                <div className="border-t pt-6">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="text-center mt-2">
                    <h3 className="text-sm font-semibold uppercase">OUR PROMISE</h3>
                    <div className="space-y-2 mt-3 text-sm">
                      <p>Up to 70% off luxury & boutique hotels</p>
                      <p>Member services team available 7 days per week</p>
                      <p>ATOL Protected Holidays - complete financial protection</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="text-center mt-2">
                    <h3 className="text-sm font-semibold uppercase">SECURE PAYMENT</h3>
                    <p className="text-sm mt-2">
                      Payment in installments according to eligibility by credit card
                    </p>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <h3 className="text-sm font-medium">NEED HELP TO MAKE A BOOKING?</h3>
                  <button className="mt-2 border border-gray-300 rounded-sm px-4 py-2 text-sm">
                    Contact us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </BookingSummaryClient>
      
      <FooterWithSuspense />
    </>
  );
} 