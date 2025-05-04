declare module 'amadeus' {
  interface AmadeusConstructor {
    clientId: string;
    clientSecret: string;
  }

  interface Location {
    type: string;
    subType: string;
    name: string;
    detailedName: string;
    iataCode: string;
    address: {
      cityName: string;
      cityCode: string;
      countryName: string;
      countryCode: string;
    };
  }

  interface Airline {
    iataCode: string;
    businessName: string;
    commonName: string;
  }

  interface AmadeusResponse<T> {
    data: T[];
    meta?: {
      count: number;
      links: {
        self: string;
      };
    };
  }

  class Amadeus {
    client: any;
    constructor(config: AmadeusConstructor);
    referenceData: {
      airlines: {
        get(params: { keyword: string }): Promise<AmadeusResponse<Airline>>;
      };
      locations: {
        get(params: {
          keyword: string;
          subType?: string;
          countryCode?: string;
          'page[offset]'?: number;
        }): Promise<AmadeusResponse<Location>>;
      };
    };
  }

  export default Amadeus;
}