'use client'

import React, { useState } from 'react';
import axios from 'axios';
import CameraCapture from '@/components/inventory/CameraCapture';
import ClassificationResults from '@/components/inventory/ClassificationResults';
import SearchPanel from '@/components/inventory/SearchPanel';
import ItemList from './ItemList';
import { Classification } from './types';

export default function InventorySystem() {
  const [mode, setMode] = useState<'register' | 'search' | 'list'>('register');
  const [inputMethod, setInputMethod] = useState<'text' | 'image'>('text');
  const [itemDescription, setItemDescription] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [classificationResult, setClassificationResult] = useState<Classification | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
  };

  const handleTextSubmit = async () => {
    if (!itemDescription.trim()) {
      setError('Please provide a description of the item');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/text/process', {
        description: itemDescription
      });
      
      console.log('Classification result:', response.data);
      setClassificationResult(response.data.classification);
    } catch (error: any) {
      console.error('Text processing error:', error);
      setError(error.response?.data?.error || 'Error processing text description');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('image', blob, 'item.jpg');
      
      const result = await axios.post('http://localhost:5000/api/images/upload', formData);
      console.log('Classification result:', result.data);
      setClassificationResult(result.data.classification);
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Error uploading image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setClassificationResult(null);
    setCapturedImage(null);
    setItemDescription('');
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Mode Selection */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            mode === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setMode('register')}
        >
          Register Item
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            mode === 'search' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setMode('search')}
        >
          Search
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            mode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setMode('list')}
        >
          View All Items
        </button>
      </div>

      {/* Register Mode */}
      {mode === 'register' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              className={`p-4 rounded-lg ${
                inputMethod === 'text' ? 'bg-blue-100' : 'bg-gray-100'
              }`}
              onClick={() => setInputMethod('text')}
            >
              Text
            </button>
            <button
              className={`p-4 rounded-lg ${
                inputMethod === 'image' ? 'bg-blue-100' : 'bg-gray-100'
              }`}
              onClick={() => setInputMethod('image')}
            >
              Camera
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {inputMethod === 'text' && !classificationResult && (
            <div className="space-y-4">
              <textarea
                className="w-full p-2 border rounded-lg h-32"
                placeholder="Describe the item in detail (e.g., A new Raspberry Pi 4 Model B with 8GB RAM, still in its original packaging)..."
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
              />
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
                onClick={handleTextSubmit}
                disabled={isProcessing || !itemDescription.trim()}
              >
                {isProcessing ? 'Processing...' : 'Process Description'}
              </button>
            </div>
          )}

          {inputMethod === 'image' && !capturedImage && (
            <CameraCapture onImageCapture={handleImageCapture} />
          )}

          {capturedImage && !classificationResult && (
            <div>
              <img 
                src={capturedImage} 
                alt="Captured item" 
                className="w-full rounded-lg"
              />
              <div className="flex gap-4 mt-4">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                  onClick={() => setCapturedImage(null)}
                >
                  Retake
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
                  onClick={handleImageUpload}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Process Image'}
                </button>
              </div>
            </div>
          )}

          {classificationResult && (
            <ClassificationResults 
              classification={classificationResult}
              onReset={handleReset}
            />
          )}
        </div>
      )}

      {/* Search Mode */}
      {mode === 'search' && <SearchPanel />}

      {/* List Mode */}
      {mode === 'list' && <ItemList />}
    </div>
  );
}
