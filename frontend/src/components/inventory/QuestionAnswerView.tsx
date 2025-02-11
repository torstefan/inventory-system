'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Package, Info, MapPin, Clock, Tag, Cpu } from 'lucide-react';
import Link from 'next/link';

interface QAEntry {
  question: string;
  answer: string;
  timestamp: string;
  items?: ItemResponse[];
}

interface ItemResponse {
  item: {
    name: string;
    category: string;
    subcategory: string;
    brand: string;
    model: string;
    technical_details: string;
    use_cases: string[];
    location: string;
    last_modified: string;
  };
}

interface RAGResponse {
  answer: string;
  items: ItemResponse[];
}

// Add interface for structured item data
interface ItemInfo {
  name?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  technicalDetails?: string;
  useCases?: string[];
  location?: string;
  lastModified?: string;
}

// Update the parseItemInfo function to better handle the item name
const parseItemInfo = (answer: string): { text: string; items: ItemInfo[] } => {
  const items: ItemInfo[] = [];
  let introText = '';

  // Get the intro text
  introText = answer.split('- **Item**:')[0].trim();

  // Check if we have a structured item response
  if (answer.includes('**Item**:')) {
    const item: ItemInfo = {};
    
    // Split by asterisk sections and process each part
    const parts = answer.split('**').filter(Boolean);
    parts.forEach((part, index) => {
      const content = parts[index + 1]?.split(':')[1]?.trim();
      if (part.includes('Item:')) item.name = content;
      else if (part.includes('Category:')) item.category = content;
      else if (part.includes('Subcategory:')) item.subcategory = content;
      else if (part.includes('Brand:')) item.brand = content;
      else if (part.includes('Model:')) item.model = content;
      else if (part.includes('Technical Details:')) {
        // Get everything until the next ** or end
        const endIndex = answer.indexOf('**', answer.indexOf(part) + part.length);
        const details = endIndex === -1 
          ? answer.substring(answer.indexOf(part) + part.length)
          : answer.substring(answer.indexOf(part) + part.length, endIndex);
        item.technicalDetails = details.split(':')[1]?.trim();
      }
      else if (part.includes('Location:')) item.location = content;
      else if (part.includes('Last Modified:')) item.lastModified = content;
    });

    // Create a formatted name from category and brand/model
    const formattedName = [
      item.category,
      item.subcategory,
      item.brand !== 'Unknown' && item.brand !== 'Not visible' ? item.brand : null,
      item.model
    ]
      .filter(Boolean)
      .join(' - ');
    
    item.name = formattedName;

    // Extract use cases from the text
    if (answer.includes('used in')) {
      const useCasesText = answer.substring(answer.indexOf('used in'));
      item.useCases = useCasesText
        .split(/,|\./)
        .filter(uc => uc.trim().length > 0 && !uc.includes('Last Modified'))
        .map(uc => uc.trim())
        .filter(uc => uc.toLowerCase() !== 'and');
    }

    if (Object.keys(item).length > 0) {
      items.push(item);
    }
  }

  return { text: introText, items };
};

