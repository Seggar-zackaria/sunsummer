import { Country, State, City, } from "country-state-city";

export const useLocation = () => {
    const getCountryByCode = (countryCode: string) => {
        const country = Country.getAllCountries().find((country)=> country.isoCode === countryCode);
        return country;
    };

    const getStateByCode = (countryCode: string, stateCode: string) => {
        const state = State.getAllStates().find(
            (state)=> state.countryCode === countryCode && state.isoCode === stateCode
        );
        
        if(!state) {
            return null;
        }

        return state;
    };

    const getCountryStates = (countryCode: string) => {

        const state = State.getAllStates().filter((state)=> state.countryCode === countryCode);
        
        return state;
    }

    const getStateCities = (countryCode: string, stateCode: string) => {
        const city = City.getAllCities().filter((city)=> city.countryCode === countryCode && city.stateCode === stateCode);
        return city;
    }

    return { 
        getAllCountries: Country.getAllCountries(),
        getCountryByCode,
        getStateByCode,
        getCountryStates,
        getStateCities,
     };

};
