// frontend/src/components/inventory/item-list/components/ItemDetailsPopover.tsx
import React from 'react';
import { StoredItem } from '@/types/itemTypes';

interface ItemDetailsPopoverProps {
  item: StoredItem;
  position: {
    x: number;
    y: number;
  };
}

export const ItemDetailsPopover: React.FC<ItemDetailsPopoverProps> = ({ item, position }) => {
  return (
    <div 
      className="fixed bg-white rounded-lg shadow-lg border p-4 w-96"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 1000
      }}
    >
      <div className="space-y-4">
        {/* Image */}
        {item.image_path && (
          <img
            src={`http://localhost:5000/static/${item.image_path}`}
            alt={`${item.category} - ${item.brand || ''}`}
            className="w-full h-48 object-contain rounded-lg border"
          />
        )}

        {/* Technical Details */}
        {item.technical_details?.description && (
          <div>
            <h4 className="font-medium text-gray-700">Technical Details:</h4>
            <p className="text-sm text-gray-600">
              {item.technical_details.description}
            </p>
          </div>
        )}

        {/* Use Cases */}
        {item.technical_details?.use_cases?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700">Use Cases:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {item.technical_details.use_cases.map((useCase, index) => (
                <li key={index}>{useCase}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Added Date */}
        <div className="text-xs text-gray-500">
          Added: {new Date(item.date_added).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};
