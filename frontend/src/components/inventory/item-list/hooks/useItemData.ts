// frontend/src/components/inventory/item-list/hooks/useItemData.ts
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import { StoredItem } from '@/types/itemTypes';
import { usePersistentSearch } from './usePersistentSearch';

export const useItemData = () => {
  const [items, setItems] = useState<StoredItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StoredItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = usePersistentSearch();

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/inventory/items');
      setItems(response.data.items);
      setFilteredItems(response.data.items);
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error loading items');
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const applyFiltersAndSearch = useCallback((currentItems: StoredItem[], filters: {
    selectedCategories: string[];
    selectedBrands: string[];
    selectedModels: string[];
  }) => {
    let result = [...currentItems];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.category.toLowerCase().includes(query) ||
        (item.subcategory?.toLowerCase().includes(query)) ||
        (item.brand?.toLowerCase().includes(query)) ||
        (item.model?.toLowerCase().includes(query)) ||
        (item.technical_details?.description?.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filters.selectedCategories.length > 0) {
      result = result.filter(item => filters.selectedCategories.includes(item.category));
    }

    // Apply brand filter
    if (filters.selectedBrands.length > 0) {
      result = result.filter(item => {
        const itemBrands = item.brand ? item.brand.split(',').map(b => b.trim()) : [];
        return filters.selectedBrands.every(selectedBrand => 
          selectedBrand === 'Unknown' 
            ? !item.brand || item.brand.trim() === ''
            : itemBrands.includes(selectedBrand)
        );
      });
    }

    // Apply model filter
    if (filters.selectedModels.length > 0) {
      result = result.filter(item => {
        const itemModels = item.model ? item.model.split(',').map(m => m.trim()) : [];
        return filters.selectedModels.every(selectedModel => 
          selectedModel === 'Unknown'
            ? !item.model || item.model.trim() === ''
            : itemModels.includes(selectedModel)
        );
      });
    }

    return result;
  }, [searchQuery]);

  const handleFilters = useCallback(({ selectedCategories, selectedBrands, selectedModels }: {
    selectedCategories: string[];
    selectedBrands: string[];
    selectedModels: string[];
  }) => {
    const filtered = applyFiltersAndSearch(items, {
      selectedCategories,
      selectedBrands,
      selectedModels
    });
    setFilteredItems(filtered);
  }, [items, applyFiltersAndSearch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const filtered = applyFiltersAndSearch(items, {
      selectedCategories: [],
      selectedBrands: [],
      selectedModels: []
    });
    setFilteredItems(filtered);
  }, [items, applyFiltersAndSearch]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/inventory/items/${id}`);
      await fetchItems();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error deleting item');
    }
  };

  return {
    items,
    filteredItems,
    isLoading,
    error,
    searchQuery,
    handleSearch,
    handleFilters,
    handleDelete,
    refreshItems: fetchItems
  };
};
