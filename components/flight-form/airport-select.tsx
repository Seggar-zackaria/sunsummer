"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Airport {
  iataCode: string;
  name: string;
  detailedName: string;
  address: {
    cityName: string;
    countryName: string;
  };
}

interface AirportSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Fallback data to use when API is unavailable
const FALLBACK_AIRPORTS: Airport[] = [
  { 
    iataCode: "CDG", 
    name: "Charles de Gaulle Airport", 
    detailedName: "Paris Charles de Gaulle Airport",
    address: { 
      cityName: "Paris", 
      countryName: "France" 
    } 
  },
  { 
    iataCode: "LHR", 
    name: "Heathrow Airport", 
    detailedName: "London Heathrow Airport",
    address: { 
      cityName: "London", 
      countryName: "United Kingdom" 
    } 
  },
  { 
    iataCode: "JFK", 
    name: "John F. Kennedy International Airport", 
    detailedName: "New York JFK International Airport",
    address: { 
      cityName: "New York", 
      countryName: "United States" 
    } 
  },
  { 
    iataCode: "DXB", 
    name: "Dubai International Airport", 
    detailedName: "Dubai International Airport",
    address: { 
      cityName: "Dubai", 
      countryName: "United Arab Emirates" 
    } 
  },
  { 
    iataCode: "HND", 
    name: "Haneda Airport", 
    detailedName: "Tokyo Haneda International Airport",
    address: { 
      cityName: "Tokyo", 
      countryName: "Japan" 
    } 
  },
  { 
    iataCode: "SYD", 
    name: "Sydney Airport", 
    detailedName: "Sydney Kingsford Smith Airport",
    address: { 
      cityName: "Sydney", 
      countryName: "Australia" 
    } 
  },
  { 
    iataCode: "FRA", 
    name: "Frankfurt Airport", 
    detailedName: "Frankfurt am Main Airport",
    address: { 
      cityName: "Frankfurt", 
      countryName: "Germany" 
    } 
  },
  { 
    iataCode: "IST", 
    name: "Istanbul Airport", 
    detailedName: "Istanbul Airport",
    address: { 
      cityName: "Istanbul", 
      countryName: "Turkey" 
    } 
  },
  { 
    iataCode: "AMS", 
    name: "Amsterdam Airport Schiphol", 
    detailedName: "Amsterdam Airport Schiphol",
    address: { 
      cityName: "Amsterdam", 
      countryName: "Netherlands" 
    } 
  },
  { 
    iataCode: "MAD", 
    name: "Adolfo Suárez Madrid–Barajas Airport", 
    detailedName: "Madrid Barajas International Airport",
    address: { 
      cityName: "Madrid", 
      countryName: "Spain" 
    } 
  },
];

