// frontend/src/components/inventory/SearchPanel.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import { ItemBasicInfo, ItemTechnicalDetails } from './shared';
import { StoredItem } from '../types/itemTypes';

export default function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<StoredItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setItems([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`http://localhost:5000/api/inventory/search`, {
          params: { query }
        });
        setItems(response.data.items);
      } catch (error: any) {
        console.error('Search error:', error);
        setError(error.response?.data?.error || 'Error searching items');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  const toggleItemExpansion = (itemId: number) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          className="w-full p-3 pl-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search items (minimum 3 characters)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <svg
          className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Instructions */}
      {searchQuery.length > 0 && searchQuery.length < 3 && (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
          Please enter at least 3 characters to search
        </div>
      )}

      {/* Results */}
      {!isLoading && items.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Search Results ({items.length})</h2>
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <ItemBasicInfo item={item} />
              
              {/* Expandable Technical Details */}
              <div className="border-t mt-4 pt-2">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => toggleItemExpansion(item.id)}
                >
                  {expandedItems.includes(item.id) ? 'Hide Details' : 'Show Details'}
                </button>
                
                {expandedItems.includes(item.id) && (
                  <ItemTechnicalDetails item={item} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && searchQuery.length >= 3 && items.length === 0 && (
        <div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-center">
          No items found matching your search
        </div>
      )}
    </div>
  );
}
