import axios from 'axios';

const AMADEUS_API_URL = "https://test.api.amadeus.com";
// Log environment variables to debug (will be removed in production)
console.log("Amadeus Client ID exists:", !!process.env.AMADEUS_CLIENT_ID);
console.log("Amadeus Client Secret exists:", !!process.env.AMADEUS_CLIENT_SECRET);
const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

export async function getAmadeusToken() {
  try {
    console.log("Fetching Amadeus token...");
    console.log("URL:", `${AMADEUS_API_URL}/v1/security/oauth2/token`);
    
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: AMADEUS_CLIENT_ID || '',
      client_secret: AMADEUS_CLIENT_SECRET || ''
    });
    
    console.log("Request params:", params.toString());
    
    const response = await axios.post(
      `${AMADEUS_API_URL}/v1/security/oauth2/token`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log("Token response status:", response.status);
    console.log("Token response type:", typeof response.data);
    
    if (!response.data || !response.data.access_token) {
      console.error("Invalid token response:", response.data);
      throw new Error("Invalid token response from Amadeus API");
    }
    
    return response.data.access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error getting Amadeus token:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    } else {
      console.error('Error getting Amadeus token:', error);
    }
    throw new Error('Failed to authenticate with Amadeus API');
  }
}