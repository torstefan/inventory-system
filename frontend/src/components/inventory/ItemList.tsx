// frontend/src/components/inventory/ItemList.tsx
'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ItemBasicInfo from './ItemBasicInfo';
import ItemTechnicalDetails from './ItemTechnicalDetails';
import ItemEditForm from './ItemEditForm';
import ItemFilters from './ItemFilters';
import { StoredItem, EditingItem } from '../types/itemTypes';
import { ArrowUp, Camera } from 'lucide-react';
import CameraModal from '../common/CameraModal';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </>
  );
};

export default function ItemList() {
  // All useState declarations grouped together at the top
  const [items, setItems] = useState<StoredItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StoredItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedItemForCamera, setSelectedItemForCamera] = useState<number | null>(null);

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
    Promise.all([
      fetchItems(),
      fetchLocations()
    ]).catch(error => {
      console.error('Error during initialization:', error);
      setError('Failed to load data');
      setIsLoading(false);
    });
  }, []);

  const handleImageCapture = async (image: string) => {
    try {
      if (!selectedItemForCamera) return;
      
      // Convert base64 image to blob
      const response = await fetch(image);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', blob, 'item.jpg');
      
      // Upload image
      const uploadResponse = await axios.post('http://localhost:5000/api/images/upload', formData);
      console.log('Upload response:', uploadResponse.data); // Debug log
      
      // Make sure we're using the correct path from the response
      const imagePath = uploadResponse.data.filepath;
      
      console.log('Updating item with image path:', imagePath); // Debug log
      
      // Update item with new image path
      const updateResponse = await axios.put(`http://localhost:5000/api/inventory/items/${selectedItemForCamera}`, {
        image_path: imagePath
      });
      console.log('Update response:', updateResponse.data); // Debug log
      
      // Refresh items list
      await fetchItems();
      
      setSelectedItemForCamera(null);
      setCapturedImage(null);
      setIsCameraOpen(false); // Close the modal after successful upload
    } catch (error: any) {
      console.error('Error updating image:', error);
      setError(error.response?.data?.error || 'Error updating image');
    }
  };

  const handleFilters = ({ selectedCategories, selectedBrands, selectedModels }: {
    selectedCategories: string[];
    selectedBrands: string[];
    selectedModels: string[];
  }) => {
    let filtered = [...items];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => selectedCategories.includes(item.category));
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter(item => {
        const itemBrands = item.brand ? item.brand.split(',').map(b => b.trim()) : [];
        return selectedBrands.every(selectedBrand => 
          selectedBrand === 'Unknown' 
            ? !item.brand || item.brand.trim() === ''
            : itemBrands.includes(selectedBrand)
        );
      });
    }

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
        selected_location: editingItem.data.selected_location,
        image_path: editingItem.data.image_path  // Add this line to include the image path
      };
      
      console.log('Saving with update data:', updateData); // Debug log
      
      await axios.put(
        `http://localhost:5000/api/inventory/items/${editingItem.id}`, 
        updateData
      );
      
      setEditingItem(null);
      await fetchItems();  // This will refresh the list with updated data
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
      <ScrollToTop />
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onImageCapture={handleImageCapture}
      />
    </div>
  );
}
