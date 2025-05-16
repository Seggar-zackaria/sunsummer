"use client";

import React, { useState, useEffect } from 'react';
// import { SearchHotelForm } from '@/components/SearchHotelForm';
import Image from 'next/image';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown, Star, StarHalf } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Country, State } from 'country-state-city';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { getHotels } from '@/actions/hotel';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

// Define types for the data models
type RoomType = {
  id: string;
  description: string;
  images: string[];
  amenities: string[];
  price: number;
  hotelId: string;
  type: string;
  capacity: number;
  available: boolean;
};

type Hotel = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  amenities: string[];
  images: string[];
  rating: number;
  price: number;
  roomTypes: RoomType[];
  createdAt: Date;
};

// Get country name from country code
function getCountryName(countryCode: string): string {
  const country = Country.getCountryByCode(countryCode);
  return country?.name || countryCode;
}

// Check if search query matches country
function matchesCountry(countryCode: string, searchQuery: string): boolean {
  // Check direct code match
  if (countryCode.toLowerCase() === searchQuery.toLowerCase()) {
    return true;
  }
  
  // Check country name match
  const country = Country.getCountryByCode(countryCode);
  if (country && country.name.toLowerCase().includes(searchQuery.toLowerCase())) {
    return true;
  }
  
  return false;
}

// Get state name from state code and country code
function getStateName(countryCode: string, stateCode: string | null): string {
  if (!stateCode) return '';
  const state = State.getStateByCodeAndCountry(stateCode, countryCode);
  return state?.name || stateCode;
}

// Format DZD currency with thousand separator
function formatDZD(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0';
  }
  return amount.toLocaleString('fr-DZ');
}

// Format currency with proper currency symbol
function formatCurrency(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) {
    return 'DZD 0';
  }
  
  return new Intl.NumberFormat('fr-DZ', { 
    style: 'currency', 
    currency: 'DZD',
    maximumFractionDigits: 0
  }).format(price);
}

