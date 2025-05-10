import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Hotel Header Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Image Gallery Skeleton */}
      <div className="grid grid-cols-12 gap-2 mb-8 h-[450px]">
        <Skeleton className="col-span-6 h-full rounded-l-lg" />
        <div className="col-span-6 grid grid-cols-2 grid-rows-2 gap-2 h-full">
          <Skeleton className="h-full w-full" />
          <Skeleton className="h-full w-full rounded-tr-lg" />
          <Skeleton className="h-full w-full" />
          <Skeleton className="h-full w-full rounded-br-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Overview Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Room Amenities Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Available Rooms Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Hotel Amenities Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
              {Array(9).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card Skeleton */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <Skeleton className="h-[450px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
} 