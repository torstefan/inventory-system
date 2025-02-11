// frontend/src/app/page.tsx
'use client'

import React, { useState } from 'react';
import InventorySystem from '@/components/inventory/InventorySystem';
import StorageManagement from '@/components/storage/StorageManagement';
import DataManagement from '@/components/DataManagement';
import { ItemList } from '@/components/inventory/item-list';
import QuestionAnswerView from '@/components/inventory/QuestionAnswerView';

export default function Home() {
  const [currentView, setCurrentView] = useState<'list' | 'inventory' | 'storage' | 'data' | 'ask'>('list');

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4 h-14">
            <button
              className={`inline-flex items-center px-4 h-full border-b-2 ${
                currentView === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setCurrentView('list')}
            >
              Items
            </button>
            <button
              className={`inline-flex items-center px-4 h-full border-b-2 ${
                currentView === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setCurrentView('inventory')}
            >
              Register Item
            </button>
            <button
              className={`inline-flex items-center px-4 h-full border-b-2 ${
                currentView === 'storage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setCurrentView('storage')}
            >
              Storage Management
            </button>
            <button
              className={`inline-flex items-center px-4 h-full border-b-2 ${
                currentView === 'data'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setCurrentView('data')}
            >
              Data Management
            </button>
            <button
              className={`inline-flex items-center px-4 h-full border-b-2 ${
                currentView === 'ask'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setCurrentView('ask')}
            >
              Ask Questions
            </button>
          </div>
        </div>
      </nav>

      {/* Content Container */}
      <div className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {currentView === 'list' && <ItemList />}
          {currentView === 'inventory' && <InventorySystem />}
          {currentView === 'storage' && <StorageManagement />}
          {currentView === 'data' && <DataManagement />}
          {currentView === 'ask' && <QuestionAnswerView />}
        </div>
      </div>
    </main>
  );
}
