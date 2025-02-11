import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 transition-opacity cursor-pointer flex items-center justify-center"
      onClick={onClose}
    >
      {/* Modal */}
      <div className="p-4">
        <div className="relative">
          {/* Close button - optional now since clicking anywhere closes */}
          <button
            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-75"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image */}
          <img
            src={imageUrl}
            alt="Full size preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePreview; 