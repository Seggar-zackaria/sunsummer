'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchHotelForm() {
  const [checkInDate, setCheckInDate] = React.useState<Date | undefined>(new Date());
  const [checkOutDate, setCheckOutDate] = React.useState<Date | undefined>(new Date());
  const [destination, setDestination] = React.useState('Durham, USA');
  const [guests, setGuests] = React.useState('1 Rooms, 1 Guests');
  const [showPromoCode, setShowPromoCode] = React.useState(false);

  // Format date as MM/DD
  const formatDateMMDD = (date: Date | undefined) => {
    if (!date) return '';
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Destination */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            Enter Destination <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-8"
            />
            <span className="absolute left-2 top-2.5 text-gray-500">
              🏙️
            </span>
          </div>
        </div>

        {/* Check In */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            Check In <span className="text-red-500">*</span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkInDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkInDate ? formatDateMMDD(checkInDate) : <span>MM/DD</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={setCheckInDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check Out */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            Check Out <span className="text-red-500">*</span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkOutDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOutDate ? formatDateMMDD(checkOutDate) : <span>MM/DD</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkOutDate}
                onSelect={setCheckOutDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Rooms & Guests */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            Rooms - Guests <span className="text-red-500">*</span>
          </label>
          <Input
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
        <button 
          onClick={() => setShowPromoCode(!showPromoCode)}
          className="flex items-center text-sm text-gray-600"
        >
          <PlusCircle className="w-4 h-4 mr-1" />
          Add Promo Code
        </button>

        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <span className="mr-2">🔍</span>
          Show Places
        </Button>
      </div>

      {showPromoCode && (
        <div className="mt-4">
          <Input placeholder="Enter promo code" className="max-w-xs" />
        </div>
      )}
    </div>
  );
} 