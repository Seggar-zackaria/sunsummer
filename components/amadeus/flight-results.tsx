"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaArrowRight, FaRegClock, FaPlane } from "react-icons/fa";
import { format as formatDate } from "date-fns";
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export interface FlightSegment {
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  duration: number;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  price: number;
  currency: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  stops: number;
  segments: FlightSegment[];
}

interface FlightResultsProps {
  flights: Flight[];
}

// Helper function to format duration in hours and minutes
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export function FlightResults({ flights }: FlightResultsProps) {
  if (flights.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px] p-6 text-center text-muted-foreground">
        No flights found for your search criteria. Try different dates or airports.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <Card key={flight.id} className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>{flight.airline}</span>
                <span className="text-sm text-muted-foreground">({flight.flightNumber})</span>
              </CardTitle>
              <div className="text-xl font-bold">
                {flight.currency} {flight.price.toFixed(2)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Flight route info */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-xl font-semibold">{flight.departureCity}</div>
                  <div className="mx-2 text-muted-foreground">
                    <FaArrowRight aria-hidden="true" />
                  </div>
                  <div className="text-xl font-semibold">{flight.arrivalCity}</div>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div>
                    {formatDate(new Date(flight.departureTime), "h:mm a")}
                  </div>
                  <div>
                    {formatDate(new Date(flight.arrivalTime), "h:mm a")}
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {formatDate(new Date(flight.departureTime), "EEE, MMM d, yyyy")}
                </div>
              </div>
              
              {/* Duration and stops */}
              <div className="flex flex-col justify-center items-center space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="text-muted-foreground">
                    <FaRegClock aria-hidden="true" />
                  </div>
                  <span>{formatDuration(flight.duration)}</span>
                </div>
                
                <Badge variant={flight.stops === 0 ? "success" : flight.stops > 1 ? "destructive" : "default"}>
                  {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                </Badge>
              </div>
              
              {/* Details button */}
              <div className="flex items-center justify-center mt-2 md:mt-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="flight-details">
                    <AccordionTrigger className="py-2">
                      Flight Details
                    </AccordionTrigger>
                    <AccordionContent>
                      {flight.segments.map((segment, index) => (
                        <div key={index} className="py-2 border-b last:border-b-0 border-gray-100">
                          <div className="text-sm font-medium mb-2">
                            Segment {index + 1}: {segment.airline} {segment.flightNumber}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Departure</div>
                              <div className="font-medium">{segment.departureAirport}</div>
                              <div className="text-sm">
                                {formatDate(new Date(segment.departureTime), "h:mm a")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(new Date(segment.departureTime), "MMM d")}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <div className="text-xs text-muted-foreground">Duration</div>
                              <div className="flex items-center justify-center w-full">
                                <div className="border-t border-dashed border-gray-300 flex-1"></div>
                                <div className="mx-2 text-primary">
                                  <FaPlane aria-hidden="true" />
                                </div>
                                <div className="border-t border-dashed border-gray-300 flex-1"></div>
                              </div>
                              <div className="text-xs">{formatDuration(segment.duration)}</div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Arrival</div>
                              <div className="font-medium">{segment.arrivalAirport}</div>
                              <div className="text-sm">
                                {formatDate(new Date(segment.arrivalTime), "h:mm a")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(new Date(segment.arrivalTime), "MMM d")}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 