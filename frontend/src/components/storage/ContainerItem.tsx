'use client'

import React from 'react';
import { ContainerData, EditingState } from './types';

interface ContainerItemProps {
  container: ContainerData;
  editing: EditingState;
  onEdit: (shelfId: number, container: ContainerData) => void;
  onDelete: (containerId: number) => void;
  onSave: () => void;
  onCancel: () => void;
  setEditing: (editing: EditingState) => void;
  shelfId: number;
}

export default function ContainerItem({
  container,
  editing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  setEditing,
  shelfId,
}: ContainerItemProps) {
  const isEditing = editing.type === 'container' && editing.id === container.id;

  if (isEditing) {
    return (
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
        <select
          className="w-full p-2 border rounded"
          value={editing.data.containerType}
          onChange={(e) => setEditing({
            ...editing,
            data: { ...editing.data, containerType: e.target.value }
          })}
        >
          <option value="regular_box">Regular Box</option>
          <option value="drawer_organizer">Drawer Organizer</option>
        </select>
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
            onClick={onSave}
          >
            Save
          </button>
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="font-medium">{container.name}</span>
        <span className="ml-2 text-sm text-gray-500">
          ({container.containerType === 'regular_box' ? 'Box' : 'Drawer Organizer'})
        </span>
        {container.description && (
          <p className="text-gray-600 text-sm">{container.description}</p>
        )}
      </div>
      <div className="space-x-2">
        <button
          className="px-2 py-1 text-sm bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
          onClick={() => onEdit(shelfId, container)}
        >
          Edit
        </button>
        <button
          className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
          onClick={() => onDelete(container.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
