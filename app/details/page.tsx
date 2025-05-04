"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";   
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { getAllFlights } from "@/actions/flight";
import { formatDistanceStrict } from "date-fns";
import { Badge } from "@/components/ui/badge";

type FlightType = {
  id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stopType: JSX.Element;
  route: string;
  rating: {
    score: number | null;
    reviews: number;
  };
  price: number;
};

type FilterState = {
  price: number[];
  departureTime: number[]; 
  airlines: string[];
  rating: number | null;
};

const formatCurrency = (price: number) => {
  return new Intl.NumberFormat('fr-DZ', { 
    style: 'currency', 
    currency: 'DZD' 
  }).format(price);
};

// Helper function to calculate the difference in minutes between two dates
const calculateMinutesDifference = (end: Date, start: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / 60000); // Convert milliseconds to minutes
};

// Helper function to format duration in hours and minutes
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export default function FlightListingPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flights, setFlights] = useState<FlightType[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    price: [400, 2000],
    departureTime: [0, 24], // in hours
    airlines: ["Emirates"],
    rating: null,
  });
  const [collapsedSections, setCollapsedSections] = useState({
    price: false,
    departureTime: false,
    rating: false,
    airlines: false,
  });
  const [favorites, setFavorites] = useState<string[]>([]);

  // Get search params
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");
  
  // Fetch flights
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If search params are missing, set error
        if (!from || !to) {
          setError("Please specify departure and arrival locations");
          setLoading(false);
          return;
        }
        
        // Call the getAllFlights function
        const response = await getAllFlights();
        
        if (response.status === 200 && response.data) {
          // Filter flights based on search params
          const filteredFlights = response.data.filter(flight => {
            const matchesFrom = flight.departureCity.toLowerCase().includes(from.toLowerCase());
            const matchesTo = flight.arrivalCity.toLowerCase().includes(to.toLowerCase());
            
            // If date is provided, filter by date too
            if (date) {
              const flightDate = new Date(flight.departureTime);
              const searchDate = new Date(date);
              const isSameDay = flightDate.getDate() === searchDate.getDate() && 
                                flightDate.getMonth() === searchDate.getMonth() && 
                                flightDate.getFullYear() === searchDate.getFullYear();
              return matchesFrom && matchesTo && isSameDay;
            }
            
            return matchesFrom && matchesTo;
          });
          
          // Format flights for UI
          const formattedFlights: FlightType[] = filteredFlights.map(flight => {
            const departureTime = new Date(flight.departureTime);
            const arrivalTime = new Date(flight.arrivalTime);
            
            // Calculate duration from departure and arrival times
            const durationInMinutes = calculateMinutesDifference(arrivalTime, departureTime);
            const formattedDuration = formatDuration(durationInMinutes);
            
            const stops = flight.stops || 0;
            const stopBadge = stops === 0 
              ? <Badge variant="success">Direct</Badge> 
              : <Badge variant="secondary">{stops} stop{stops > 1 ? 's' : ''}</Badge>;
            
            return {
              id: flight.id,
              airline: flight.airline,
              departureTime: departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
              arrivalTime: arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
              duration: formattedDuration,
              stopType: stopBadge,
              route: `${flight.departureCity.substring(0, 3).toUpperCase()}-${flight.arrivalCity.substring(0, 3).toUpperCase()}`,
              rating: {
                score: null,
                reviews: 0,
              },
              price: flight.price,
            };
          });
          
          setFlights(formattedFlights);
        } else {
          // Remove the default flights and just set an empty array
          setFlights([]);
          
          // Optionally set an error if you want:
          setError("No flights found matching your search criteria.");
        }
      } catch (err) {
        console.error("Error fetching flights:", err);
        setError("Failed to load flights. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFlights();
  }, [from, to, date]);

  const handleFilterToggle = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const handleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id) 
        : [...prev, id]
    );
  };

  const handleAirlineChange = (airline: string) => {
    setSelectedFilters(prev => {
      const currentAirlines = [...prev.airlines];
      if (currentAirlines.includes(airline)) {
        return {
          ...prev,
          airlines: currentAirlines.filter(a => a !== airline)
        };
      } else {
        return {
          ...prev,
          airlines: [...currentAirlines, airline]
        };
      }
    });
  };

  const handleRatingChange = (rating: number) => {
    setSelectedFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? null : rating
    }));
  };

  const resetFilter = () => {
    setSelectedFilters({
      price: [400, 2000],
      departureTime: [0, 24],
      airlines: ["Emirates"],
      rating: null,
    });
  };

  // Add search summary to the filters section
  const renderSearchSummary = () => (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h3 className="font-medium mb-2">Search</h3>
      <div className="text-sm space-y-1">
        <p>From: <span className="font-medium">{from || 'Any'}</span></p>
        <p>To: <span className="font-medium">{to || 'Any'}</span></p>
        {date && <p>Date: <span className="font-medium">{date}</span></p>}
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-16">
          {/* Filters Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button
                onClick={resetFilter}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                reset filter
              </button>
            </div>

            {/* Search Summary */}
            {renderSearchSummary()}

            {/* Price Filter */}
            <div className="border rounded-lg p-4 space-y-3">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => handleFilterToggle("price")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleFilterToggle("price")}
                aria-expanded={!collapsedSections.price}
                aria-controls="price-content"
              >
                <h3 className="font-medium">Price</h3>
                {collapsedSections.price ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
              <div 
                id="price-content" 
                className={`pt-2 transition-all duration-300 ease-in-out overflow-hidden ${collapsedSections.price ? 'max-h-0 opacity-0 pt-0' : 'max-h-20 opacity-100'}`}
              >
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>${selectedFilters.price[0]}</span>
                  <span>${selectedFilters.price[1]}</span>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute h-2 bg-teal-400 rounded-full"
                    style={{
                      left: `${(selectedFilters.price[0] / 2000) * 100}%`,
                      right: `${100 - (selectedFilters.price[1] / 2000) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Departure Time Filter */}
            <div className="border rounded-lg p-4 space-y-3">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => handleFilterToggle("departureTime")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleFilterToggle("departureTime")}
                aria-expanded={!collapsedSections.departureTime}
                aria-controls="departure-time-content"
              >
                <h3 className="font-medium">Departure Time</h3>
                {collapsedSections.departureTime ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
              <div 
                id="departure-time-content" 
                className={`pt-2 transition-all duration-300 ease-in-out overflow-hidden ${collapsedSections.departureTime ? 'max-h-0 opacity-0 pt-0' : 'max-h-20 opacity-100'}`}
              >
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute h-2 bg-teal-400 rounded-full"
                    style={{
                      left: "0%",
                      right: "0%",
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>12:00 am</span>
                  <span>11:59 pm</span>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="border rounded-lg p-4 space-y-3">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => handleFilterToggle("rating")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleFilterToggle("rating")}
                aria-expanded={!collapsedSections.rating}
                aria-controls="rating-content"
              >
                <h3 className="font-medium">Rating</h3>
                {collapsedSections.rating ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
              <div 
                id="rating-content" 
                className={`pt-2 transition-all duration-300 ease-in-out overflow-hidden ${collapsedSections.rating ? 'max-h-0 opacity-0 pt-0' : 'max-h-20 opacity-100'}`}
              >
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(star)}
                      className={`flex items-center justify-center w-8 h-8 rounded-md text-xs ${
                        selectedFilters.rating === star
                          ? "bg-teal-400 text-white"
                          : "bg-gray-100"
                      }`}
                      aria-label={`Filter by ${star} stars and above`}
                    >
                      +{star}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Airlines Filter */}
            <div className="border rounded-lg p-4 space-y-3">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => handleFilterToggle("airlines")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleFilterToggle("airlines")}
                aria-expanded={!collapsedSections.airlines}
                aria-controls="airlines-content"
              >
                <h3 className="font-medium">Airlines</h3>
                {collapsedSections.airlines ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
              <div 
                id="airlines-content" 
                className={`pt-2 transition-all duration-300 ease-in-out overflow-hidden ${collapsedSections.airlines ? 'max-h-0 opacity-0 pt-0' : 'max-h-36 opacity-100'}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="emirates"
                      className="w-4 h-4 rounded text-teal-500 accent-teal-500"
                      checked={selectedFilters.airlines.includes("Emirates")}
                      onChange={() => handleAirlineChange("Emirates")}
                    />
                    <label htmlFor="emirates" className="text-sm">
                      Emirates
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="flyDubai"
                      className="w-4 h-4 rounded text-teal-500 accent-teal-500"
                      checked={selectedFilters.airlines.includes("Fly-Dubai")}
                      onChange={() => handleAirlineChange("Fly-Dubai")}
                    />
                    <label htmlFor="flyDubai" className="text-sm">
                      Fly-Dubai
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="etihad"
                      className="w-4 h-4 rounded text-teal-500 accent-teal-500"
                      checked={selectedFilters.airlines.includes("Etihad")}
                      onChange={() => handleAirlineChange("Etihad")}
                    />
                    <label htmlFor="etihad" className="text-sm">
                      Etihad
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full bg-teal-500 hover:bg-teal-600">Apply</Button>
          </div>

          {/* Flight Results Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {flights.length > 0 && (
                <>
                  <div className="flex items-center gap-2 bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-sm">
                    <span>Cheapest</span>
                    <span className="font-semibold">${Math.min(...flights.map(f => f.price))}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    <span>Best</span>
                    <span className="font-semibold">${Math.min(...flights.map(f => f.price))} · {flights[0].duration}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    <span>Quickest</span>
                    <span className="font-semibold">{flights[0].duration}</span>
                  </div>
                </>
              )}
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
              {error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <>Showing {flights.length} of {flights.length} result(s)</>
              )}
            </div>

            {/* Flight Cards */}
            {loading ? (
              // Loading skeletons
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={`skeleton-${index}`} className="overflow-hidden">
                    <CardHeader className="p-6">
                      <div className="flex justify-between">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-6 w-40" />
                      </div>
                      <Skeleton className="h-4 w-full mt-4" />
                    </CardContent>
                    <CardFooter className="p-6">
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))
            ) : flights.length === 0 && !error ? (
              <div className="text-center p-10 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">No flights found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your search parameters.</p>
              </div>
            ) : (
              // Flight cards
              flights.map((flight) => (
                <Card key={flight.id} className="overflow-hidden mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Flight Details */}
                    <div className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{flight.departureTime}</div>
                          <div className="text-sm text-gray-500">{flight.airline}</div>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="text-xs text-gray-500 mb-1">{flight.stopType}</div>
                          <div className="h-[1px] bg-gray-300 relative">
                            <div className="absolute -top-1 right-0 w-2 h-2 rotate-45 border-t border-r border-gray-300"></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{flight.duration}</div>
                          <div className="text-xs text-gray-500 mt-1">{flight.route}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{flight.arrivalTime}</div>
                          <div className="text-sm text-gray-500">{flight.airline}</div>
                        </div>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="p-6 flex flex-col justify-between items-end">
                      <div>
                        <button
                          aria-label="Add to favorites"
                          tabIndex={0}
                          onClick={() => handleFavorite(flight.id)}
                          onKeyDown={(e) => e.key === "Enter" && handleFavorite(flight.id)}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <Heart 
                            className={`w-5 h-5 ${favorites.includes(flight.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
                          />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">starting from</div>
                        <div className="text-2xl font-semibold text-orange-500">
                          {formatCurrency(flight.price)}
                        </div>
                        <Button className="mt-2 w-full bg-teal-500 hover:bg-teal-600">
                          Select 
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
