// frontend/src/components/DataManagement.tsx
'use client'

import React, { useState } from 'react';
import axios from 'axios';

export default function DataManagement() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      setSuccess(null);

      const response = await axios.post(
        'http://localhost:5000/api/data/backup',
        {},
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.setAttribute('download', `inventory_backup_${timestamp}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Backup exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export backup. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setError(null);
      setSuccess(null);

      // Confirm restore
      if (!window.confirm(
        'Warning: This will replace all existing data with the backup data. ' +
        'This action cannot be undone. Continue?'
      )) {
        return;
      }

      const formData = new FormData();
      formData.append('backup', file);

      await axios.post('http://localhost:5000/api/data/restore', formData);
      setSuccess('Backup restored successfully! Please refresh the page.');

      // Clear the file input
      event.target.value = '';
    } catch (err) {
      console.error('Import error:', err);
      setError('Failed to restore backup. Please ensure the file is valid.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Data Management</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Export Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium mb-2">Export Data</h3>
          <p className="text-gray-600 mb-3">
            Download a complete backup of your inventory system, including all items, 
            storage locations, and images.
          </p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export Backup'}
          </button>
        </div>

        {/* Import Section */}
        <div>
          <h3 className="text-lg font-medium mb-2">Import Data</h3>
          <p className="text-gray-600 mb-3">
            Restore your inventory system from a previous backup. This will replace all
            existing data.
          </p>
          <div className="flex items-center space-x-2">
            <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer">
              <input
                type="file"
                accept=".zip"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
              {isImporting ? 'Importing...' : 'Select Backup File'}
            </label>
            <span className="text-sm text-gray-500">
              Only .zip backup files are supported
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
