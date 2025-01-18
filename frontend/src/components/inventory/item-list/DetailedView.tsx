// frontend/src/components/inventory/item-list/DetailedView.tsx
'use client'

import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { StoredItem, EditingItem } from '@/types/itemTypes';
import { ItemBasicInfo, ItemTechnicalDetails, ItemFilters, ItemEditForm, SearchBar } from '../shared';
import { useItemData } from './hooks/useItemData';
import { useLocationData } from './hooks/useLocationData';
import ScrollToTop from '../../common/ScrollToTop';

export const DetailedView = () => {
  const { 
    items, 
    filteredItems, 
    isLoading, 
    error, 
    handleFilters, 
    handleDelete,
    refreshItems,
    searchQuery,
    handleSearch
  } = useItemData();

  const {
    availableLocations,
    selectedLocation,
    setSelectedLocation
  } = useLocationData();

  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const handleEdit = (item: StoredItem) => {
    setEditingItem({
      id: item.id,
      data: {
        ...item,
        selected_location: item.location ? {
          shelf: item.location.shelf,
          container: item.location.container
        } : null
      }
    });
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      const updateData = {
        category: editingItem.data.category,
        subcategory: editingItem.data.subcategory,
        brand: editingItem.data.brand,
        model: editingItem.data.model,
        condition: editingItem.data.condition,
        technical_details: editingItem.data.technical_details,
        selected_location: editingItem.data.selected_location,
        image_path: editingItem.data.image_path
      };
      
      await refreshItems();
      setEditingItem(null);
    } catch (error: any) {
      console.error('Error saving item:', error);
    }
  };

  const toggleItemExpansion = (itemId: number) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (isLoading) return <div className="text-gray-600">Loading items...</div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  if (items.length === 0) return <div className="text-gray-500">No items in inventory yet.</div>;

  return (
    <div className="flex justify-center">
      <div className="max-w-4xl w-full">
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
          <ItemFilters items={items} onFilterChange={handleFilters} />
        )}

        <div className="grid gap-4 mt-4">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-lg shadow p-4"
            >
              {editingItem?.id === item.id ? (
                <ItemEditForm
                  editingItem={editingItem}
                  availableLocations={availableLocations}
                  selectedLocation={selectedLocation}
                  onEditingChange={setEditingItem}
                  onSelectedLocationChange={setSelectedLocation}
                  onSave={handleSave}
                  onCancel={() => setEditingItem(null)}
                />
              ) : (
                <div className="space-y-4">
                  <ItemBasicInfo item={item} />

                  <div className="border-t pt-2">
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

                  <div className="flex justify-end space-x-2">
                    <button
                      className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    Added: {new Date(item.date_added).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default DetailedView;
