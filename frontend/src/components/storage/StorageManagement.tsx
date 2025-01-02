'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface StorageLocation {
  level1: {
    id: number;
    name: string;
    description?: string;
  };
  level2: {
    id: number;
    name: string;
    containerType: 'regular_box' | 'drawer_organizer';
    description?: string;
  }[];
  level3: {
    id: number;
    containerId: number;
    name: string;
    description?: string;
  }[];
}

export default function StorageManagement() {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [newShelf, setNewShelf] = useState({ name: '', description: '' });
  const [selectedShelf, setSelectedShelf] = useState<number | null>(null);
  const [newContainer, setNewContainer] = useState({
    name: '',
    containerType: 'regular_box',
    description: ''
  });

  const handleAddShelf = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/storage/level1', newShelf);
      setLocations([...locations, { ...response.data, level2: [], level3: [] }]);
      setNewShelf({ name: '', description: '' });
    } catch (error) {
      console.error('Error adding shelf:', error);
    }
  };

  const handleAddContainer = async () => {
    if (!selectedShelf) return;

    try {
      const response = await axios.post(`http://localhost:5000/api/storage/level2`, {
        ...newContainer,
        shelfId: selectedShelf
      });
      
      // Update locations state
      setLocations(locations.map(loc => 
        loc.level1.id === selectedShelf
          ? { ...loc, level2: [...loc.level2, response.data] }
          : loc
      ));
      
      setNewContainer({
        name: '',
        containerType: 'regular_box',
        description: ''
      });
    } catch (error) {
      console.error('Error adding container:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Storage Management</h1>

      {/* Add New Shelf */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add New Shelf</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Shelf Name"
            className="w-full p-2 border rounded"
            value={newShelf.name}
            onChange={(e) => setNewShelf({ ...newShelf, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            className="w-full p-2 border rounded"
            value={newShelf.description}
            onChange={(e) => setNewShelf({ ...newShelf, description: e.target.value })}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleAddShelf}
          >
            Add Shelf
          </button>
        </div>
      </div>

      {/* Add Container to Shelf */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add Container to Shelf</h2>
        <div className="space-y-4">
          <select
            className="w-full p-2 border rounded"
            value={selectedShelf || ''}
            onChange={(e) => setSelectedShelf(Number(e.target.value))}
          >
            <option value="">Select Shelf</option>
            {locations.map(loc => (
              <option key={loc.level1.id} value={loc.level1.id}>
                {loc.level1.name}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Container Name"
            className="w-full p-2 border rounded"
            value={newContainer.name}
            onChange={(e) => setNewContainer({ ...newContainer, name: e.target.value })}
          />
          
          <select
            className="w-full p-2 border rounded"
            value={newContainer.containerType}
            onChange={(e) => setNewContainer({ 
              ...newContainer, 
              containerType: e.target.value as 'regular_box' | 'drawer_organizer'
            })}
          >
            <option value="regular_box">Regular Box</option>
            <option value="drawer_organizer">Drawer Organizer</option>
          </select>
          
          <input
            type="text"
            placeholder="Description (optional)"
            className="w-full p-2 border rounded"
            value={newContainer.description}
            onChange={(e) => setNewContainer({ ...newContainer, description: e.target.value })}
          />
          
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleAddContainer}
          >
            Add Container
          </button>
        </div>
      </div>

      {/* Display Storage Hierarchy */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Storage Hierarchy</h2>
        {locations.map(loc => (
          <div key={loc.level1.id} className="mb-6">
            <h3 className="font-semibold">{loc.level1.name}</h3>
            {loc.level2.map(container => (
              <div key={container.id} className="ml-4 mt-2">
                <div className="flex items-center">
                  <span className="font-medium">{container.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({container.containerType === 'regular_box' ? 'Box' : 'Drawer Organizer'})
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}