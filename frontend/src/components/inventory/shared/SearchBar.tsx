// frontend/src/components/inventory/shared/SearchBar.tsx
import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ searchQuery, setSearchQuery, placeholder = "Search items..." }: SearchBarProps) => {
  return (
    <div className="relative mb-4">
      <input
        type="text"
        className="w-full p-3 pl-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
    </div>
  );
};
