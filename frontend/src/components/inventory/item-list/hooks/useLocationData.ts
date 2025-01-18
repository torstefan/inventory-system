// frontend/src/components/inventory/item-list/hooks/useLocationData.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useLocationData = () => {
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/storage/level1');
      setAvailableLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  return {
    availableLocations,
    selectedLocation,
    setSelectedLocation,
    refreshLocations: fetchLocations
  };
};
