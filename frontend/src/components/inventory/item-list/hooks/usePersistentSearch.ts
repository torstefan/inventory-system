// frontend/src/components/inventory/item-list/hooks/usePersistentSearch.ts
import { useState, useEffect } from 'react';

const SEARCH_STORAGE_KEY = 'inventory-search-query';

export const usePersistentSearch = () => {
  // Initialize with value from localStorage if it exists
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SEARCH_STORAGE_KEY) || '';
    }
    return '';
  });

  // Update localStorage when searchQuery changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SEARCH_STORAGE_KEY, searchQuery);
    }
  }, [searchQuery]);

  return [searchQuery, setSearchQuery] as const;
};
