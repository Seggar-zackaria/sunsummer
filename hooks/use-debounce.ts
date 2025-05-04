import { useState, useEffect } from 'react';

/**
 * A hook that debounces a value by the specified amount of time.
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout to update the debounced value after the delay
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if the value changes before the delay has passed
    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]);

  return debouncedValue;
} 