// components/inventory/ItemEditForm.tsx
import React from 'react';
import { EditingItem } from '../types/itemTypes';

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
  return (
    <div className="space-y-4">
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

      <div>
        <label className="block text-sm font-medium text-gray-700">Technical Description</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          rows={3}
          value={editingItem.data.technical_description || ''}
          onChange={(e) => onEditingChange({
            ...editingItem,
            data: { ...editingItem.data, technical_description: e.target.value }
          })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Use Cases (one per line)</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          rows={3}
          value={editingItem.data.use_cases?.join('\n') || ''}
          onChange={(e) => onEditingChange({
            ...editingItem,
            data: { 
              ...editingItem.data, 
              use_cases: e.target.value.split('\n').filter(line => line.trim()) 
            }
          })}
          placeholder="Enter each use case on a new line"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
