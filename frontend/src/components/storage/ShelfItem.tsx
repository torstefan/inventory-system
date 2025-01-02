'use client'

import React from 'react';
import { StorageLocation, EditingState } from './types';
import ContainerItem from './ContainerItem';
import AddContainerForm from './AddContainerForm';

interface ShelfItemProps {
  loc: StorageLocation;
  editing: EditingState;
  selectedShelf: number | null;
  onEditShelf: (shelfId: number) => void;
  onDeleteShelf: (shelfId: number) => void;
  onEditContainer: (shelfId: number, container: any) => void;
  onDeleteContainer: (containerId: number) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  setEditing: (editing: EditingState) => void;
  setSelectedShelf: (shelfId: number | null) => void;
  onContainerSuccess: (container: any) => void;
}

export default function ShelfItem({
  loc,
  editing,
  selectedShelf,
  onEditShelf,
  onDeleteShelf,
  onEditContainer,
  onDeleteContainer,
  onSaveEdit,
  onCancelEdit,
  setEditing,
  setSelectedShelf,
  onContainerSuccess
}: ShelfItemProps) {
  return (
    <div className="mb-8 border-b pb-4">
      {/* Shelf Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-grow">
          {editing.type === 'shelf' && editing.id === loc.level1.id ? (
            <div className="space-y-2">
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={editing.data.name}
                onChange={(e) => setEditing({
                  ...editing,
                  data: { ...editing.data, name: e.target.value }
                })}
              />
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={editing.data.description || ''}
                placeholder="Description"
                onChange={(e) => setEditing({
                  ...editing,
                  data: { ...editing.data, description: e.target.value }
                })}
              />
              <div className="space-x-2">
                <button
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={onSaveEdit}
                >
                  Save
                </button>
                <button
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  onClick={onCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-lg">{loc.level1.name}</h3>
              {loc.level1.description && (
                <p className="text-gray-600 text-sm">{loc.level1.description}</p>
              )}
            </>
          )}
        </div>
        <div className="flex space-x-2">
          {editing.type === 'shelf' && editing.id === loc.level1.id ? null : (
            <>
              <button
                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                onClick={() => onEditShelf(loc.level1.id)}
              >
                Edit
              </button>
              <button
                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                onClick={() => onDeleteShelf(loc.level1.id)}
              >
                Delete
              </button>
              <button
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                onClick={() => setSelectedShelf(selectedShelf === loc.level1.id ? null : loc.level1.id)}
              >
                {selectedShelf === loc.level1.id ? 'Cancel' : 'Add Container'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Containers */}
      <div className="ml-4">
        {loc.level2.map(container => (
          <div key={container.id} className="mb-2 p-2 bg-gray-50 rounded">
            <ContainerItem
              container={container}
              editing={editing}
              onEdit={onEditContainer}
              onDelete={onDeleteContainer}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              setEditing={setEditing}
              shelfId={loc.level1.id}
            />
          </div>
        ))}
      </div>

      {/* Add Container Form */}
      {selectedShelf === loc.level1.id && (
        <AddContainerForm 
          shelfId={loc.level1.id}
          onSuccess={onContainerSuccess}
          onCancel={() => setSelectedShelf(null)}
        />
      )}
    </div>
  );
}
