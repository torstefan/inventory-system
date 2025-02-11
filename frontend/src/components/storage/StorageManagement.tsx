'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StorageLocation, EditingState } from './types';
import ShelfItem from './ShelfItem';
import { logger } from '../../utils/logger';

export default function StorageManagement() {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [newShelf, setNewShelf] = useState({ name: '', description: '' });
  const [selectedShelf, setSelectedShelf] = useState<number | null>(null);
  const [editing, setEditing] = useState<EditingState>({
    type: null,
    id: null,
    data: null
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingShelf, setIsAddingShelf] = useState(false);

  useEffect(() => {
    fetchShelves();
  }, []);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/init-storage');
        
        if (response.status !== 200 && response.status !== 201) {
          console.error('Initialization failed:', response.data);
          throw new Error('Failed to initialize storage');
        }
        
        await fetchShelves();
      } catch (error) {
        console.error('Error initializing storage:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 200 && error.response?.data?.message === 'Storage already initialized') {
            await fetchShelves();
            return;
          }
          setError(error.response?.data?.message || 'Failed to initialize storage. Please try again.');
        } else {
          setError('Failed to initialize storage. Please try again.');
        }
      }
    };

    if (!locations || locations.length === 0) {
      initializeStorage();
    }
  }, []);

  const fetchShelves = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/storage/hierarchy');
      const formattedLocations = response.data.shelves || [];
      setLocations(formattedLocations);
      console.log('Fetched locations:', formattedLocations);
    } catch (error) {
      console.error('Error fetching shelves:', error);
      setError('Error loading shelves');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditShelf = async (shelfId: number) => {
    try {
      const shelf = locations.find(loc => loc.level1.id === shelfId);
      if (shelf) {
        setEditing({
          type: 'shelf',
          id: shelfId,
          data: { ...shelf.level1 }
        });
      } else {
        console.error('Shelf not found:', shelfId);
        setError('Could not find shelf to edit');
      }
    } catch (error) {
      console.error('Error setting up shelf edit:', error);
      setError('Error preparing shelf edit');
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

      const endpoint = editing.type === 'shelf' 
        ? `http://localhost:5000/api/storage/level1/${editing.id}`
        : `http://localhost:5000/api/storage/level2/${editing.id}`;

      const response = await axios.put(endpoint, editing.data);
      
      if (editing.type === 'shelf') {
        setLocations(prev => prev.map(loc =>
          loc.level1.id === editing.id
            ? { ...loc, level1: response.data }
            : loc
        ));
      } else {
        setLocations(prev => prev.map(loc => ({
          ...loc,
          level2: loc.level2.map(container =>
            container.id === editing.id ? response.data : container
          )
        })));
      }
      
      setEditing({ type: null, id: null, data: null });
      setError(null);
    } catch (error) {
      console.error('Error saving edit:', error);
      setError('Failed to save changes. Please try again.');
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

  const handleAddShelf = async () => {
    try {
      if (!newShelf.name.trim()) {
        setError('Shelf name is required');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/storage/level1', newShelf);
      setLocations(prev => [...prev, { level1: response.data, level2: [] }]);
      setNewShelf({ name: '', description: '' });
      setIsAddingShelf(false);
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error adding shelf');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p>Loading storage locations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Storage Management</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setIsAddingShelf(true)}
        >
          Add Shelf
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isAddingShelf && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Add New Shelf</h2>
          <div className="space-y-2">
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Shelf Name"
              value={newShelf.name}
              onChange={(e) => setNewShelf(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Description (optional)"
              value={newShelf.description}
              onChange={(e) => setNewShelf(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => {
                  setIsAddingShelf(false);
                  setNewShelf({ name: '', description: '' });
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleAddShelf}
              >
                Add Shelf
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Hierarchy */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Storage Hierarchy - Shelves</h2>
        {locations.length === 0 ? (
          <p className="text-gray-500">No storage locations defined yet.</p>
        ) : (
          locations.map((loc) => (
            <ShelfItem
              key={loc.level1.id}
              loc={loc}
              editing={editing}
              selectedShelf={selectedShelf}
              onEditShelf={handleEditShelf}
              onDeleteShelf={handleDeleteShelf}
              onEditContainer={handleEditContainer}
              onDeleteContainer={handleDeleteContainer}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              setEditing={setEditing}
              setSelectedShelf={setSelectedShelf}
              onContainerSuccess={(newContainer) => {
                setLocations(prev => prev.map(l => 
                  l.level1.id === loc.level1.id 
                    ? { ...l, level2: [...l.level2, newContainer] }
                    : l
                ));
                setSelectedShelf(null);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
