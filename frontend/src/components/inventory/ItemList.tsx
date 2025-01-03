import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface StoredItem {
  id: number;
  category: string;
  subcategory: string | null;
  brand: string | null;
  model: string | null;
  condition: string | null;
  technical_description: string | null;
  use_cases: string[] | null;
  location: {
    shelf: string | null;
    container: string | null;
  };
  image_path: string | null;
  date_added: string;
  last_modified: string;
}

interface EditingItem {
  id: number;
  data: Partial<StoredItem>;
}

export default function ItemList() {
  const [items, setItems] = useState<StoredItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  useEffect(() => {
    fetchItems();
    fetchLocations();
  }, []);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/inventory/items');
      setItems(response.data.items);
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error loading items');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/storage/level1');
      setAvailableLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const toggleItemExpansion = (itemId: number) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleEdit = (item: StoredItem) => {
    setEditingItem({
      id: item.id,
      data: {
        ...item,
        selected_location: item.location ? {
          shelf: item.location.shelf,
          container: item.location.container
        } : null
      }
    });
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      const updateData = {
        category: editingItem.data.category,
        subcategory: editingItem.data.subcategory,
        brand: editingItem.data.brand,
        model: editingItem.data.model,
        condition: editingItem.data.condition,
        technical_description: editingItem.data.technical_description,
        use_cases: editingItem.data.use_cases,
        selected_location: editingItem.data.selected_location
      };
      
      await axios.put(
        `http://localhost:5000/api/inventory/items/${editingItem.id}`, 
        updateData
      );
      
      setEditingItem(null);
      await fetchItems();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error updating item');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/inventory/items/${id}`);
      fetchItems();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error deleting item');
    }
  };

  if (isLoading) return <div className="p-4">Loading items...</div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  if (items.length === 0) return <div className="p-4 text-gray-500">No items in inventory yet.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Inventory Items</h2>
      <div className="grid gap-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-lg shadow p-4"
          >
            {editingItem?.id === item.id ? (
              // Edit form
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      value={editingItem.data.category || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, category: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subcategory</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      value={editingItem.data.subcategory || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, subcategory: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brand</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      value={editingItem.data.brand || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, brand: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Model</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      value={editingItem.data.model || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, model: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Condition</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      value={editingItem.data.condition || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, condition: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      value={selectedLocation}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedLocation(value);
                        
                        if (!value) {
                          setEditingItem(prev => prev ? {
                            ...prev,
                            data: {
                              ...prev.data,
                              selected_location: null
                            }
                          } : null);
                          return;
                        }

                        const [shelf, container] = value.split('|||');
                        
                        if (!editingItem) return;
                        
                        setEditingItem({
                          ...editingItem,
                          data: {
                            ...editingItem.data,
                            selected_location: { shelf, container }
                          }
                        });
                      }}
                    >
                      <option value="">Select location</option>
                      {availableLocations.map((loc) => 
                        loc.level2.map((container: any) => {
                          const value = `${loc.level1.name}|||${container.name}`;
                          return (
                            <option 
                              key={value}
                              value={value}
                            >
                              {`${loc.level1.name} - ${container.name}`}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Technical Description</label>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      rows={3}
                      value={editingItem.data.technical_description || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, technical_description: e.target.value }
                      })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Use Cases (one per line)</label>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      rows={3}
                      value={editingItem.data.use_cases?.join('\n') || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { 
                          ...editingItem.data, 
                          use_cases: e.target.value.split('\n').filter(line => line.trim()) 
                        }
                      })}
                      placeholder="Enter each use case on a new line"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    onClick={() => setEditingItem(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              // Display view
              <>
                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="font-medium">Category:</span>
                      <div>
                        {item.category}
                        {item.subcategory && ` / ${item.subcategory}`}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Brand/Model:</span>
                      <div>
                        {[item.brand, item.model]
                          .filter(Boolean)
                          .join(' ') || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Condition:</span>
                      <div>{item.condition || 'Not specified'}</div>
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>
                      <div>
                        {item.location?.shelf && item.location?.container ? (
                          `${item.location.shelf} - ${item.location.container}`
                        ) : 'No location assigned'}
                      </div>
                    </div>
                  </div>

                  {/* Technical Details (Expandable) */}
                  <div className="border-t pt-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => toggleItemExpansion(item.id)}
                    >
                      {expandedItems.includes(item.id) ? 'Hide Details' : 'Show Details'}
                    </button>
                    
                    {expandedItems.includes(item.id) && (
                      <div className="mt-2 space-y-2">
                        {item.technical_description && (
                          <div>
                            <span className="font-medium">Technical Description:</span>
                            <p className="mt-1 text-gray-700">
                              {item.technical_description}
                            </p>
                          </div>
                        )}
                        
                        {item.use_cases && item.use_cases.length > 0 && (
                          <div>
                            <span className="font-medium">Use Cases:</span>
                            <ul className="mt-1 list-disc list-inside">
                              {item.use_cases.map((useCase, index) => (
                                <li key={index} className="text-gray-700 ml-4">
                                  {useCase}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2">
                    <button
                      className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {/* Metadata */}
                <div className="mt-2 text-sm text-gray-500">
                  Added: {new Date(item.date_added).toLocaleDateString()}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
