"use client";

import Link from "next/link";
import DestinationCard from "./DestinationCard";
import { Button } from "@/components/ui/button";

const destinations = [
  {
    id: 1,
    name: "Istanbul",
    country: "Turkey",
    imageUrl: "/assets/mountains.jpg"
  },
  {
    id: 2,
    name: "Sydney",
    country: "Australia",
    imageUrl: "/assets/mountains.jpg"
  },
  {
    id: 3,
    name: "Baku",
    country: "Azerbaijan",
    imageUrl: "/assets/mountains.jpg"
  },
  {
    id: 4,
    name: "Malé",
    country: "Maldives",
    imageUrl: "/assets/mountains.jpg"
  },
  {
    id: 5,
    name: "Paris",
    country: "France",
    imageUrl: "/assets/mountains.jpg"
  },
  {
    id: 6,
    name: "New York",
    country: "US",
    imageUrl: "/assets/mountains.jpg"
  },
  {
    id: 7,
    name: "London",
    country: "UK",
    imageUrl: "/assets/mountains.jpg"
  },
  {
    id: 8,
    name: "Tokyo",
    country: "Japan",
    imageUrl: "/assets/mountains.jpg"
  },
  {
    id: 9,
    name: "Dubai",
    country: "UAE",
    imageUrl: "/assets/mountains.jpg"
  }
];

const PopularDestinations = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Plan your perfect trip</h2>
            <p className="text-gray-600">Search Flights & Hotels to our most popular destinations</p>
          </div>
          
          <Button 
            variant="outline" 
            className="hidden md:flex text-gray-800 border-gray-300"
            asChild
          >
            <Link 
              href="/destinations"
              aria-label="See more destinations"
            >
              See more places
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {destinations.slice(0, 9).map((destination) => (
            <DestinationCard
              key={destination.id}
              name={destination.name}
              country={destination.country}
              imageUrl={destination.imageUrl}
            />
          ))}
        </div>
        
        <div className="mt-10 text-center md:hidden">
          <Button 
            variant="outline" 
            className="text-gray-800 border-gray-300"
            asChild
          >
            <Link 
              href="/destinations"
              aria-label="See more destinations"
            >
              See more places
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations; 