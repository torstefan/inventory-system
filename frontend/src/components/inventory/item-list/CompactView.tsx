// frontend/src/components/inventory/item-list/CompactView.tsx
'use client'

import React, { useState } from 'react';
import { Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { StoredItem, EditingItem } from '@/types/itemTypes';
import { ItemFilters, SearchBar } from '../shared';
import { useItemData } from './hooks/useItemData';
import { ItemDetailsPopover } from './components/ItemDetailsPopover';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import ImagePreview from '@/components/common/ImagePreview';
import { useLocationData } from './hooks/useLocationData';
import axios from 'axios';
import { ItemEditForm } from '../shared';

type SortField = 'category' | 'brand_model' | 'location' | null;
type SortDirection = 'asc' | 'desc';

export const CompactView = () => {
  const { 
    items, 
    filteredItems, 
    isLoading, 
    error, 
    handleFilters,
    searchQuery,
    handleSearch,
    handleDelete: apiHandleDelete,  // Rename to avoid confusion
    refreshItems
  } = useItemData();

  const {
    availableLocations,
    selectedLocation,
    setSelectedLocation
  } = useLocationData();

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

  const [selectedItem, setSelectedItem] = useState<StoredItem | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, item: StoredItem) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const popoverWidth = 384; // w-96 = 24rem = 384px
    const windowWidth = window.innerWidth;
    
    // If popover would go off-screen on the right, position it on the left
    const x = rect.right + popoverWidth > windowWidth 
      ? rect.left - popoverWidth - 10 // 10px gap
      : rect.right + 10;
    
    setHoverDetails({
      show: true,
      item,
      x: x,
      y: Math.max(rect.top, 10) // Ensure it's not too close to the top
    });
  };

  const handleMouseLeave = () => {
    setHoverDetails(prev => ({ ...prev, show: false }));
  };

  // Handle row click
  const handleRowClick = (item: StoredItem) => {
    setSelectedItem(item);
  };

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
      const response = await axios.put(
        `http://localhost:5000/api/inventory/items/${editingItem.id}`,
        editingItem.data
      );

      if (response.status === 200) {
        setEditingItem(null);
        refreshItems();  // Refresh the items list
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');  // Add user feedback
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await apiHandleDelete(id);
      refreshItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Prevent row click when clicking image
  const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    setPreviewImage(imageUrl);
  };

  // Sorting function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortField) return 0;

    let compareA: string;
    let compareB: string;

    switch (sortField) {
      case 'category':
        compareA = `${a.category}${a.subcategory || ''}`.toLowerCase();
        compareB = `${b.category}${b.subcategory || ''}`.toLowerCase();
        break;
      case 'brand_model':
        compareA = `${a.brand || ''}${a.model || ''}`.toLowerCase();
        compareB = `${b.brand || ''}${b.model || ''}`.toLowerCase();
        break;
      case 'location':
        compareA = `${a.location?.shelf || ''}${a.location?.container || ''}`.toLowerCase();
        compareB = `${b.location?.shelf || ''}${b.location?.container || ''}`.toLowerCase();
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return compareA.localeCompare(compareB);
    } else {
      return compareB.localeCompare(compareA);
    }
  });

  // Helper for sort indicator
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Image
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Category</span>
                      <SortIndicator field="category" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('brand_model')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Brand/Model</span>
                      <SortIndicator field="brand_model" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Location</span>
                      <SortIndicator field="location" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="px-6 py-2">
                      {item.image_path ? (
                        <div 
                          className="w-16 h-16 relative group"
                          onClick={(e) => handleImageClick(e, `http://localhost:5000/static/${item.image_path}`)}
                        >
                          <img
                            src={`http://localhost:5000/static/${item.image_path}`}
                            alt={`${item.category} - ${item.brand || ''}`}
                            className="w-full h-full object-cover rounded-lg cursor-zoom-in"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </td>
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

      {/* Image Preview Modal */}
      <ImagePreview
        imageUrl={previewImage || ''}
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />

      {/* Item Details Modal */}
      <ItemDetailsModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
              <h3 className="text-xl font-medium mb-4">Edit Item</h3>
              <ItemEditForm
                editingItem={editingItem}
                availableLocations={availableLocations}
                selectedLocation={selectedLocation}
                onEditingChange={setEditingItem}
                onSelectedLocationChange={setSelectedLocation}
                onSave={handleSave}
                onCancel={() => setEditingItem(null)}
              />
            </div>
          </div>
        </div>
      )}

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
