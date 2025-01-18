// frontend/src/components/inventory/ItemBasicInfo.tsx
import React, { useState, useEffect } from 'react';
import { StoredItem } from '../types/itemTypes';

interface ItemBasicInfoProps {
  item: StoredItem;
}

export default function ItemBasicInfo({ item }: ItemBasicInfoProps) {
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    // Reset image error state when item changes
    setImageError(false);
  }, [item.image_path]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Image failed to load:', item.image_path);
    setImageError(true);
  };

  const renderImageSection = () => {
    if (!item.image_path || imageError) {
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200">
          <span className="text-gray-400">No image</span>
        </div>
      );
    }

    // Construct the full image URL
    const imageUrl = `http://localhost:5000/static/${item.image_path}`;
    console.log('Attempting to load image from:', imageUrl); // Debug log

    return (
      <img
        src={imageUrl}
        alt={`${item.category} - ${item.brand || ''} ${item.model || ''}`}
        className="w-full h-full object-cover rounded-lg border border-gray-200"
        onError={handleImageError}
      />
    );
  };

  console.log('ItemBasicInfo render - image_path:', item.image_path); // Debug log

  return (
    <div className="flex space-x-4">
      {/* Image Display */}
      <div className="w-32 h-32 flex-shrink-0">
        {renderImageSection()}
      </div>

      {/* Item Details */}
      <div className="flex-grow grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <span className="font-medium">Category:</span>
          <div>
            {item.category}
            {item.subcategory && ` / ${item.subcategory}`}
          </div>
        </div>
        <div>
          <span className="font-medium">Brand/Model:</span>
          <div>
            {[item.brand, item.model]
              .filter(Boolean)
              .join(' ') || 'Not specified'}
          </div>
        </div>
        <div>
          <span className="font-medium">Condition:</span>
          <div>{item.condition || 'Not specified'}</div>
        </div>
        <div>
          <span className="font-medium">Location:</span>
          <div>
            {item.location?.shelf && item.location?.container ? (
              `${item.location.shelf} - ${item.location.container}`
            ) : 'No location assigned'}
          </div>
        </div>
      </div>
    </div>
  );
}
