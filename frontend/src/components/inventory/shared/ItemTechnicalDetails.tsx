// components/inventory/ItemTechnicalDetails.tsx
import React from 'react';
import { StoredItem } from '../types/itemTypes';

interface ItemTechnicalDetailsProps {
  item: StoredItem;
}

export default function ItemTechnicalDetails({ item }: ItemTechnicalDetailsProps) {
  console.log('Technical Details for item:', item);  // Debug log

  // Get description from either location
  const description = item.technical_details?.description || item.technical_description;
  
  // Get use cases from either location
  const useCases = item.technical_details?.use_cases || item.use_cases || [];

  // Only render if we have content to show
  if (!description && useCases.length === 0) {
    return <div className="mt-2 text-gray-500">No technical details available</div>;
  }

  return (
    <div className="mt-2 space-y-4 bg-gray-50 p-4 rounded-lg">
      {/* Technical Description */}
      {description && (
        <div>
          <h4 className="font-medium text-gray-700">Technical Description:</h4>
          <p className="mt-1 text-gray-600">
            {description}
          </p>
        </div>
      )}
      
      {/* Use Cases */}
      {useCases && useCases.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700">Use Cases:</h4>
          <ul className="mt-1 list-disc list-inside">
            {useCases.map((useCase, index) => (
              <li key={index} className="text-gray-600 ml-4">
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}