"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, Heart, ArrowDownAZ, ArrowUpDown, Clock, Plane } from "lucide-react";
import Navbar from "@/components/Navbar";   
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { getAllFlights } from "@/actions/flight";
import { formatDistanceStrict } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

type FlightType = {
  id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stopType: JSX.Element;
  route: string;
  departureCity: string;
  arrivalCity: string;
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

const calculateMinutesDifference = (end: Date, start: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / 60000); 
};

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
  const [filteredFlights, setFilteredFlights] = useState<FlightType[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    price: [400, 100000],
    departureTime: [0, 24], // in hours
    airlines: [],
    rating: null,
  });
  const [collapsedSections, setCollapsedSections] = useState({
    price: false,
    departureTime: false,
    rating: false,
    airlines: false,
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departureTime'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isApplying, setIsApplying] = useState(false);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");
  
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!from || !to) {
          setError("Please specify departure and arrival locations");
          setLoading(false);
          return;
        }
        
        const response = await getAllFlights();
        
        if (response.status === 200 && response.data) {
          const filteredFlights = response.data.filter(flight => {
            const matchesFrom = flight.departureCity.toLowerCase().includes(from.toLowerCase());
            const matchesTo = flight.arrivalCity.toLowerCase().includes(to.toLowerCase());
            
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
          
          const formattedFlights: FlightType[] = filteredFlights.map(flight => {
            const departureTime = new Date(flight.departureTime);
            const arrivalTime = new Date(flight.arrivalTime);
            
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
              departureCity: flight.departureCity,
              arrivalCity: flight.arrivalCity,
              rating: {
                score: null,
                reviews: 0,
              },
              price: flight.price,
            };
          });
          
          setFlights(formattedFlights);
          setFilteredFlights(formattedFlights); 
        } else {
          setFlights([]);
          setFilteredFlights([]);
          
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
      price: [400, 100000],
      departureTime: [0, 24],
      airlines: [],
      rating: null,
    });
    setFilteredFlights(flights);
  };

  const sortFlights = (flights: FlightType[]) => {
    const sortedFlights = [...flights];
    
    switch (sortBy) {
      case 'price':
        sortedFlights.sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
        break;
      case 'duration':
        sortedFlights.sort((a, b) => {
          const getDurationMinutes = (duration: string) => {
            const [hours, minutes] = duration.replace(/[^0-9h m]/g, '').split('h ');
            return parseInt(hours) * 60 + parseInt(minutes);
          };
          const aDuration = getDurationMinutes(a.duration);
          const bDuration = getDurationMinutes(b.duration);
          return sortOrder === 'asc' ? aDuration - bDuration : bDuration - aDuration;
        });
        break;
      case 'departureTime':
        sortedFlights.sort((a, b) => {
          const getTimeValue = (timeStr: string) => {
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(num => parseInt(num));
            if (period.toLowerCase() === 'pm' && hours < 12) hours += 12;
            if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
            return hours * 60 + minutes;
          };
          const aTime = getTimeValue(a.departureTime);
          const bTime = getTimeValue(b.departureTime);
          return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
        });
        break;
    }
    
    return sortedFlights;
  };

  const activeFiltersCount = useMemo(() => {
    return [
      (selectedFilters.price[0] > 400 || selectedFilters.price[1] < 100000) ? 1 : 0,
      (selectedFilters.departureTime[0] > 0 || selectedFilters.departureTime[1] < 24) ? 1 : 0,
      selectedFilters.airlines.length > 0 ? 1 : 0,
      selectedFilters.rating !== null ? 1 : 0
    ].reduce((a, b) => a + b, 0);
  }, [selectedFilters]);

  const clearPriceFilter = () => {
    setSelectedFilters(prev => ({
      ...prev,
      price: [400, 100000]
    }));
    setTimeout(applyFilters, 0);
  };

  const clearTimeFilter = () => {
    setSelectedFilters(prev => ({
      ...prev,
      departureTime: [0, 24]
    }));
    setTimeout(applyFilters, 0);
  };

  const clearAirlineFilter = () => {
    setSelectedFilters(prev => ({
      ...prev,
      airlines: []
    }));
    setTimeout(applyFilters, 0);
  };

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

  const applyFilters = () => {
    setIsApplying(true);
    
    let results = [...flights];
    
    try {
      let filtersApplied = false;
      
      const defaultFilters = {
        minPrice: 400,
        maxPrice: 100000,
        minTime: 0,
        maxTime: 24
      };
      
      const isPriceFiltered = 
        selectedFilters.price[0] > defaultFilters.minPrice || 
        selectedFilters.price[1] < defaultFilters.maxPrice;
      
      if (isPriceFiltered) {
        results = results.filter(flight => 
          flight.price >= selectedFilters.price[0] && 
          flight.price <= selectedFilters.price[1]
        );
        filtersApplied = true;
      }
      
      const isTimeFiltered = 
        selectedFilters.departureTime[0] > defaultFilters.minTime || 
        selectedFilters.departureTime[1] < defaultFilters.maxTime;
      
      if (isTimeFiltered) {
        results = results.filter(flight => {
          try {
            const [time, period] = flight.departureTime.split(' ');
            const [hourStr, minuteStr] = time.split(':');
            let hour = parseInt(hourStr);
            
            if (period.toLowerCase() === 'pm' && hour < 12) {
              hour += 12;
            } else if (period.toLowerCase() === 'am' && hour === 12) {
              hour = 0;
            }
            
            return hour >= selectedFilters.departureTime[0] && hour <= selectedFilters.departureTime[1];
          } catch (e) {
            console.error("Error parsing flight time:", e);
            return true;
          }
        });
        filtersApplied = true;
      }
      
      const isAirlineFiltered = selectedFilters.airlines.length > 0;
      
      if (isAirlineFiltered) {
        results = results.filter(flight => 
          selectedFilters.airlines.includes(flight.airline)
        );
        filtersApplied = true;
      }
      
      if (selectedFilters.rating !== null) {
        results = results.filter(flight => 
          flight.rating.score !== null && flight.rating.score >= selectedFilters.rating!
        );
        filtersApplied = true;
      }
      
      if (!filtersApplied) {
        results = [...flights];
      }
      
      if (results.length > 0) {
        results = sortFlights(results);
      }
    } catch (err) {
      console.error("Error applying filters:", err);
      setError("An error occurred while filtering flights. Please try again.");
      results = [...flights]; 
    }
    
    setFilteredFlights(results);
    setIsApplying(false);
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-16">
          {/* Filters Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Filters</h2>
              <div className="flex items-center gap-2">
                {(selectedFilters.price[0] > 400 || 
                  selectedFilters.price[1] < 100000 || 
                  selectedFilters.departureTime[0] > 0 || 
                  selectedFilters.departureTime[1] < 24 || 
                  selectedFilters.airlines.length > 0 || 
                  selectedFilters.rating !== null) && (
                  <span className="px-2 py-0.5 text-xs bg-teal-100 text-teal-700 rounded-full">
                    {activeFiltersCount} active
                  </span>
                )}
                <button
                  onClick={resetFilter}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  reset filter
                </button>
              </div>
            </div>

            {/* Search Summary */}
            {renderSearchSummary()}

            {/* Price Filter */}
            <div className={`border rounded-lg p-4 space-y-3 ${
              selectedFilters.price[0] > 400 || selectedFilters.price[1] < 100000 
                ? 'border-teal-500 bg-teal-50/30' 
                : ''
            }`}>
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
                <div className="flex items-center gap-2">
                  {(selectedFilters.price[0] > 400 || selectedFilters.price[1] < 100000) && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        clearPriceFilter();
                      }}
                      className="text-xs text-gray-500 hover:text-teal-600"
                    >
                      Clear
                    </button>
                  )}
                  {collapsedSections.price ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
              </div>
              <div 
                id="price-content" 
                className={`pt-2 transition-all duration-300 ease-in-out overflow-hidden ${collapsedSections.price ? 'max-h-0 opacity-0 pt-0' : 'max-h-72 opacity-100'}`}
              >
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{formatCurrency(selectedFilters.price[0])}</span>
                  <span>{formatCurrency(selectedFilters.price[1])}</span>
                </div>
                <Slider
                  defaultValue={selectedFilters.price}
                  min={400}
                  max={100000}
                  step={100}
                  minStepsBetweenThumbs={1}
                  value={selectedFilters.price}
                  onValueChange={(value) => 
                    setSelectedFilters(prev => ({
                      ...prev,
                      price: value
                    }))
                  }
                  className="mb-4"
                />
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <label htmlFor="min-price" className="text-xs text-gray-600 font-medium">Min Price</label>
                    <div className="flex items-center relative">
                      <span className="absolute left-3 text-gray-500">DZD</span>
                      <input
                        id="min-price"
                        type="number"
                        min={400}
                        max={selectedFilters.price[1] - 100}
                        value={selectedFilters.price[0]}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value >= 400 && value < selectedFilters.price[1]) {
                            setSelectedFilters(prev => ({
                              ...prev,
                              price: [value, prev.price[1]]
                            }));
                          }
                        }}
                        className="w-full rounded border border-gray-300 py-1.5 pl-12 pr-3 focus:border-teal-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="max-price" className="text-xs text-gray-600 font-medium">Max Price</label>
                    <div className="flex items-center relative">
                      <span className="absolute left-3 text-gray-500">DZD</span>
                      <input
                        id="max-price"
                        type="number"
                        min={selectedFilters.price[0] + 100}
                        max={100000}
                        value={selectedFilters.price[1]}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value <= 100000 && value > selectedFilters.price[0]) {
                            setSelectedFilters(prev => ({
                              ...prev,
                              price: [prev.price[0], value]
                            }));
                          }
                        }}
                        className="w-full rounded border border-gray-300 py-1.5 pl-12 pr-3 focus:border-teal-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Departure Time Filter */}
            <div className={`border rounded-lg p-4 space-y-3 ${
              selectedFilters.departureTime[0] > 0 || selectedFilters.departureTime[1] < 24 
                ? 'border-teal-500 bg-teal-50/30' 
                : ''
            }`}>
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
                <div className="flex items-center gap-2">
                  {(selectedFilters.departureTime[0] > 0 || selectedFilters.departureTime[1] < 24) && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        clearTimeFilter();
                      }}
                      className="text-xs text-gray-500 hover:text-teal-600"
                    >
                      Clear
                    </button>
                  )}
                  {collapsedSections.departureTime ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
              </div>
              <div 
                id="departure-time-content" 
                className={`pt-2 transition-all duration-300 ease-in-out overflow-hidden ${collapsedSections.departureTime ? 'max-h-0 opacity-0 pt-0' : 'max-h-72 opacity-100'}`}
              >
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{selectedFilters.departureTime[0]}:00</span>
                  <span>{selectedFilters.departureTime[1]}:00</span>
                </div>
                <Slider
                  defaultValue={selectedFilters.departureTime}
                  min={0}
                  max={24}
                  step={1}
                  minStepsBetweenThumbs={1}
                  value={selectedFilters.departureTime}
                  onValueChange={(value) => 
                    setSelectedFilters(prev => ({
                      ...prev,
                      departureTime: value
                    }))
                  }
                  className="mb-4"
                />
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <label htmlFor="min-time" className="text-xs text-gray-600 font-medium">From</label>
                    <div className="flex items-center relative">
                      <input
                        id="min-time"
                        type="number"
                        min={0}
                        max={selectedFilters.departureTime[1] - 1}
                        value={selectedFilters.departureTime[0]}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value >= 0 && value < selectedFilters.departureTime[1] && value <= 24) {
                            setSelectedFilters(prev => ({
                              ...prev,
                              departureTime: [value, prev.departureTime[1]]
                            }));
                          }
                        }}
                        className="w-full rounded border border-gray-300 py-1.5 pl-3 pr-10 focus:border-teal-500 focus:outline-none text-sm"
                      />
                      <span className="absolute right-3 text-gray-500 text-xs">hrs</span>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {selectedFilters.departureTime[0] === 0 ? "12 AM" : 
                        selectedFilters.departureTime[0] < 12 ? `${selectedFilters.departureTime[0]} AM` : 
                        selectedFilters.departureTime[0] === 12 ? "12 PM" : 
                        `${selectedFilters.departureTime[0] - 12} PM`}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="max-time" className="text-xs text-gray-600 font-medium">To</label>
                    <div className="flex items-center relative">
                      <input
                        id="max-time"
                        type="number"
                        min={selectedFilters.departureTime[0] + 1}
                        max={24}
                        value={selectedFilters.departureTime[1]}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value <= 24 && value > selectedFilters.departureTime[0]) {
                            setSelectedFilters(prev => ({
                              ...prev,
                              departureTime: [prev.departureTime[0], value]
                            }));
                          }
                        }}
                        className="w-full rounded border border-gray-300 py-1.5 pl-3 pr-10 focus:border-teal-500 focus:outline-none text-sm"
                      />
                      <span className="absolute right-3 text-gray-500 text-xs">hrs</span>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {selectedFilters.departureTime[1] === 0 ? "12 AM" : 
                        selectedFilters.departureTime[1] < 12 ? `${selectedFilters.departureTime[1]} AM` : 
                        selectedFilters.departureTime[1] === 12 ? "12 PM" : 
                        `${selectedFilters.departureTime[1] - 12} PM`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Airlines Filter */}
            <div className={`border rounded-lg p-4 space-y-3 ${
              selectedFilters.airlines.length > 0 
                ? 'border-teal-500 bg-teal-50/30' 
                : ''
            }`}>
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
                <div className="flex items-center gap-2">
                  {selectedFilters.airlines.length > 0 && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        clearAirlineFilter();
                      }}
                      className="text-xs text-gray-500 hover:text-teal-600"
                    >
                      Clear
                    </button>
                  )}
                  {collapsedSections.airlines ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
              </div>
              <div 
                id="airlines-content" 
                className={`pt-2 transition-all duration-300 ease-in-out overflow-hidden ${collapsedSections.airlines ? 'max-h-0 opacity-0 pt-0' : 'max-h-72 opacity-100'}`}
              >
                <div className="space-y-2">
                  {/* Dynamically render airline checkboxes based on available flights */}
                  {Array.from(new Set(flights.map(flight => flight.airline))).map(airline => (
                    <div key={airline} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={airline.toLowerCase().replace(/\s+/g, '-')}
                        className="w-4 h-4 rounded text-teal-500 accent-teal-500"
                        checked={selectedFilters.airlines.includes(airline)}
                        onChange={() => handleAirlineChange(airline)}
                      />
                      <label htmlFor={airline.toLowerCase().replace(/\s+/g, '-')} className="text-sm">
                        {airline}
                      </label>
                    </div>
                  ))}
                  
                  {/* Show a message if no airlines are available */}
                  {flights.length === 0 && (
                    <div className="text-sm text-gray-500">No airlines available</div>
                  )}
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-teal-500 hover:bg-teal-600"
              onClick={applyFilters}
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Applying...
                </>
              ) : 'Apply'}
            </Button>
          </div>

          {/* Flight Results Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sorting and Results Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-gray-600">
                {error ? (
                  <div className="text-red-500">{error}</div>
                ) : (
                  <>Showing <span className="font-medium">{filteredFlights.length}</span> of <span className="font-medium">{flights.length}</span> flights</>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <div className="flex items-center rounded-md border border-gray-200 bg-white">
                  <button 
                    className={`px-3 py-1.5 text-sm transition-colors ${sortBy === 'price' ? 'bg-teal-50 text-teal-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    onClick={() => {
                      if (sortBy === 'price') {
                        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('price');
                        setSortOrder('asc');
                      }
                      setTimeout(applyFilters, 0);
                    }}
                  >
                    Price {sortBy === 'price' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button 
                    className={`px-3 py-1.5 text-sm transition-colors ${sortBy === 'duration' ? 'bg-teal-50 text-teal-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    onClick={() => {
                      if (sortBy === 'duration') {
                        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('duration');
                        setSortOrder('asc');
                      }
                      setTimeout(applyFilters, 0);
                    }}
                  >
                    Duration {sortBy === 'duration' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button 
                    className={`px-3 py-1.5 text-sm transition-colors ${sortBy === 'departureTime' ? 'bg-teal-50 text-teal-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    onClick={() => {
                      if (sortBy === 'departureTime') {
                        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('departureTime');
                        setSortOrder('asc');
                      }
                      setTimeout(applyFilters, 0);
                    }}
                  >
                    Time {sortBy === 'departureTime' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            {filteredFlights.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div 
                  onClick={() => {
                    setSortBy('price');
                    setSortOrder('asc');
                    setTimeout(applyFilters, 0);
                  }}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer border transition-colors ${
                    sortBy === 'price' && sortOrder === 'asc' 
                      ? 'bg-teal-50 text-teal-600 border-teal-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>Cheapest</span>
                  <span className="font-semibold">{formatCurrency(Math.min(...filteredFlights.map(f => f.price)))}</span>
                </div>
                
                <div 
                  onClick={() => {
                    setSortBy('duration');
                    setSortOrder('asc');
                    setTimeout(applyFilters, 0);
                  }}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer border transition-colors ${
                    sortBy === 'duration' && sortOrder === 'asc' 
                      ? 'bg-teal-50 text-teal-600 border-teal-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>Quickest</span>
                  <span className="font-semibold">{
                    filteredFlights.sort((a, b) => {
                      const getDurationMinutes = (duration: string) => {
                        const [hours, minutes] = duration.replace(/[^0-9h m]/g, '').split('h ');
                        return parseInt(hours) * 60 + parseInt(minutes);
                      };
                      return getDurationMinutes(a.duration) - getDurationMinutes(b.duration);
                    })[0].duration
                  }</span>
                </div>
                
                <div 
                  onClick={() => {
                    setSortBy('departureTime');
                    setSortOrder('asc');
                    setTimeout(applyFilters, 0);
                  }}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer border transition-colors ${
                    sortBy === 'departureTime' && sortOrder === 'asc' 
                      ? 'bg-teal-50 text-teal-600 border-teal-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>Earliest</span>
                  <span className="font-semibold">{
                    filteredFlights.sort((a, b) => {
                      const getTimeValue = (timeStr: string) => {
                        const [time, period] = timeStr.split(' ');
                        let [hours, minutes] = time.split(':').map(num => parseInt(num));
                        if (period.toLowerCase() === 'pm' && hours < 12) hours += 12;
                        if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
                        return hours * 60 + minutes;
                      };
                      return getTimeValue(a.departureTime) - getTimeValue(b.departureTime);
                    })[0].departureTime
                  }</span>
                </div>
              </div>
            )}

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
            ) : filteredFlights.length === 0 && !error ? (
              <div className="text-center p-10 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">No flights found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your search parameters.</p>
              </div>
            ) : (
              // Flight cards
              filteredFlights.map((flight) => (
                <Card key={flight.id} className="overflow-hidden mb-4 hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Flight Details */}
                    <div className="p-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 rounded px-2 py-1 mr-2">
                              {flight.airline}
                            </div>
                            {flight.stopType}
                          </div>
                          <div className="text-xs text-gray-500 md:hidden">
                            {formatCurrency(flight.price)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold">{flight.departureTime}</div>
                            <div className="text-xs font-medium text-gray-500 uppercase">{flight.departureCity.substring(0, 3)}</div>
                          </div>
                          <div className="flex-1 text-center">
                            <div className="relative h-[1px] bg-gray-300">
                              <div className="absolute -top-1 right-0 w-2 h-2 rotate-45 border-t border-r border-gray-300"></div>
                              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-full bg-gray-100 text-gray-500 text-xs px-2 whitespace-nowrap">
                              <span className="inline-flex items-center">
                              <Clock className="w-3 h-3 mr-1" /> {flight.duration}
                              </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold">{flight.arrivalTime}</div>
                            <div className="text-xs font-medium text-gray-500 uppercase">{flight.arrivalCity.substring(0, 3)}</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex justify-between text-xs">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-700">{flight.departureCity}</span>
                            <span className="text-gray-400">International Airport</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <Plane className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-gray-700">{flight.arrivalCity}</span>
                            <span className="text-gray-400">International Airport</span>
                          </div>
                        </div>
                        
                        
                        
                        {/* Mobile Select Button */}
                        <Button className="w-full mt-2 bg-teal-500 hover:bg-teal-600 transition-colors md:hidden">
                          Select - {formatCurrency(flight.price)}
                        </Button>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="p-6 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-between bg-gray-50">
                      <div className="flex justify-end">
                        <button
                          aria-label="Add to favorites"
                          tabIndex={0}
                          onClick={() => handleFavorite(flight.id)}
                          onKeyDown={(e) => e.key === "Enter" && handleFavorite(flight.id)}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <Heart 
                            className={`w-5 h-5 transition-colors ${favorites.includes(flight.id) ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-gray-500'}`} 
                          />
                        </button>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm text-gray-500">Total price</div>
                        <div className="text-2xl font-semibold text-orange-500 mb-1">
                          {formatCurrency(flight.price)}
                        </div>
                        <div className="text-xs text-gray-500 mb-4">Includes taxes and charges</div>
                        <Button className="w-full bg-teal-500 hover:bg-teal-600 transition-colors">
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
      </main>
        <Footer />
    </>
  );
}
