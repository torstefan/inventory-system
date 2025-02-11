'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, MapPin, Tag, Clock, Info, List, ArrowLeft } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

interface TechnicalDetails {
  description?: string;
  use_cases?: string[];
}

interface ItemDetails {
  id: number;
  category: string;
  subcategory?: string;
  brand: string;
  model: string;
  condition: string;
  technical_details: TechnicalDetails;
  image_path?: string;
  storage: {
    shelf?: { name: string };
    container?: { name: string };
  };
  date_added: string;
  last_modified: string;
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const fromQA = searchParams.get('from') === 'qa';
  
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/inventory/items/${encodeURIComponent(id)}`);
        setItem(response.data);
      } catch (error: any) {
        console.error('Error fetching item:', error);
        setError(error.response?.data?.error || 'Failed to load item details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  const handleBack = () => {
    if (fromQA) {
      router.push('/?tab=qa');  // Return to the QA tab
    } else {
      router.push('/');  // Return to the main inventory view
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
        <button 
          onClick={handleBack}
          className="mt-4 text-blue-500 hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {fromQA ? 'Search Results' : 'Inventory'}
        </button>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {[item.brand, item.model].filter(Boolean).join(' ')}
            </h1>
            <p className="text-gray-600">
              {[item.category, item.subcategory].filter(Boolean).join(' › ')}
            </p>
          </div>
          <button 
            onClick={handleBack}
            className="text-blue-500 hover:underline flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {fromQA ? 'Search Results' : 'Inventory'}
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Technical Details */}
          {item.technical_details && (
            <div className="col-span-2">
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="h-5 w-5" />
                Technical Details
              </h2>
              {item.technical_details.description && (
                <p className="text-gray-600 mb-4">{item.technical_details.description}</p>
              )}
              {item.technical_details.use_cases && item.technical_details.use_cases.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Use Cases
                  </h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {item.technical_details.use_cases.map((useCase, index) => (
                      <li key={index}>{useCase}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          {item.storage && (
            <div>
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Storage Location
              </h2>
              <p className="text-gray-600">
                {item.storage.shelf?.name}
                {item.storage.container && ` › ${item.storage.container.name}`}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="text-sm text-gray-500 col-span-2 pt-4 mt-4 border-t">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Added: {new Date(item.date_added).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Last Modified: {new Date(item.last_modified).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 