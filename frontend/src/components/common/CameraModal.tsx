// frontend/src/components/common/CameraModal.tsx
'use client'

import React from 'react';
import CameraCapture from '../inventory/CameraCapture';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCapture: (image: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onImageCapture }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Take Picture</h3>
            <button
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Camera Component */}
          <CameraCapture
            onImageCapture={(image) => {
              onImageCapture(image);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
