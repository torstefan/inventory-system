// frontend/src/components/inventory/item-list/ItemListContainer.tsx
import React, { useState } from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { DetailedView } from './DetailedView';
import { CompactView } from './CompactView';

const ItemListContainer = () => {
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

  return (
    <div>
      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border bg-white">
          <button
            className={`inline-flex items-center px-3 py-2 rounded-l-lg ${
              viewMode === 'compact'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setViewMode('compact')}
          >
            <LayoutList className="w-5 h-5 mr-1" />
            Compact
          </button>
          <button
            className={`inline-flex items-center px-3 py-2 rounded-r-lg ${
              viewMode === 'detailed'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setViewMode('detailed')}
          >
            <LayoutGrid className="w-5 h-5 mr-1" />
            Detailed
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'compact' ? <CompactView /> : <DetailedView />}
    </div>
  );
};

export default ItemListContainer;
