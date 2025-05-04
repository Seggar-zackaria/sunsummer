import React, { useState, useCallback } from 'react';

interface AutocompleteProps {
  endpoint: string;
  placeholder: string;
  onSelect: (value: string) => void;
}

export function Autocomplete({ endpoint, placeholder, onSelect }: AutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = useCallback(async (keyword: string) => {
    if (keyword.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${endpoint}?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();
      setResults(data.airlines || data.locations || []);
    } catch (error) {
      console.error('Autocomplete fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    fetchResults(value);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="input"
      />
      {loading && <div>Loading...</div>}
      <ul>
        {results.map((result) => (
          <li key={result.value} onClick={() => onSelect(result.value)}>
            {result.label}
          </li>
        ))}
      </ul>
    </div>
  );
} 