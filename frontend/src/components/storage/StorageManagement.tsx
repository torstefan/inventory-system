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
}

interface EditingState {
  type: 'shelf' | 'container' | null;
  id: number | null;
  data: any;
}

export default function StorageManagement() {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [newShelf, setNewShelf] = useState({ name: '', description: '' });
  const [selectedShelf, setSelectedShelf] = useState<number | null>(null);
  const [newContainer, setNewContainer] = useState({
    name: '',
    containerType: 'regular_box' as const,
    description: ''
  });
  const [editing, setEditing] = useState<EditingState>({
    type: null,
    id: null,
    data: null
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShelves();
  }, []);

  const fetchShelves = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/storage/level1');
      const formattedLocations = Array.isArray(response.data) ? response.data : [];
      setLocations(formattedLocations);
    } catch (error) {
      console.error('Error fetching shelves:', error);
      setError('Error loading shelves');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditShelf = async (shelfId: number) => {
    const shelf = locations.find(loc => loc.level1.id === shelfId);
    if (shelf) {
      setEditing({
        type: 'shelf',
        id: shelfId,
        data: { ...shelf.level1 }
      });
    }
  };

  const handleEditContainer = (shelfId: number, container: any) => {
    setEditing({
      type: 'container',
      id: container.id,
      data: { ...container }
    });
  };

  const handleSaveEdit = async () => {
    try {
      if (!editing.type || !editing.id || !editing.data) return;

      if (editing.type === 'shelf') {
        const response = await axios.put(
          `http://localhost:5000/api/storage/level1/${editing.id}`,
          editing.data
        );
        setLocations(prev => prev.map(loc =>
          loc.level1.id === editing.id
            ? { ...loc, level1: response.data }
            : loc
        ));
      } else {
        const response = await axios.put(
          `http://localhost:5000/api/storage/level2/${editing.id}`,
          editing.data
        );
        setLocations(prev => prev.map(loc => ({
          ...loc,
          level2: loc.level2.map(container =>
            container.id === editing.id ? response.data : container
          )
        })));
      }
      setEditing({ type: null, id: null, data: null });
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error saving changes');
    }
  };

  const handleCancelEdit = () => {
    setEditing({ type: null, id: null, data: null });
  };

  const handleDeleteShelf = async (shelfId: number) => {
    if (window.confirm('Are you sure you want to delete this shelf and all its containers?')) {
      try {
        await axios.delete(`http://localhost:5000/api/storage/level1/${shelfId}`);
        setLocations(prev => prev.filter(loc => loc.level1.id !== shelfId));
      } catch (error: any) {
        setError(error.response?.data?.error || 'Error deleting shelf');
      }
    }
  };

  const handleDeleteContainer = async (containerId: number) => {
    if (window.confirm('Are you sure you want to delete this container?')) {
      try {
        await axios.delete(`http://localhost:5000/api/storage/level2/${containerId}`);
        setLocations(prev => prev.map(loc => ({
          ...loc,
          level2: loc.level2.filter(container => container.id !== containerId)
        })));
      } catch (error: any) {
        setError(error.response?.data?.error || 'Error deleting container');
      }
    }
  };

  // ... existing add methods ...

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p>Loading storage locations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Storage Management</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Add New Shelf Form - existing code ... */}

      {/* Storage Hierarchy */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Storage Hierarchy</h2>
        {locations.length === 0 ? (
          <p className="text-gray-500">No storage locations defined yet.</p>
        ) : (
          locations.map((loc) => (
            <div key={loc.level1.id} className="mb-8 border-b pb-4">
              {/* Shelf Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex-grow">
                  {editing.type === 'shelf' && editing.id === loc.level1.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={editing.data.name}
                        onChange={(e) => setEditing(prev => ({
                          ...prev,
                          data: { ...prev.data, name: e.target.value }
                        }))}
                      />
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={editing.data.description || ''}
                        placeholder="Description"
                        onChange={(e) => setEditing(prev => ({
                          ...prev,
                          data: { ...prev.data, description: e.target.value }
                        }))}
                      />
                      <div className="space-x-2">
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          onClick={handleSaveEdit}
                        >
                          Save
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-lg">{loc.level1.name}</h3>
                      {loc.level1.description && (
                        <p className="text-gray-600 text-sm">{loc.level1.description}</p>
                      )}
                    </>
                  )}
                </div>
                <div className="flex space-x-2">
                  {editing.type === 'shelf' && editing.id === loc.level1.id ? null : (
                    <>
                      <button
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                        onClick={() => handleEditShelf(loc.level1.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                        onClick={() => handleDeleteShelf(loc.level1.id)}
                      >
                        Delete
                      </button>
                      <button
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                        onClick={() => setSelectedShelf(selectedShelf === loc.level1.id ? null : loc.level1.id)}
                      >
                        {selectedShelf === loc.level1.id ? 'Cancel' : 'Add Container'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Containers */}
              <div className="ml-4">
                {loc.level2.map(container => (
                  <div key={container.id} className="mb-2 p-2 bg-gray-50 rounded">
                    {editing.type === 'container' && editing.id === container.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="w-full p-2 border rounded"
                          value={editing.data.name}
                          onChange={(e) => setEditing(prev => ({
                            ...prev,
                            data: { ...prev.data, name: e.target.value }
                          }))}
                        />
                        <select
                          className="w-full p-2 border rounded"
                          value={editing.data.containerType}
                          onChange={(e) => setEditing(prev => ({
                            ...prev,
                            data: { ...prev.data, containerType: e.target.value }
                          }))}
                        >
                          <option value="regular_box">Regular Box</option>
                          <option value="drawer_organizer">Drawer Organizer</option>
                        </select>
                        <input
                          type="text"
                          className="w-full p-2 border rounded"
                          value={editing.data.description || ''}
                          placeholder="Description"
                          onChange={(e) => setEditing(prev => ({
                            ...prev,
                            data: { ...prev.data, description: e.target.value }
                          }))}
                        />
                        <div className="space-x-2">
                          <button
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            onClick={handleSaveEdit}
                          >
                            Save
                          </button>
                          <button
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{container.name}</span>
                          <span className="ml-2 text-sm text-gray-500">
                            ({container.containerType === 'regular_box' ? 'Box' : 'Drawer Organizer'})
                          </span>
                          {container.description && (
                            <p className="text-gray-600 text-sm">{container.description}</p>
                          )}
                        </div>
                        <div className="space-x-2">
                          <button
                            className="px-2 py-1 text-sm bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                            onClick={() => handleEditContainer(loc.level1.id, container)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                            onClick={() => handleDeleteContainer(container.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Container Form - existing code ... */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
