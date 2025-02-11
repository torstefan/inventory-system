// frontend/src/app/page.tsx
'use client'

import React from 'react';
import InventorySystem from '@/components/inventory/InventorySystem';
import StorageManagement from '@/components/storage/StorageManagement';
import DataManagement from '@/components/DataManagement';
import { ItemList } from '@/components/inventory/item-list';
import QuestionAnswerView from '@/components/inventory/QuestionAnswerView';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get('tab') || 'inventory';

  const navigateToTab = (tab: string) => {
    router.push(`/?tab=${tab}`);
  };

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4 h-14">
            <button
              className={`inline-flex items-center px-4 h-full border-b-2 ${
                currentTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => navigateToTab('list')}
            >
              Items
            </button>
            <button
              className={`inline-flex items-center px-4 h-full border-b-2 ${
                currentTab === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => navigateToTab('inventory')}
            >
              Register Item
            </button>
            <button
              className={`inline-flex items-center px-4 h-full border-b-2 ${
                currentTab === 'storage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => navigateToTab('storage')}
            >
              Storage Management
            </button>
            <button
              className={`inline-flex items-center px-4 h-full border-b-2 ${
                currentTab === 'data'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => navigateToTab('data')}
            >
              Data Management
            </button>
            <button
              className={`inline-flex items-center px-4 h-full border-b-2 ${
                currentTab === 'qa'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => navigateToTab('qa')}
            >
              Ask Questions
            </button>
          </div>
        </div>
      </nav>

      {/* Content Container */}
      <div className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {currentTab === 'list' && <ItemList />}
          {currentTab === 'inventory' && <InventorySystem />}
          {currentTab === 'storage' && <StorageManagement />}
          {currentTab === 'data' && <DataManagement />}
          {currentTab === 'qa' && <QuestionAnswerView />}
        </div>
      </div>
    </main>
  );
}
