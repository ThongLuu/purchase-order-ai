import React, { useState, useEffect, KeyboardEvent } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { searchProducts } from '../utils/productAPI';

export interface SKUAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (product: any) => void;
  onKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const SKUAutocomplete: React.FC<SKUAutocompleteProps> = ({ value, onChange, onSelect, onKeyPress }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const searchSKU = async (event: { query: string }) => {
    try {
      const results = await searchProducts(event.query);
      setSuggestions(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error('Error searching products:', error);
      setSuggestions([]);
    }
  };

  return (
    <AutoComplete
      value={value}
      suggestions={suggestions}
      completeMethod={searchSKU}
      field="sku"
      onChange={(e) => onChange(e.value)}
      onSelect={(e) => onSelect(e.value)}
      onKeyPress={onKeyPress}
      placeholder="Enter SKU"
    />
  );
};

export default SKUAutocomplete;