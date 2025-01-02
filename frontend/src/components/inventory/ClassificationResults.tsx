'use client'

import React from 'react';
import { Classification } from './types';

interface ClassificationResultsProps {
  classification: Classification;
  onReset: () => void;
}

export default function ClassificationResults({ classification, onReset }: ClassificationResultsProps) {
  // Parse the classification if it's a string
  const parsedClassification = typeof classification === 'string' 
    ? JSON.parse(classification) 
    : classification;

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Classification Results</h3>
      <div className="space-y-2">
        <div>
          <span className="font-medium">Category:</span> {parsedClassification.category || 'N/A'}
        </div>
        <div>
          <span className="font-medium">Subcategory:</span> {parsedClassification.subcategory || 'N/A'}
        </div>
        <div className="mt-2">
          <span className="font-medium">Properties:</span>
          <ul className="ml-4">
            <li>Brand: {parsedClassification.properties?.brand || 'N/A'}</li>
            <li>Model: {parsedClassification.properties?.model || 'N/A'}</li>
            <li>Condition: {parsedClassification.properties?.condition || 'N/A'}</li>
          </ul>
        </div>
        <div className="mt-2">
          <span className="font-medium">Suggested Location:</span>
          <ul className="ml-4">
            <li>Shelf: {parsedClassification.suggested_location?.shelf || 'N/A'}</li>
            <li>Box: {parsedClassification.suggested_location?.box || 'N/A'}</li>
          </ul>
        </div>
      </div>
      <div className="mt-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
          onClick={onReset}
        >
          Register Another Item
        </button>
      </div>
    </div>
  );
}