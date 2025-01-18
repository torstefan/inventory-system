// frontend/src/components/inventory/shared/ItemEditForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { EditingItem } from '@/types/itemTypes';
import { Camera, Wand2 } from 'lucide-react';
import CameraModal from '@/components/common/CameraModal';

interface ItemEditFormProps {
  editingItem: EditingItem;
  availableLocations: any[];
  selectedLocation: string;
  onEditingChange: (editing: EditingItem) => void;
  onSelectedLocationChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ItemEditForm({
  editingItem,
  availableLocations,
  selectedLocation,
  onEditingChange,
  onSelectedLocationChange,
  onSave,
  onCancel
}: ItemEditFormProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manualDescription, setManualDescription] = useState('');

  const handleImageCapture = async (image: string) => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'item.jpg');
      
      const uploadResponse = await axios.post('http://localhost:5000/api/images/raw-upload', formData);
      const imagePath = uploadResponse.data.filepath;
      
      onEditingChange({
        ...editingItem,
        data: {
          ...editingItem.data,
          image_path: imagePath
        }
      });
      
      setIsCameraOpen(false);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const analyzeCurrent = async () => {
    try {
      setIsAnalyzing(true);
      const currentData = {
        category: editingItem.data.category,
        subcategory: editingItem.data.subcategory,
        brand: editingItem.data.brand,
        model: editingItem.data.model,
        image_path: editingItem.data.image_path,
        manual_description: manualDescription
      };

      const response = await axios.post('http://localhost:5000/api/text/analyze', currentData);
      const analysis = response.data.analysis;

      onEditingChange({
        ...editingItem,
        data: {
          ...editingItem.data,
          technical_details: {
            description: analysis.technical_details?.description || '',
            use_cases: analysis.technical_details?.use_cases || []
          },
          condition: analysis.properties?.condition || editingItem.data.condition,
          selected_location: analysis.suggested_location || editingItem.data.selected_location
        }
      });

      if (analysis.suggested_location) {
        const locationString = `${analysis.suggested_location.shelf}|||${analysis.suggested_location.container}`;
        onSelectedLocationChange(locationString);
      }
    } catch (error) {
      console.error('Error analyzing item:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderCurrentImage = () => {
    if (!editingItem.data.image_path || imageError) {
      return (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200">
          <span className="text-gray-400">No image</span>
        </div>
      );
    }

    const imageUrl = `http://localhost:5000/static/${editingItem.data.image_path}`;
    return (
      <img
        src={imageUrl}
        alt="Current item"
        className="w-full h-48 object-contain rounded-lg border border-gray-200"
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Image and Update Button */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Current Image</label>
        {renderCurrentImage()}
        <button
          className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 flex items-center gap-2"
          onClick={() => setIsCameraOpen(true)}
        >
          <Camera size={18} />
          Update Picture
        </button>
      </div>

      {/* Manual Description and Analysis Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700">Additional Description for Analysis</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm resize-vertical"
            rows={3}
            placeholder="Add any additional details about the item that might help with analysis..."
            onChange={(e) => setManualDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              isAnalyzing 
                ? 'bg-purple-100 text-purple-400 cursor-not-allowed'
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
            }`}
            onClick={analyzeCurrent}
            disabled={isAnalyzing}
          >
            <Wand2 size={18} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Current Info'}
          </button>
        </div>
      </div>

      {/* Basic Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={editingItem.data.category || ''}
            onChange={(e) => onEditingChange({
              ...editingItem,
              data: { ...editingItem.data, category: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Subcategory</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={editingItem.data.subcategory || ''}
            onChange={(e) => onEditingChange({
              ...editingItem,
              data: { ...editingItem.data, subcategory: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={editingItem.data.brand || ''}
            onChange={(e) => onEditingChange({
              ...editingItem,
              data: { ...editingItem.data, brand: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Model</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={editingItem.data.model || ''}
            onChange={(e) => onEditingChange({
              ...editingItem,
              data: { ...editingItem.data, model: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Condition</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={editingItem.data.condition || ''}
            onChange={(e) => onEditingChange({
              ...editingItem,
              data: { ...editingItem.data, condition: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={selectedLocation}
            onChange={(e) => {
              const value = e.target.value;
              onSelectedLocationChange(value);
              
              if (!value) {
                onEditingChange({
                  ...editingItem,
                  data: {
                    ...editingItem.data,
                    selected_location: null
                  }
                });
                return;
              }

              const [shelf, container] = value.split('|||');
              onEditingChange({
                ...editingItem,
                data: {
                  ...editingItem.data,
                  selected_location: { shelf, container }
                }
              });
            }}
          >
            <option value="">Select location</option>
            {availableLocations.map((loc) => 
              loc.level2.map((container: any) => {
                const value = `${loc.level1.name}|||${container.name}`;
                return (
                  <option 
                    key={value}
                    value={value}
                  >
                    {`${loc.level1.name} - ${container.name}`}
                  </option>
                );
              })
            )}
          </select>
        </div>
      </div>

      {/* Technical Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Technical Description</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm resize-vertical"
          rows={4}
          value={editingItem.data.technical_details?.description || ''}
          onChange={(e) => onEditingChange({
            ...editingItem,
            data: { 
              ...editingItem.data, 
              technical_details: {
                ...editingItem.data.technical_details,
                description: e.target.value
              }
            }
          })}
        />
      </div>

      {/* Use Cases */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Use Cases (one per line)</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm resize-vertical"
          rows={4}
          value={editingItem.data.technical_details?.use_cases?.join('\n') || ''}
          onChange={(e) => onEditingChange({
            ...editingItem,
            data: { 
              ...editingItem.data,
              technical_details: {
                ...editingItem.data.technical_details,
                use_cases: e.target.value.split('\n').filter(line => line.trim())
              }
            }
          })}
          placeholder="Enter each use case on a new line"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onSave}
        >
          Save Changes
        </button>
      </div>

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onImageCapture={handleImageCapture}
      />
    </div>
  );
}
