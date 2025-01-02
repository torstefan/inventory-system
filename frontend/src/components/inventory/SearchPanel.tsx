'use client'

import React, { useState } from 'react';

export default function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-4">
      <input
        type="text"
        className="w-full p-2 border rounded-lg"
        placeholder="Search items..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
