import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Classification } from './types';

interface ClassificationResultsProps {
  classification: Classification;
  onReset: () => void;
}

interface StorageOption {
  shelf: string;
  container: string;
  reasoning: string;
}

export default function ClassificationResults({ classification, onReset }: ClassificationResultsProps) {
  const [selectedLocation, setSelectedLocation] = useState<StorageOption | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [storedStatus, setStoredStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Parse the classification if it's a string
  const parsedClassification = typeof classification === 'string' 
    ? JSON.parse(classification) 
    : classification;
    
  useEffect(() => {
    if (parsedClassification.suggested_location) {
      setSelectedLocation(parsedClassification.suggested_location);
    }
  }, [parsedClassification]);

  const handleStoreItem = async () => {
    try {
      setStoredStatus('pending');
      setStatusMessage('Storing item...');

      console.log('Raw classification:', parsedClassification);
      console.log('Properties:', parsedClassification.properties);
      console.log('Selected location before sending:', selectedLocation);

      // Ensure we're sending all the necessary data
      const itemData = {
        category: parsedClassification.category,
        subcategory: parsedClassification.subcategory,
        brand: parsedClassification.properties?.brand,
        model: parsedClassification.properties?.model,
        condition: parsedClassification.properties?.condition,
        selected_location: selectedLocation ? {
          shelf: selectedLocation.shelf,
          container: selectedLocation.container,
          reasoning: selectedLocation.reasoning // Include reasoning for debugging
        } : null,
        raw_properties: parsedClassification.properties
      };

      console.log('Final item data being sent:', itemData);

      const response = await axios.post('http://localhost:5000/api/inventory/items', itemData);

      setStoredStatus('success');
      setStatusMessage('Item successfully stored in the database');
    } catch (error: any) {
      console.error('Storage error:', error);
      setStoredStatus('error');
      setStatusMessage(error.response?.data?.error || 'Error storing item');
    }
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Classification Results</h3>
      
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-lg ${
          storedStatus === 'success' ? 'bg-green-100 text-green-700' :
          storedStatus === 'error' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {statusMessage}
        </div>
      )}

      <div className="space-y-2">
        <div>
          <span className="font-medium">Category:</span> {parsedClassification.category || 'N/A'}
        </div>
        <div>
          <span className="font-medium">Subcategory:</span> {parsedClassification.subcategory || 'N/A'}
        </div>
        <div className="mt-2">
          <span className="font-medium">Properties:</span>
          <ul className="ml-4">
            <li>Brand: {parsedClassification.properties?.brand || 'N/A'}</li>
            <li>Model: {parsedClassification.properties?.model || 'N/A'}</li>
            <li>Condition: {parsedClassification.properties?.condition || 'N/A'}</li>
          </ul>
        </div>
        
        {/* Suggested Location */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Suggested Location:</span>
            {parsedClassification.alternative_locations && (
              <button
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setShowAlternatives(!showAlternatives)}
              >
                {showAlternatives ? 'Hide Alternatives' : 'Show Alternatives'}
              </button>
            )}
          </div>
          
          {/* Current Selection */}
          {selectedLocation && (
            <div className="mt-2 p-2 bg-white rounded border border-blue-200">
              <div>
                <span className="font-medium">Shelf:</span> {selectedLocation.shelf}
              </div>
              <div>
                <span className="font-medium">Container:</span> {selectedLocation.container}
              </div>
              {selectedLocation.reasoning && (
                <div className="mt-1 text-sm text-gray-600">
                  Reasoning: {selectedLocation.reasoning}
                </div>
              )}
            </div>
          )}
          
          {/* Alternative Locations */}
          {showAlternatives && parsedClassification.alternative_locations && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-2">Alternative Locations:</h4>
              <div className="space-y-2">
                {parsedClassification.alternative_locations.map((location: StorageOption, index: number) => (
                  <div 
                    key={index}
                    className="p-2 bg-white rounded border border-gray-200 cursor-pointer hover:border-blue-300"
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div>
                      <span className="font-medium">Shelf:</span> {location.shelf}
                    </div>
                    <div>
                      <span className="font-medium">Container:</span> {location.container}
                    </div>
                    {location.reasoning && (
                      <div className="mt-1 text-sm text-gray-600">
                        Reasoning: {location.reasoning}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-2">
        {storedStatus !== 'success' && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={handleStoreItem}
          >
            Store Item
          </button>
        )}
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          onClick={onReset}
        >
          {storedStatus === 'success' ? 'Register Another Item' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}
