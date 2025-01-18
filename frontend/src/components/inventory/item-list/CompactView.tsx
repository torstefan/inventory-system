// frontend/src/components/inventory/item-list/CompactView.tsx
'use client'

import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { StoredItem } from '@/types/itemTypes';
import { ItemFilters, SearchBar } from '../shared';
import { useItemData } from './hooks/useItemData';
import { ItemDetailsPopover } from './components/ItemDetailsPopover';

export const CompactView = () => {
  const { 
    items, 
    filteredItems, 
    isLoading, 
    error, 
    handleFilters,
    searchQuery,
    handleSearch 
  } = useItemData();

  const [hoverDetails, setHoverDetails] = useState<{
    show: boolean;
    item: StoredItem | null;
    x: number;
    y: number;
  }>({
    show: false,
    item: null,
    x: 0,
    y: 0
  });

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, item: StoredItem) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverDetails({
      show: true,
      item,
      x: rect.right + 10,
      y: rect.top
    });
  };

  const handleMouseLeave = () => {
    setHoverDetails(prev => ({ ...prev, show: false }));
  };

  if (isLoading) return <div className="text-gray-600">Loading items...</div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  if (items.length === 0) return <div className="text-gray-500">No items in inventory yet.</div>;

  return (
    <div className="w-full">
      <div className="w-full max-w-screen pl-4">
        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={handleSearch}
            placeholder="Search by category, brand, model..."
          />
        </div>
        
        {/* Filters */}
        {items.length > 0 && (
          <div className="mb-4">
            <ItemFilters items={items} onFilterChange={handleFilters} />
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                    Brand/Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                    Location
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-2">
                      <div className="text-sm font-medium text-gray-900">{item.category}</div>
                      {item.subcategory && (
                        <div className="text-sm text-gray-500">{item.subcategory}</div>
                      )}
                    </td>
                    <td className="px-6 py-2">
                      <div className="text-sm text-gray-900">
                        {[item.brand, item.model].filter(Boolean).join(' - ') || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <div className="text-sm text-gray-900">
                        {item.location?.shelf && item.location?.container 
                          ? `${item.location.shelf} - ${item.location.container}`
                          : 'No location'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-2 text-center">
                      <div 
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-100 cursor-pointer"
                        onMouseEnter={(e) => handleMouseEnter(e, item)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Eye size={16} className="text-blue-600" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Item Details Popover */}
      {hoverDetails.show && hoverDetails.item && (
        <ItemDetailsPopover 
          item={hoverDetails.item}
          position={{ x: hoverDetails.x, y: hoverDetails.y }}
        />
      )}
    </div>
  );
};

export default CompactView;
