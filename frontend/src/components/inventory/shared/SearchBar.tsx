// frontend/src/components/inventory/shared/SearchBar.tsx
import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ searchQuery, setSearchQuery, placeholder = "Search items..." }: SearchBarProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <div className="relative flex-grow">
        <input
          type="text"
          className="w-full p-3 pl-10 pr-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        {searchQuery && (
          <button
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};
