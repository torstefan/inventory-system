'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ItemBasicInfo from './ItemBasicInfo';
import ItemTechnicalDetails from './ItemTechnicalDetails';
import ItemEditForm from './ItemEditForm';
import ItemFilters from './ItemFilters';
import { StoredItem, EditingItem } from '../types/itemTypes';

export default function ItemList() {
  const [items, setItems] = useState<StoredItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StoredItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/inventory/items');
      const itemsData = response.data.items;
      setItems(itemsData);
      setFilteredItems(itemsData);
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error loading items');
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/storage/level1');
      setAvailableLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  useEffect(() => {
    // Initialize data
    Promise.all([
      fetchItems(),
      fetchLocations()
    ]).catch(error => {
      console.error('Error during initialization:', error);
      setError('Failed to load data');
      setIsLoading(false);
    });
  }, []);

  const handleFilters = ({ selectedCategories, selectedBrands, selectedModels }: {
    selectedCategories: string[];
    selectedBrands: string[];
    selectedModels: string[];
  }) => {
    let filtered = [...items];

    // Filter by categories (OR logic between categories)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => selectedCategories.includes(item.category));
    }

    // Filter by brands (AND logic between brands)
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(item => {
        // Handle both cases where brand might be a single brand or a comma-separated list
        const itemBrands = item.brand ? item.brand.split(',').map(b => b.trim()) : [];
        return selectedBrands.every(selectedBrand => 
          selectedBrand === 'Unknown' 
            ? !item.brand || item.brand.trim() === ''
            : itemBrands.includes(selectedBrand)
        );
      });
    }

    // Filter by models (AND logic between models)
    if (selectedModels.length > 0) {
      filtered = filtered.filter(item => {
        const itemModels = item.model ? item.model.split(',').map(m => m.trim()) : [];
        return selectedModels.every(selectedModel => 
          selectedModel === 'Unknown'
            ? !item.model || item.model.trim() === ''
            : itemModels.includes(selectedModel)
        );
      });
    }

    setFilteredItems(filtered);
  };

  const toggleItemExpansion = (itemId: number) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
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
      const updateData = {
        category: editingItem.data.category,
        subcategory: editingItem.data.subcategory,
        brand: editingItem.data.brand,
        model: editingItem.data.model,
        condition: editingItem.data.condition,
        technical_description: editingItem.data.technical_description,
        use_cases: editingItem.data.use_cases,
        selected_location: editingItem.data.selected_location
      };
      
      await axios.put(
        `http://localhost:5000/api/inventory/items/${editingItem.id}`, 
        updateData
      );
      
      setEditingItem(null);
      await fetchItems();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error updating item');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/inventory/items/${id}`);
      await fetchItems();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error deleting item');
    }
  };

  if (isLoading) return <div className="text-gray-600">Loading items...</div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  if (items.length === 0) return <div className="text-gray-500">No items in inventory yet.</div>;

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <ItemFilters items={items} onFilterChange={handleFilters} />
      )}

      <h2 className="text-xl font-semibold mb-4">
        Inventory Items 
        {filteredItems.length !== items.length && (
          <span className="text-sm font-normal text-gray-600 ml-2">
            (Showing {filteredItems.length} of {items.length} items)
          </span>
        )}
      </h2>

      <div className="grid gap-4">
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
  );
}
