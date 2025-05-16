'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { ContactFormData } from '@/components/ContactDetailsForm';
import type { PassengerData } from '@/components/PassengerDetails';
import { Check, X } from 'lucide-react';
import { createBookingConfirmation } from '@/actions/booking';

interface BookingConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactDetails: ContactFormData;
  passengerDetails: PassengerData[];
  bookingId?: string;
  hotelId?: string;
  flightId?: string;
  roomId?: string;
  totalPrice?: number;
}

export default function BookingConfirmationDialog({
  open,
  onOpenChange,
  contactDetails,
  passengerDetails,
  bookingId,
  hotelId,
  flightId,
  roomId,
  totalPrice
}: BookingConfirmationDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    try {
      // Call the server action to confirm booking
      const result = await createBookingConfirmation({
        contactDetails,
        passengerDetails,
        bookingId,
        hotelId,
        flightId,
        roomId
      });

      if (result.success) {
        // Redirect to confirmation page with all relevant IDs
        router.push(`/booking-confirmation?bookingId=${result.bookingId}${hotelId ? `&hotelId=${hotelId}` : ''}${flightId ? `&flightId=${flightId}` : ''}${roomId ? `&roomId=${roomId}` : ''}`);
      } else {
        // Handle error
        console.error("Booking confirmation failed:", result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Confirm Your Booking</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-emerald-50 p-4 rounded-md border border-emerald-200">
            <div className="flex items-center space-x-2 mb-2 text-emerald-700">
              <Check className="h-5 w-5" />
              <h3 className="text-sm font-semibold">Booking Summary</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Contact:</span> {contactDetails.firstName} {contactDetails.surname}</p>
              <p><span className="font-medium">Email:</span> {contactDetails.email}</p>
              <p><span className="font-medium">Phone:</span> +{contactDetails.countryCode} {contactDetails.mobileNumber}</p>
              {passengerDetails.length > 0 && (
                <p><span className="font-medium">Passengers:</span> {passengerDetails.length}</p>
              )}
              {totalPrice && (
                <p className="text-base font-bold pt-2">Total: £{totalPrice}</p>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="flex items-center space-x-2 mb-2">
              <X className="h-5 w-5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700">Important Information</h3>
            </div>
            
            <ul className="space-y-1 text-xs text-gray-600 list-disc pl-5">
              <li>By confirming your booking, you agree to our Terms & Conditions and Privacy Policy</li>
              <li>Your payment will be processed securely</li>
              <li>You'll receive a confirmation email with your booking details</li>
              <li>Cancellation policies apply as detailed in our terms</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="sm:w-auto w-full">
              Cancel
            </Button>
          </DialogClose>
          
          <Button 
            onClick={handleConfirmBooking} 
            disabled={isSubmitting}
            className="bg-rose-500 hover:bg-rose-600 sm:w-auto w-full flex items-center gap-2"
          >
            {isSubmitting ? "Processing..." : "Confirm & Pay"}
            {!isSubmitting && <Check className="h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 