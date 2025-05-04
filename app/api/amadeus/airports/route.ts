import { NextResponse } from 'next/server';
import axios from 'axios';
import { getAmadeusToken } from '@/app/api/amadeus/utils';

const AMADEUS_API_URL = "https://test.api.amadeus.com";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  
  if (!keyword) {
    return NextResponse.json(
      { error: 'Keyword parameter is required' },
      { status: 400 }
    );
  }

  try {
    const token = await getAmadeusToken();
    
    const response = await axios.get(
      `${AMADEUS_API_URL}/v1/reference-data/locations`,
      {
        params: { 
          keyword,
          subType: 'AIRPORT',
          'page[offset]': 0
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // If we're in a development environment and Amadeus doesn't return data,
    // provide some sample data for testing
    if (!response.data.data || response.data.data.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        const sampleAirports = [
          {
            type: 'location',
            subType: 'AIRPORT',
            name: 'John F Kennedy International Airport',
            detailedName: 'New York/John F Kennedy International Airport',
            iataCode: 'JFK',
            address: {
              cityName: 'New York',
              cityCode: 'NYC',
              countryName: 'United States of America',
              countryCode: 'US'
            }
          },
          {
            type: 'location',
            subType: 'AIRPORT',
            name: 'Los Angeles International Airport',
            detailedName: 'Los Angeles/Los Angeles International Airport',
            iataCode: 'LAX',
            address: {
              cityName: 'Los Angeles',
              cityCode: 'LAX',
              countryName: 'United States of America',
              countryCode: 'US'
            }
          },
          {
            type: 'location',
            subType: 'AIRPORT',
            name: 'Heathrow Airport',
            detailedName: 'London/Heathrow Airport',
            iataCode: 'LHR',
            address: {
              cityName: 'London',
              cityCode: 'LON',
              countryName: 'United Kingdom',
              countryCode: 'GB'
            }
          },
          {
            type: 'location',
            subType: 'AIRPORT',
            name: 'Charles de Gaulle Airport',
            detailedName: 'Paris/Charles de Gaulle Airport',
            iataCode: 'CDG',
            address: {
              cityName: 'Paris',
              cityCode: 'PAR',
              countryName: 'France',
              countryCode: 'FR'
            }
          }
        ].filter(airport => 
          airport.name.toLowerCase().includes(keyword.toLowerCase()) || 
          airport.detailedName.toLowerCase().includes(keyword.toLowerCase()) ||
          airport.iataCode.toLowerCase().includes(keyword.toLowerCase()) ||
          airport.address.cityName.toLowerCase().includes(keyword.toLowerCase())
        );
        
        return NextResponse.json({ data: sampleAirports });
      }
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Airport search error:', error);
    return NextResponse.json(
      { error: 'Failed to search airports' },
      { status: 500 }
    );
  }
} 