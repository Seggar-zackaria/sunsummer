"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, Loader2, AlertCircle, PlusCircle } from "lucide-react";
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
  onChange: (name: string, code?: string) => void;
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

  useEffect(() => {
    FALLBACK_AIRPORTS.forEach(airport => {
      saveToCache(airport);
    });
  }, []);

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

  const retryFetch = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
  };

  
  const useFallbackData = () => {
    setUseFallback(true);
    setError(null);
    setLoading(false);

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

  useEffect(() => {
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
        
        if (!response.ok) {
          if (response.status === 500) {
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
        
        setRetryCount(0);
        setUseFallback(false);
        
        let data;
        try {
          data = await response.json();
        } catch (e) {
          throw new Error("Invalid JSON response from server");
        }
        
        if (!data || !Array.isArray(data.data)) {
          if (data && data.error) {
            throw new Error(`API error: ${data.error}`);
          }
          throw new Error("Invalid API response format");
        }
        
        const airportData = data.data as Airport[];
        setAirports(airportData);
        
        airportData.forEach(airport => {
          saveToCache(airport);
        });
        
        if (airportData.length === 0) {
          setError("No airports found matching your search");
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            return;
          }
          setError(err.message || "Failed to fetch airports");
          
          console.error("Airport fetch error:", err);
          
          if (retryCount >= maxRetries) {
            useFallbackData();
          }
        } else {
          setError("An unexpected error occurred");
          
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

    return () => {
      controller.abort();
    };
  }, [debouncedSearch, retryCount]);

  const selectedAirport = useMemo(() => {
    if (!value) return null;
    
    const fromResults = airports.find(airport => airport.name === value);
    if (fromResults) return fromResults;
    
    const cachedAirport = Object.values(storedAirports).find(a => a.name === value);
    if (cachedAirport) return cachedAirport;
    
    return null;
  }, [value, airports, storedAirports]);

  const displayValue = useMemo(() => {
    if (value && selectedAirport && selectedAirport.address) {
      return `${selectedAirport.name} (${selectedAirport.iataCode})`;
    }
    
    if (value) {
      return value; 
    }
    
    return placeholder;
  }, [value, selectedAirport, placeholder]);

  const handleManualEntry = () => {
    if (search && search.trim() !== "") {
      onChange(search.trim());
      setOpen(false);
      setSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleManualEntry();
    }
  };

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
          <Command shouldFilter={false} onKeyDown={handleKeyDown}>
            <CommandInput
              placeholder={placeholder}
              value={search}
              onValueChange={setSearch}
              className="h-9"
              data-testid="airport-search-input"
            />
            
            {search && search.length > 0 && (
              <div className="px-2 py-1.5 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm font-normal"
                  onClick={handleManualEntry}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Use "{search}" as custom entry
                  <span className="ml-auto text-xs text-muted-foreground">(Ctrl+Enter)</span>
                </Button>
              </div>
            )}
            
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
                    value={airport.name}
                    onSelect={() => {
                      onChange(airport.name, airport.iataCode);
                      saveToCache(airport);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === airport.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {airport.name} ({airport.iataCode})
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {airport.address?.cityName}, {airport.address?.countryName}
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