export function AirportSelect({ 
  value, 
  onChange,
  placeholder = "Search airport...",
  disabled = false
}: AirportSelectProps) {
  const [open, setOpen] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [storedAirports, setStoredAirports] = useState<Record<string, Airport>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const maxRetries = 2;
  
  const debouncedSearch = useDebounce(search, 350);

  // Cache fallback airports on component mount
  useEffect(() => {
    FALLBACK_AIRPORTS.forEach(airport => {
      saveToCache(airport);
    });
  }, []);

  // Load stored airport data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('airports-cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        setStoredAirports(parsed);
      }
    } catch (e) {
      console.error("Failed to load airports from cache:", e);
    }
  }, []);

  // Save airport to localStorage cache
  const saveToCache = (airport: Airport) => {
    try {
      const newCache = {
        ...storedAirports,
        [airport.iataCode]: airport
      };
      setStoredAirports(newCache);
      localStorage.setItem('airports-cache', JSON.stringify(newCache));
    } catch (e) {
      console.error("Failed to cache airport:", e);
    }
  };

  // Function to retry the last fetch
  const retryFetch = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
  };

  // Use fallback data
  const useFallbackData = () => {
    setUseFallback(true);
    setError(null);
    setLoading(false);

    // Filter fallback airports based on search
    if (debouncedSearch && debouncedSearch.length >= 2) {
      const filtered = FALLBACK_AIRPORTS.filter(airport => 
        airport.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        airport.address.cityName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        airport.address.countryName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        airport.iataCode.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setAirports(filtered);
      
      if (filtered.length === 0) {
        setError("No airports found matching your search");
      }
    } else {
      setAirports(FALLBACK_AIRPORTS);
    }
  };

  // Search airports from API
  useEffect(() => {
    // If using fallback mode, filter the fallback data instead
    if (useFallback) {
      useFallbackData();
      return;
    }
    
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setAirports([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const FetchAirports = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Add timestamp to prevent caching issues
        const timestamp = new Date().getTime();
        const response = await fetch(
          `/api/amadeus/airports?keyword=${encodeURIComponent(debouncedSearch)}&_t=${timestamp}`,
          { 
            signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }
        );
        
        // Handle HTTP errors with more specific messages
        if (!response.ok) {
          if (response.status === 500) {
            // Automatically switch to fallback mode on server error
            useFallbackData();
            return;
          } else if (response.status === 429) {
            throw new Error("Too many requests. Please try again in a moment.");
          } else if (response.status === 401 || response.status === 403) {
            throw new Error("Authorization error with the airport API.");
          } else {
            throw new Error(`API error: ${response.status}`);
          }
        }
        
        // Reset retry count on success
        setRetryCount(0);
        setUseFallback(false);
        
        // Safe JSON parsing
        let data;
        try {
          data = await response.json();
        } catch (e) {
          throw new Error("Invalid JSON response from server");
        }
        
        // Validate data structure
        if (!data || !Array.isArray(data.data)) {
          // Check if we received an error message in the response
          if (data && data.error) {
            throw new Error(`API error: ${data.error}`);
          }
          throw new Error("Invalid API response format");
        }
        
        // Update airports and cache them
        const airportData = data.data as Airport[];
        setAirports(airportData);
        
        // Cache each airport
        airportData.forEach(airport => {
          saveToCache(airport);
        });
        
        // Show message if no results
        if (airportData.length === 0) {
          setError("No airports found matching your search");
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            // Request was aborted, do nothing
            return;
          }
          setError(err.message || "Failed to fetch airports");
          
          // Log the error for debugging
          console.error("Airport fetch error:", err);
          
          // After max retries, switch to fallback
          if (retryCount >= maxRetries) {
            useFallbackData();
          }
        } else {
          setError("An unexpected error occurred");
          
          // After max retries or on unknown errors, switch to fallback
          if (retryCount >= maxRetries) {
            useFallbackData();
          }
        }
        
        if (!useFallback) {
          setAirports([]);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    FetchAirports();

    // Cleanup function to abort fetch on unmount or when search changes
    return () => {
      controller.abort();
    };
  }, [debouncedSearch, retryCount]);

  // Find the selected airport from memory or cache
  const selectedAirport = useMemo(() => {
    if (!value) return null;
    
    // First check current results
    const fromResults = airports.find(airport => airport.iataCode === value);
    if (fromResults) return fromResults;
    
    // Then check cache
    if (storedAirports[value]) return storedAirports[value];
    
    return null;
  }, [value, airports, storedAirports]);

  // Display value for the button
  const displayValue = useMemo(() => {
    if (value && selectedAirport && selectedAirport.address) {
      return `${selectedAirport.iataCode} - ${selectedAirport.address.cityName}`;
    }
    
    if (value) {
      return value; // Fallback to the raw value
    }
    
    return placeholder;
  }, [value, selectedAirport, placeholder]);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between"
            data-testid="airport-select-trigger"
          >
            <span className="truncate">{displayValue}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px]" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={placeholder}
              value={search}
              onValueChange={setSearch}
              className="h-9"
              data-testid="airport-search-input"
            />
            
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              )}
              
              {error && !loading && !useFallback && (
                <div className="p-2">
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs flex flex-col">
                      <span>{error}</span>
                      {retryCount < maxRetries && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={retryFetch} 
                          className="text-xs mt-1 h-auto p-0"
                        >
                          Try again
                        </Button>
                      )}
                      {retryCount >= maxRetries && (
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-xs">
                            API is unavailable. 
                          </span>
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={useFallbackData} 
                            className="text-xs h-auto p-0"
                          >
                            Use sample airports instead
                          </Button>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              {useFallback && (
                <div className="p-2">
                  <Alert className="py-2 bg-yellow-50 border-yellow-200">
                    <AlertDescription className="text-xs text-yellow-800">
                      Using sample airport data. API is unavailable.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              {!loading && !error && debouncedSearch.length < 2 && (
                <div className="px-2 py-3 text-sm text-center text-muted-foreground">
                  Type at least 2 characters to search
                </div>
              )}
              
              <CommandEmpty>
                {!loading && debouncedSearch.length >= 2 && !error && (
                  <div className="py-3 text-sm text-center text-muted-foreground">
                    No airports found
                  </div>
                )}
              </CommandEmpty>
              
              <CommandGroup className="max-h-[300px] overflow-auto">
                {airports.map((airport) => (
                  <CommandItem
                    key={airport.iataCode}
                    value={airport.iataCode}
                    onSelect={() => {
                      onChange(airport.iataCode);
                      saveToCache(airport);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === airport.iataCode ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {airport.iataCode} - {airport.address?.cityName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {airport.name}, {airport.address?.countryName}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 