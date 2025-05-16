'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import BookingConfirmationDialog from '@/components/BookingConfirmationDialog';
import type { ContactFormData } from '@/components/ContactDetailsForm';
import type { PassengerData } from '@/components/PassengerDetails';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface BookingSummaryClientProps {
  children: ReactNode;
  searchParams: {
    bookingId?: string;
    hotelId?: string;
    flightId?: string;
    roomId?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: string;
  };
}

export default function BookingSummaryClient({
  children,
  searchParams
}: BookingSummaryClientProps) {
  const router = useRouter();
  const [contactDetails, setContactDetails] = useState<ContactFormData | null>(null);
  const [passengerDetails, setPassengerDetails] = useState<PassengerData[]>([]);
  const [isContactValid, setIsContactValid] = useState(false);
  const [isPassengerValid, setIsPassengerValid] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number | undefined>(undefined);
  const [bookingParams, setBookingParams] = useState(searchParams);

  // This will load any missing params from localStorage if they're not in the URL
  useEffect(() => {
    // Only run in the browser
    if (typeof window !== 'undefined') {
      const params = { ...searchParams };

      // If we don't have a hotelId in URL, check localStorage
      if (!params.hotelId) {
        const storedHotelId = localStorage.getItem('selectedHotelId');
        if (storedHotelId) params.hotelId = storedHotelId;
      }

      // If we don't have a roomId in URL, check localStorage
      if (!params.roomId) {
        const storedRoomId = localStorage.getItem('selectedRoomId');
        if (storedRoomId) params.roomId = storedRoomId;
      }

      // If we don't have a flightId in URL, check localStorage
      if (!params.flightId) {
        const storedFlightId = localStorage.getItem('selectedFlightId');
        if (storedFlightId) params.flightId = storedFlightId;
      }

      // Load dates and guest count from localStorage for the booking summary
      const checkInDate = localStorage.getItem('checkInDate');
      const checkOutDate = localStorage.getItem('checkOutDate');
      const guestCount = localStorage.getItem('guestCount');
      
      // Pass dates and guest count to the component via URL query params
      // This won't update state but will help server-side rendering
      if (checkInDate) params.checkInDate = checkInDate;
      if (checkOutDate) params.checkOutDate = checkOutDate;
      if (guestCount) params.guestCount = guestCount;

      // If we have updated any params, update URL or state
      if (JSON.stringify(params) !== JSON.stringify(searchParams)) {
        setBookingParams(params);
        
        // Update the URL with the complete params
        if (params.hotelId || params.flightId || params.roomId) {
          const url = new URL(window.location.href);
          
          if (params.bookingId) url.searchParams.set('bookingId', params.bookingId);
          if (params.hotelId) url.searchParams.set('hotelId', params.hotelId);
          if (params.roomId) url.searchParams.set('roomId', params.roomId);
          if (params.flightId) url.searchParams.set('flightId', params.flightId);
          if (params.checkInDate) url.searchParams.set('checkInDate', params.checkInDate);
          if (params.checkOutDate) url.searchParams.set('checkOutDate', params.checkOutDate);
          if (params.guestCount) url.searchParams.set('guestCount', params.guestCount);
          
          // Replace the URL without reloading the page
          window.history.replaceState({}, '', url.toString());
        }
      }
    }
  }, [searchParams]);

  // Calculate total price based on real data from localStorage
  useEffect(() => {
    // Try to get price from localStorage
    const storedPendingBooking = localStorage.getItem('pendingHotelBooking');
    if (storedPendingBooking) {
      try {
        const bookingData = JSON.parse(storedPendingBooking);
        if (bookingData.price) {
          // Calculate nights if we have dates
          if (bookingData.checkIn && bookingData.checkOut) {
            const checkIn = new Date(bookingData.checkIn);
            const checkOut = new Date(bookingData.checkOut);
            if (checkIn && checkOut) {
              const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
              setTotalPrice(bookingData.price * nights);
              return;
            }
          }
          setTotalPrice(bookingData.price);
        }
      } catch (e) {
        console.error("Error parsing stored booking data", e);
      }
    }
  }, []);

  // Effect to register form change handlers
  useEffect(() => {
    // Find the ContactDetailsForm instance and attach the onFormChange handler
    const contactForm = document.querySelector('[data-contact-form]');
    if (contactForm) {
      const originalOnFormChange = (contactForm as any).__onFormChange;
      (contactForm as any).__onFormChange = (data: ContactFormData, isValid: boolean) => {
        if (originalOnFormChange) originalOnFormChange(data, isValid);
        setContactDetails(data);
        setIsContactValid(isValid);
      };
    }

    // Find the PassengerDetails instance and attach the onPassengerDataChange handler
    const passengerForm = document.querySelector('[data-passenger-form]');
    if (passengerForm) {
      const originalOnPassengerChange = (passengerForm as any).__onPassengerChange;
      (passengerForm as any).__onPassengerChange = (data: PassengerData, isValid: boolean) => {
        if (originalOnPassengerChange) originalOnPassengerChange(data, isValid);
        setPassengerDetails([data]);
        setIsPassengerValid(isValid);
      };
    }
  }, []);

  const handleConfirmClick = () => {
    if (isFormComplete) {
      setDialogOpen(true);
    }
  };

  // Check if all required information is available
  const isFormComplete = contactDetails && isContactValid && passengerDetails.length > 0 && isPassengerValid;

  return (
    <>
      {children}
      
      {/* Sticky Footer with Confirmation Button */}
      <div className="sticky bottom-0 left-0 w-full bg-white border-t shadow-md py-4 z-10">
        <div className="max-w-screen-xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            {isFormComplete ? (
              <div className="flex items-center text-emerald-600">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">All details complete</span>
              </div>
            ) : (
              <span className="text-sm text-gray-600">
                Please complete all required information
              </span>
            )}
          </div>
          
          <Button
            onClick={handleConfirmClick}
            disabled={!isFormComplete}
            className="bg-rose-500 hover:bg-rose-600 text-white"
          >
            Confirm Booking
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {contactDetails && (
        <BookingConfirmationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          contactDetails={contactDetails}
          passengerDetails={passengerDetails}
          bookingId={bookingParams.bookingId}
          hotelId={bookingParams.hotelId}
          flightId={bookingParams.flightId}
          roomId={bookingParams.roomId}
          totalPrice={totalPrice}
        />
      )}
    </>
  );
} 