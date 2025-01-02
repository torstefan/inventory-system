'use client'

import React, { useState } from 'react';
import axios from 'axios';

interface AddContainerFormProps {
  shelfId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AddContainerForm({ shelfId, onCancel, onSuccess }: AddContainerFormProps) {
  const [newContainer, setNewContainer] = useState({
    name: '',
    containerType: 'regular_box' as const,
    description: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      if (!newContainer.name.trim()) {
        setError('Container name is required');
        return;
      }

      await axios.post('http://localhost:5000/api/storage/level2', {
        shelfId,
        ...newContainer
      });
      
      setNewContainer({
        name: '',
        containerType: 'regular_box',
        description: ''
      });
      
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error adding container');
    }
  };

  return (
    <div className="mt-4 ml-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium mb-2">Add New Container</h4>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Container Name"
          value={newContainer.name}
          onChange={(e) => setNewContainer(prev => ({
            ...prev,
            name: e.target.value
          }))}
        />
        <select
          className="w-full p-2 border rounded"
          value={newContainer.containerType}
          onChange={(e) => setNewContainer(prev => ({
            ...prev,
            containerType: e.target.value as 'regular_box' | 'drawer_organizer'
          }))}
        >
          <option value="regular_box">Regular Box</option>
          <option value="drawer_organizer">Drawer Organizer</option>
        </select>
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Description (optional)"
          value={newContainer.description}
          onChange={(e) => setNewContainer(prev => ({
            ...prev,
            description: e.target.value
          }))}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSubmit}
          >
            Add Container
          </button>
        </div>
      </div>
    </div>
  );
}
