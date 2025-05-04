"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "@/hooks/useLocation";
import {
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ICountry, IState, ICity } from "country-state-city";
import { HotelLocationDetailsProps } from "@/lib/definitions";

export function HotelLocationDetails({
  form,
  initialCountry = "",
  initialState = "",
  initialCity = "",
}: HotelLocationDetailsProps) {
  const { getAllCountries, getCountryStates, getStateCities } = useLocation();

  // Get all countries once and memoize them
  const countries = useMemo(() => getAllCountries, [getAllCountries]);

  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);

  useEffect(() => {
    if (initialCountry) {
      const fetchedStates = getCountryStates(initialCountry);
      setStates(fetchedStates);

      if (initialState) {
        const fetchedCities = getStateCities(initialCountry, initialState);
        setCities(fetchedCities);
      }

      // Set default values in the form
      form.setValue("country", initialCountry);
      form.setValue("state", initialState);
      form.setValue("city", initialCity);
    }
  }, [initialCountry, initialState, initialCity, form, getCountryStates, getStateCities]);

  const handleCountryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const country = e.target.value;
      const countryStates = getCountryStates(country);
      setStates(countryStates);
      setCities([]);

      form.setValue("country", country);
      form.setValue("state", "");
      form.setValue("city", "");
    },
    [form, getCountryStates]
  );

  const handleStateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const state = e.target.value;
      const country = form.getValues("country") ?? "";
      const stateCities = getStateCities(country, state);
      setCities(stateCities);

      form.setValue("state", state);
      form.setValue("city", "");
    },
    [form, getStateCities]
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Location Details</h2>
      <div className="space-y-4">
        {/* Street Address Field */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter street address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Country, State, City Dropdowns */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Country Select */}
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleCountryChange(e);
                    }}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country: ICountry) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* State Select */}
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleStateChange(e);
                    }}
                    disabled={!form.getValues("country")}
                  >
                    <option value="">Select State</option>
                    {states.map((state: IState) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City Select */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!form.getValues("state")}
                  >
                    <option value="">Select City</option>
                    {cities.map((city: ICity) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}