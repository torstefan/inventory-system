import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ItemEditForm } from './shared/ItemEditForm';
import { StorageLocation } from '../../types/storage';

export default function RegisterItem() {
  const [locations, setLocations] = useState<StorageLocation[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/storage/hierarchy');
        setLocations(response.data.shelves || []);
      } catch (error) {
        console.error('Error fetching storage locations:', error);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Register New Item</h1>
      <ItemEditForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        availableLocations={locations}
      />
    </div>
  );
} 