// Star Rating component
function StarRating({ rating }: { rating: number | undefined }) {
  if (rating === undefined || rating === null) {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((_, index) => (
          <Star key={index} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="ml-2 text-sm text-gray-500">Not rated</span>
      </div>
    );
  }

  // Convert rating (0-5) to number of stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  
  return (
    <div className="flex items-center">
      {/* Render full stars */}
      {Array.from({ length: fullStars }).map((_, index) => (
        <Star key={index} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      ))}
      
      {/* Render half star if needed */}
      {hasHalfStar && <StarHalf className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
      
      {/* Render empty stars */}
      {Array.from({ length: 5 - fullStars - (hasHalfStar ? 1 : 0) }).map((_, index) => (
        <Star key={`empty-${index}`} className="w-4 h-4 text-gray-300" />
      ))}
    </div>
  );
}

// Hotel Card Skeleton component for loading state
function HotelCardSkeleton() {
  return (
    <Card className="mb-6 overflow-hidden border-none shadow-md bg-white">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="w-full md:w-2/3 p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64 mb-4" />
              
              <div className="flex flex-wrap gap-2 mt-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
              
              <div className="flex items-center mt-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="w-4 h-4 mr-1 rounded-full" />
                  ))}
                  <Skeleton className="h-4 w-20 ml-2" />
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 text-right">
              <Skeleton className="h-4 w-28 ml-auto mb-2" />
              <Skeleton className="h-8 w-36 ml-auto mb-2" />
              <Skeleton className="h-3 w-40 ml-auto mb-2" />
              <Skeleton className="h-3 w-24 ml-auto mb-4" />
              
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Hotel listing component to be wrapped in Suspense
function HotelListing({ hotels, filteredHotels }: { hotels: Hotel[], filteredHotels: Hotel[] }) {
  const router = useRouter();

  const handleViewDeals = (hotelId: string) => {
    router.push(`/hotel-room/${hotelId}`);
  };

  if (filteredHotels.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No hotels found. Please try different filters.</p>
      </div>
    );
  }
  
  return (
    <>
      {filteredHotels.map((hotel) => (
        <Card key={hotel.id} className="mb-6 overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-r from-white to-gray-50">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 relative">
              <div className="relative h-64 w-full overflow-hidden">
                <Image 
                  src={hotel.images && hotel.images.length > 0 ? hotel.images[0] : "/assets/mountains.jpg"}
                  alt={hotel.name || "Hotel"} 
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500 ease-in-out"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/30 to-transparent opacity-60"></div>
              </div>
            </div>
            <div className="w-full md:w-2/3 p-6 bg-white">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h2 className="text-2xl font-bold capitalize text-gray-800">{hotel.name}</h2>
                  <p className="text-sm text-gray-600">
                    {hotel.city}, 
                    {hotel.state ? ` ${getStateName(hotel.country, hotel.state)},` : ''} 
                    {' '}{getCountryName(hotel.country)}.
                    <br/>
                    {hotel.address}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {hotel.amenities && hotel.amenities.length > 0 ? (
                      <>
                        {hotel.amenities.slice(0, 5).map((amenity, index) => (
                          <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100">{amenity}</span>
                        ))}
                        {hotel.amenities.length > 5 && (
                          <span className="text-xs text-blue-600 font-medium">+ {hotel.amenities.length - 5} more</span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">No amenities listed</span>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-3">
                    <StarRating rating={hotel.rating} />
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-lg line-through text-gray-500">
                    {formatCurrency(hotel.price * 1.25)}
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(hotel.price)} <span className='text-sm text-gray-500'>/ night</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">+ tax and services fee included</div>
                  <div className="text-xs text-green-600 font-semibold mt-1">
                    {hotel.roomTypes && hotel.roomTypes.filter(room => room.available).length} rooms available
                  </div>
                  
                  <button 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 rounded-md mt-4 transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={() => handleViewDeals(hotel.id)}
                  >
                    View Deals
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}

export default function BookingHotelPage() {
  const searchParams = useSearchParams();
  const locationParam = searchParams.get('location');
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [uniqueAmenities, setUniqueAmenities] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    price: [1000, 60000],
    starRating: null as number | null,
    amenities: [] as string[]
  });
  const [collapsedSections, setCollapsedSections] = useState({
    price: false,
    starRating: false,
    amenities: false
  });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const fetchedHotels = await getHotels(signal);
        
        if (fetchedHotels && fetchedHotels.length > 0) {
          setHotels(fetchedHotels);
          
          // If location parameter exists, filter hotels by location
          let filtered = fetchedHotels;
          if (locationParam) {
            const searchLocation = locationParam.toLowerCase();
            filtered = fetchedHotels.filter(hotel => 
              hotel.city.toLowerCase().includes(searchLocation) || 
              matchesCountry(hotel.country, searchLocation) ||
              (hotel.state && hotel.state.toLowerCase().includes(searchLocation)) ||
              hotel.name.toLowerCase().includes(searchLocation)
            );
          }
          
          setFilteredHotels(filtered);
          
          // Extract unique amenities from all hotels
          const allAmenities = fetchedHotels.flatMap(hotel => hotel.amenities || []);
          const uniqueAmenitiesSet = new Set(allAmenities);
          setUniqueAmenities(Array.from(uniqueAmenitiesSet).sort());
        } else {
          // Handle case when no hotels are returned
          setHotels([]);
          setFilteredHotels([]);
        }
      } catch (error) {
        // Only log error if not an abort error
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Error fetching hotels:", error);
          setHotels([]);
          setFilteredHotels([]);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    fetchHotels();
    
    // Cleanup function to abort fetch operation when component unmounts
    return () => {
      controller.abort();
    };
  }, [locationParam]);

  const handleFilterToggle = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const clearPriceFilter = () => {
    setSelectedFilters(prev => ({
      ...prev,
      price: [1000, 60000]
    }));
    applyFilters();
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setSelectedFilters(prev => {
      if (checked) {
        return {
          ...prev,
          amenities: [...prev.amenities, amenity]
        };
      } else {
        return {
          ...prev,
          amenities: prev.amenities.filter(item => item !== amenity)
        };
      }
    });
  };

  const clearAmenityFilters = () => {
    setSelectedFilters(prev => ({
      ...prev,
      amenities: []
    }));
    applyFilters();
  };

  const handleStarRatingChange = (rating: number) => {
    setSelectedFilters(prev => ({
      ...prev,
      starRating: prev.starRating === rating ? null : rating
    }));
  };

  const clearStarRatingFilter = () => {
    setSelectedFilters(prev => ({
      ...prev,
      starRating: null
    }));
    applyFilters();
  };

  const applyFilters = () => {
    let results = [...hotels];
    
    // If location parameter exists, first filter by location
    if (locationParam) {
      const searchLocation = locationParam.toLowerCase();
      results = results.filter(hotel => 
        hotel.city.toLowerCase().includes(searchLocation) || 
        matchesCountry(hotel.country, searchLocation) ||
        (hotel.state && hotel.state.toLowerCase().includes(searchLocation)) ||
        hotel.name.toLowerCase().includes(searchLocation)
      );
    }
    
    try {
      // Filter by price - no conversion needed as prices are already in DZD
      if (selectedFilters.price[0] > 1000 || selectedFilters.price[1] < 60000) {
        results = results.filter(hotel => {
          return hotel.price >= selectedFilters.price[0] && hotel.price <= selectedFilters.price[1];
        });
      }

      // Filter by star rating
      if (selectedFilters.starRating !== null) {
        const starRating = selectedFilters.starRating; // Store in a local variable to avoid null check errors
        results = results.filter(hotel => {
          // Match hotels with rating equal to or greater than the selected rating
          // For example, if user selects 3 stars, show hotels with 3+ stars
          return hotel.rating !== undefined && 
                 hotel.rating !== null && 
                 Math.floor(hotel.rating) >= starRating;
        });
      }

      // Filter by amenities
      if (selectedFilters.amenities.length > 0) {
        results = results.filter(hotel => {
          // Check if hotel has all selected amenities
          return selectedFilters.amenities.every(amenity => 
            hotel.amenities && hotel.amenities.includes(amenity)
          );
        });
      }
    } catch (err) {
      console.error("Error applying filters:", err);
    }
    
    setFilteredHotels(results);
  };

  return (
    <>
      <Navbar/>
      <main className="container mx-auto px-4 py-12">
      {/* <SearchHotelForm /> */}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        {/* Filters Section */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Filters</h2>
            <button 
              className="text-sm text-gray-500"
              onClick={() => {
                setSelectedFilters({
                  price: [1000, 60000],
                  starRating: null,
                  amenities: []
                });
                applyFilters();
              }}
            >
              reset
            </button>
          </div>
          
          {/* Price Filter */}
          <div className={`border-b pb-4 mb-4 border p-2 rounded-md`}>
            <div 
              className="flex justify-between items-center mb-4 cursor-pointer"
              onClick={() => handleFilterToggle("price")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleFilterToggle("price")}
              aria-expanded={!collapsedSections.price}
              aria-controls="price-content"
            >
              <h3 className="font-medium">Price</h3>
              <div className="flex items-center gap-2">
                {(selectedFilters.price[0] > 1000 || selectedFilters.price[1] < 60000) && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      clearPriceFilter();
                    }}
                    className="text-xs text-gray-500 hover:text-blue-600"
                  >
                    Clear
                  </button>
                )}
                {collapsedSections.price ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>
            <div 
              id="price-content" 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                collapsedSections.price ? 'max-h-0 opacity-0' : 'max-h-72 opacity-100'
              }`}
            >
              <div className="px-2">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{formatCurrency(selectedFilters.price[0])}</span>
                  <span>{formatCurrency(selectedFilters.price[1])}</span>
                </div>
                <Slider 
                  value={selectedFilters.price}
                  onValueChange={(value) => 
                    setSelectedFilters(prev => ({
                      ...prev,
                      price: value
                    }))
                  }
                  min={1000}
                  max={60000}
                  step={135}
                  className="mt-6"
                />
                
                {/* Price Range Inputs */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1">
                    <label htmlFor="min-price" className="block text-xs text-gray-500 mb-1">Min Price (DZD)</label>
                    <div className="flex items-center relative">
                      <span className="absolute left-3 text-gray-500">DZD</span>
                      <Input 
                        id="min-price"
                        type="number"
                        min={1000}
                        max={selectedFilters.price[1] - 135}
                        value={selectedFilters.price[0]}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value >= 1000 && value < selectedFilters.price[1]) {
                            setSelectedFilters(prev => ({
                              ...prev,
                              price: [value, prev.price[1]]
                            }));
                          }
                        }}
                        className="h-8 text-sm pl-12"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="max-price" className="block text-xs text-gray-500 mb-1">Max Price (DZD)</label>
                    <div className="flex items-center relative">
                      <span className="absolute left-3 text-gray-500">DZD</span>
                      <Input 
                        id="max-price"
                        type="number"
                        min={selectedFilters.price[0] + 135}
                        max={60000}
                        value={selectedFilters.price[1]}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value <= 60000 && value > selectedFilters.price[0]) {
                            setSelectedFilters(prev => ({
                              ...prev,
                              price: [prev.price[0], value]
                            }));
                          }
                        }}
                        className="h-8 text-sm pl-12"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Star Rating Filter */}
          <div className="border-b pb-4 mb-4 border p-2 rounded-md">
            <div 
              className="flex justify-between items-center mb-4 cursor-pointer"
              onClick={() => handleFilterToggle("starRating")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleFilterToggle("starRating")}
              aria-expanded={!collapsedSections.starRating}
              aria-controls="star-rating-content"
            >
              <h3 className="font-medium">Star Rating</h3>
              <div className="flex items-center gap-2">
                {selectedFilters.starRating !== null && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      clearStarRatingFilter();
                    }}
                    className="text-xs text-gray-500 hover:text-blue-600"
                  >
                    Clear
                  </button>
                )}
                {collapsedSections.starRating ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>
            <div 
              id="star-rating-content" 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                collapsedSections.starRating ? 'max-h-0 opacity-0' : 'max-h-72 opacity-100'
              }`}
            >
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button 
                    key={rating}
                    className={`flex items-center justify-center w-8 h-8 border rounded-sm ${
                      selectedFilters.starRating === rating 
                        ? 'bg-blue-100 border-blue-300 text-blue-700' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleStarRatingChange(rating)}
                  >
                    {rating}★
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedFilters.starRating !== null
                  ? `Showing ${selectedFilters.starRating}+ star hotels` 
                  : 'Select to filter by star rating'}
              </p>
            </div>
          </div>
          
          {/* Amenities Filter */}
          <div className="border-b pb-4 mb-4 border p-2 rounded-md">
            <div 
              className="flex justify-between items-center mb-4 cursor-pointer"
              onClick={() => handleFilterToggle("amenities")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleFilterToggle("amenities")}
              aria-expanded={!collapsedSections.amenities}
              aria-controls="amenities-content"
            >
              <h3 className="font-medium">Amenities</h3>
              <div className="flex items-center gap-2">
                {selectedFilters.amenities.length > 0 && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      clearAmenityFilters();
                    }}
                    className="text-xs text-gray-500 hover:text-blue-600"
                  >
                    Clear
                  </button>
                )}
                {collapsedSections.amenities ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>
            <div 
              id="amenities-content" 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                collapsedSections.amenities ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
              }`}
            >
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {uniqueAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <Checkbox 
                      id={amenity.toLowerCase().replace(/\s+/g, '-')} 
                      className="mr-2" 
                      checked={selectedFilters.amenities.includes(amenity)} 
                      onCheckedChange={(checked) => handleAmenityChange(amenity, checked === true)} 
                    />
                    <label htmlFor={amenity.toLowerCase().replace(/\s+/g, '-')} className="text-sm">
                      {amenity}
                    </label>
                  </div>
                ))}
                {uniqueAmenities.length === 0 && (
                  <p className="text-sm text-gray-500">No amenities available</p>
                )}
              </div>
            </div>
          </div>
          
          <button 
            className="w-full bg-green-500 text-white py-2 rounded-md mt-4"
            onClick={applyFilters}
          >
            Apply
          </button>
        </div>
        
        {/* Hotel Listings */}
        <div className="lg:col-span-3">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <HotelCardSkeleton key={i} />
              ))}
            </>
          ) : (
            <Suspense fallback={<>
              {[1, 2, 3].map((i) => (
                <HotelCardSkeleton key={i} />
              ))}
            </>}>
              <HotelListing hotels={hotels} filteredHotels={filteredHotels} />
            </Suspense>
          )}
        </div>
      </div>

    </main>
    <Footer/>
    </>
  );
}
