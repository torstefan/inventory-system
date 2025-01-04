// frontend/src/components/common/CameraModal.tsx
'use client'

import React from 'react';
import CameraCapture from '../inventory/CameraCapture';
import { X } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCapture: (image: string) => void;
}

const CameraModal = ({ isOpen, onClose, onImageCapture }: CameraModalProps) => {
  if (!isOpen) return null;

  const handleImageCapture = (image: string) => {
    onImageCapture(image);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Take Picture</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          <CameraCapture onImageCapture={handleImageCapture} />
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
