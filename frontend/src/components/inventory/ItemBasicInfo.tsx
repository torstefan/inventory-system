// components/inventory/ItemBasicInfo.tsx
import React from 'react';
import { StoredItem } from '../types/itemTypes';

interface ItemBasicInfoProps {
  item: StoredItem;
}

export default function ItemBasicInfo({ item }: ItemBasicInfoProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
  );
}