export const QuestionAnswerView = () => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qaHistory, setQaHistory] = useState<QAEntry[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemInfo | null>(null);
  const [embeddingsStatus, setEmbeddingsStatus] = useState<{
    loaded: boolean;
    count: number;
  } | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  // Check embeddings status on component mount and periodically
  useEffect(() => {
    checkEmbeddingsStatus();
    const interval = setInterval(checkEmbeddingsStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Add state persistence
  useEffect(() => {
    // Load state from sessionStorage when component mounts
    const savedState = sessionStorage.getItem('qaHistory');
    if (savedState) {
      setQaHistory(JSON.parse(savedState));
    }
  }, []);

  // Save state when it changes
  useEffect(() => {
    if (qaHistory.length > 0) {
      sessionStorage.setItem('qaHistory', JSON.stringify(qaHistory));
    }
  }, [qaHistory]);

  const checkEmbeddingsStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/rag/embeddings/status');
      setEmbeddingsStatus(response.data);
      setError(null);
    } catch (error: any) {
      console.error('Error checking embeddings status:', error);
      setEmbeddingsStatus({ loaded: false, count: 0 });
      setError(error.response?.data?.message || 'Failed to check embeddings status');
    }
  };

  const handleReloadEmbeddings = async () => {
    setIsReloading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/rag/embeddings/reload');
      await checkEmbeddingsStatus();
      setError(null);
    } catch (error: any) {
      console.error('Error reloading embeddings:', error);
      setError(error.response?.data?.message || 'Failed to reload embeddings');
      setEmbeddingsStatus({ loaded: false, count: 0 });
    } finally {
      setIsReloading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<RAGResponse>('http://localhost:5000/api/rag/query', {
        query: question
      });

      console.log('RAG Response:', response.data);
      console.log('Items found:', response.data.items?.length || 0);

      // Create a new QA entry with the response
      const newEntry: QAEntry = {
        question,
        answer: response.data.answer,
        timestamp: new Date().toISOString(),
        items: response.data.items
      };

      console.log('New QA Entry:', newEntry);
      setQaHistory(prev => [newEntry, ...prev]);
      setQuestion('');
    } catch (error: any) {
      console.error('Error querying RAG:', error);
      setError(error.response?.data?.message || 'Failed to get an answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItemCard = (item: any) => {
    const details = item.details || {};
    const itemId = item.item_id;
    
    return (
      <div key={itemId} className="bg-white p-4 rounded-lg shadow mb-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <h3 className="text-lg font-semibold">
              {details.category || 'Unknown Category'}
            </h3>
            {item.relevance && (
              <p className="text-sm text-gray-600 mt-1">
                {item.relevance}
              </p>
            )}
          </div>
          {/* Add View Item button */}
          <Link 
            href={`/inventory/items/${itemId}?from=qa`}  // Add a query parameter
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            View Item
          </Link>
        </div>

        <div className="mt-4 space-y-2">
          {details.location && (
            <p className="text-sm">
              <span className="font-medium">Location:</span>{' '}
              <a 
                href={`/storage/${encodeURIComponent(details.location.split(' - ')[0])}`}
                className="text-blue-500 hover:underline"
              >
                {details.location}
              </a>
            </p>
          )}
          {details.technical_info && (
            <p className="text-sm">
              <span className="font-medium">Technical Details:</span> {details.technical_info}
            </p>
          )}
          {item.item_id && (
            <p className="text-xs text-gray-500 mt-2">
              Item ID: {item.item_id}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderQAEntry = (entry: any) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Q: {entry.question}</h3>
          <p className="mt-2 text-gray-600">A: {entry.answer}</p>
        </div>

        {entry.items && entry.items.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Related Items:</h4>
            {entry.items.map((item: any) => renderItemCard(item))}
          </div>
        )}
      </div>
    );
  };

  // Add a modal to show full item details
  const renderItemModal = () => {
    if (!selectedItem) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={() => setSelectedItem(null)}
        />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">
                {selectedItem?.name || [selectedItem?.brand, selectedItem?.model].filter(Boolean).join(' ') || 'Unnamed Item'}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setSelectedItem(null)}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-6">
              {/* Category & Subcategory */}
              {(selectedItem?.category || selectedItem?.subcategory) && (
                <div className="flex items-start gap-2">
                  <Tag className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <div className="font-medium">Category</div>
                    <div className="text-gray-600">
                      {selectedItem.category}
                      {selectedItem.subcategory && (
                        <span className="text-gray-400"> / {selectedItem.subcategory}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {selectedItem?.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-gray-600">{selectedItem.location}</div>
                  </div>
                </div>
              )}

              {/* Technical Details */}
              {selectedItem?.technical_details && (
                <div className="flex items-start gap-2">
                  <Cpu className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <div className="font-medium">Technical Details</div>
                    <div className="text-gray-600">{selectedItem.technical_details}</div>
                  </div>
                </div>
              )}

              {/* Use Cases */}
              {selectedItem?.use_cases && selectedItem.use_cases.length > 0 && (
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <div className="font-medium">Use Cases</div>
                    <ul className="list-disc list-inside text-gray-600">
                      {selectedItem.use_cases.map((useCase, index) => (
                        <li key={index}>{useCase}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Last Modified */}
              {selectedItem?.last_modified && (
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-6">
                  <Clock className="h-4 w-4" />
                  Last modified: {selectedItem.last_modified}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Ask About Your Inventory</h2>
            <p className="text-gray-600">
              Ask questions about your inventory items, their locations, or technical details.
            </p>
          </div>
          
          {/* More subtle Embeddings Status */}
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                Embeddings: {embeddingsStatus?.loaded ? (
                  <span className="text-green-500">Loaded ({embeddingsStatus.count} items)</span>
                ) : (
                  <span className="text-red-400">Not Loaded</span>
                )}
              </span>
              <button
                onClick={handleReloadEmbeddings}
                disabled={isReloading}
                className={`text-xs px-2 py-0.5 rounded ${
                  isReloading 
                    ? 'text-gray-400' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isReloading ? (
                  <div className="flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  'Reload'
                )}
              </button>
            </div>
            {isReloading && (
              <p className="text-xs text-gray-400 mt-1">
                This may take a few moments...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Question Input */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Where are all the microcontrollers stored? What servo motors do we have?"
            className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-600 disabled:text-gray-400"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-600 rounded-lg flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Thinking...
        </div>
      )}

      {/* Q&A History */}
      <div className="space-y-6">
        {qaHistory.map((qa, index) => (
          <div key={index}>{renderQAEntry(qa)}</div>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && qaHistory.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No questions asked yet. Try asking something about your inventory!
        </div>
      )}

      {/* Add the modal */}
      {renderItemModal()}
    </div>
  );
};

export default QuestionAnswerView; 