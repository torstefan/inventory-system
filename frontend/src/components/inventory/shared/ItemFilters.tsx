// frontend/src/components/inventory/ItemFilters.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { StoredItem } from '../types/itemTypes';

interface FilterOptions {
  categories: Set<string>;
  subcategories: Set<string>;
  brands: Set<string>;
  models: Set<string>;
}

interface ItemFiltersProps {
  items: StoredItem[];
  onFilterChange: (filters: {
    selectedCategories: string[];
    selectedBrands: string[];
    selectedModels: string[];
  }) => void;
}

export default function ItemFilters({ items, onFilterChange }: ItemFiltersProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: new Set(),
    subcategories: new Set(),
    brands: new Set(),
    models: new Set(),
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('inventory-filters-expanded');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Extract unique values for filter options when items change
  useEffect(() => {
    const options: FilterOptions = {
      categories: new Set(),
      subcategories: new Set(),
      brands: new Set(),
      models: new Set(),
    };

    items.forEach(item => {
      if (item.category) options.categories.add(item.category);
      if (item.subcategory) options.subcategories.add(item.subcategory);
      if (item.brand) options.brands.add(item.brand);
      if (item.model) options.models.add(item.model);
    });

    setFilterOptions(options);
  }, [items]);

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
    onFilterChange({
      selectedCategories: newCategories,
      selectedBrands: selectedBrands,
      selectedModels: selectedModels
    });
  };

  const handleBrandChange = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newBrands);
    onFilterChange({
      selectedCategories,
      selectedBrands: newBrands,
      selectedModels: selectedModels
    });
  };

  const handleModelChange = (model: string) => {
    const newModels = selectedModels.includes(model)
      ? selectedModels.filter(m => m !== model)
      : [...selectedModels, model];
    setSelectedModels(newModels);
    onFilterChange({
      selectedCategories,
      selectedBrands,
      selectedModels: newModels
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedModels([]);
    onFilterChange({
      selectedCategories: [],
      selectedBrands: [],
      selectedModels: []
    });
  };

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('inventory-filters-expanded', JSON.stringify(newState));
  };

  return (
    <div className="bg-white rounded-lg shadow mb-4">
      <div 
        className="p-4 border-b flex justify-between items-center cursor-pointer"
        onClick={toggleExpanded}
      >
        <h3 className="text-lg font-medium">Filters</h3>
        <div className="flex items-center space-x-2">
          {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedModels.length > 0) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          )}
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Categories */}
          {filterOptions.categories.size > 0 && (
            <div>
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(filterOptions.categories).map(category => (
                  <label
                    key={category}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm cursor-pointer
                      ${selectedCategories.includes(category)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Brands */}
          {filterOptions.brands.size > 0 && (
            <div>
              <h4 className="font-medium mb-2">Brands</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(filterOptions.brands).map(brand => (
                  <label
                    key={brand}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm cursor-pointer
                      ${selectedBrands.includes(brand)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Models */}
          {filterOptions.models.size > 0 && (
            <div>
              <h4 className="font-medium mb-2">Models</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(filterOptions.models).map(model => (
                  <label
                    key={model}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm cursor-pointer
                      ${selectedModels.includes(model)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedModels.includes(model)}
                      onChange={() => handleModelChange(model)}
                    />
                    {model}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
