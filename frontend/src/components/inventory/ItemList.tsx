import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface StoredItem {
  id: number;
  category: string;
  subcategory: string | null;
  brand: string | null;
  model: string | null;
  condition: string | null;
  location: {
    shelf: string | null;
    container: string | null;
  };
  image_path: string | null;
  date_added: string;
  last_modified: string;
}

export default function ItemList() {
  const [items, setItems] = useState<StoredItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
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

  if (isLoading) {
    return <div className="p-4">Loading items...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-4 text-gray-500">
        No items in inventory yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Inventory Items</h2>
      <div className="grid gap-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-lg shadow p-4"
          >
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
                  {item.brand || item.model ? 
                    [item.brand, item.model]
                      .filter(Boolean)
                      .join(' ')
                    : 'Not specified'}
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
                  ) : item.location?.shelf ? (
                    item.location.shelf
                  ) : item.location?.container ? (
                    item.location.container
                  ) : (
                    'No location assigned'
                  )}
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Added: {new Date(item.date_added).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
