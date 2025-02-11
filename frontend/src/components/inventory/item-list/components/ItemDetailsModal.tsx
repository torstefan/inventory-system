import React, { useState } from 'react';
import { StoredItem } from '@/types/itemTypes';
import { X, Edit2, Trash2 } from 'lucide-react';
import { ItemBasicInfo, ItemTechnicalDetails } from '../../shared';
import ImagePreview from '@/components/common/ImagePreview';

interface ItemDetailsModalProps {
  item: StoredItem;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: StoredItem) => void;
  onDelete: (id: number) => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [showFullImage, setShowFullImage] = useState(false);

  if (!isOpen) return null;

  const imageUrl = item.image_path ? `http://localhost:5000/static/${item.image_path}` : null;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDelete(item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium">Item Details</h3>
            <button
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Image Section */}
            {imageUrl && (
              <div className="flex justify-center">
                <div 
                  className="relative group cursor-zoom-in"
                  onClick={() => setShowFullImage(true)}
                >
                  <img
                    src={imageUrl}
                    alt={`${item.category} - ${item.brand || ''}`}
                    className="max-h-[300px] object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg" />
                </div>
              </div>
            )}

            <ItemBasicInfo item={item} />
            <ItemTechnicalDetails item={item} />
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                className="flex items-center px-4 py-2 text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100"
                onClick={() => {
                  onEdit(item);
                  onClose();
                }}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                className="flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {imageUrl && (
        <ImagePreview
          imageUrl={imageUrl}
          isOpen={showFullImage}
          onClose={() => setShowFullImage(false)}
        />
      )}
    </div>
  );
}; 