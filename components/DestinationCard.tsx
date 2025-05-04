"use client";

import Image from "next/image";
import Link from "next/link";

interface DestinationCardProps {
  name: string;
  country: string;
  imageUrl: string;
}

const DestinationCard = ({ name, country, imageUrl }: DestinationCardProps) => {
  return (
    <div className="group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-w-16 aspect-h-9 relative h-48">
        <Link 
          href={`/destinations/${name.toLowerCase().replace(/\s+/g, '-')}`}
          aria-label={`View destinations in ${name}, ${country}`}
          className="block w-full h-full"
        >
          <Image
            src={imageUrl}
            alt={`${name}, ${country}`}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            fill
          />
        </Link>
      </div>
      
      <div className="p-4 bg-white">
        <Link 
          href={`/destinations/${name.toLowerCase().replace(/\s+/g, '-')}`}
          className="block"
          aria-label={`View destinations in ${name}, ${country}`}
        >
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
        </Link>
        
        <div className="flex items-center mt-1">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>{country}</span>
          </div>
          
          <div className="ml-auto flex gap-1">
            <Link
              href={`/flights/${name.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs text-gray-600 hover:text-gray-900"
              aria-label={`View flights to ${name}`}
            >
              Flights
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href={`/hotels/${name.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs text-gray-600 hover:text-gray-900"
              aria-label={`View hotels in ${name}`}
            >
              Hotels
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href={`/resorts/${name.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs text-gray-600 hover:text-gray-900"
              aria-label={`View resorts in ${name}`}
            >
              Resorts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard; 