'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { api } from '@/services/api';
import { apiWithToast, getErrorMessage } from '@/lib/apiWithToast';

/**
 * Example component demonstrating toast notification usage
 * This shows various patterns for using toasts with API calls
 */
const ToastExample: React.FC = () => {
  const { addToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Example 1: Simple toast notifications
  const showSimpleToasts = () => {
    addToast('success', 'Operation completed successfully!');
    setTimeout(() => addToast('info', 'Here is some information'), 1000);
    setTimeout(() => addToast('warning', 'Please be careful!'), 2000);
    setTimeout(() => addToast('error', 'Something went wrong'), 3000);
  };

  // Example 2: API call with manual error handling
  const handleUploadManual = async () => {
    if (!file) {
      addToast('warning', 'Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const response = await api.upload(file, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
      
      addToast('success', `File uploaded successfully! ID: ${response.fileId}`);
    } catch (error: any) {
      addToast('error', getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  // Example 3: API call with apiWithToast helper
  const handleUploadWithHelper = async () => {
    if (!file) {
      addToast('warning', 'Please select a file first');
      return;
    }

    setUploading(true);
    try {
      await apiWithToast(
        () => api.upload(file),
        addToast,
        {
          successMessage: 'File uploaded successfully!',
          showSuccess: true,
        }
      );
    } catch (error) {
      // Error toast is already shown by apiWithToast
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  // Example 4: Custom duration toast
  const showCustomDurationToast = () => {
    addToast('info', 'This toast will stay for 10 seconds', 10000);
  };

  // Example 5: Persistent toast (no auto-dismiss)
  const showPersistentToast = () => {
    addToast('error', 'Critical error - please contact support', 0);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">Toast Notification Examples</h1>

      {/* Example 1 */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">1. Simple Toasts</h2>
        <p className="text-gray-600 mb-4">Show all toast types in sequence</p>
        <button
          onClick={showSimpleToasts}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Show All Toast Types
        </button>
      </p>

      {/* Example 2 & 3 */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">2. File Upload with Toasts</h2>
        <p className="text-gray-600 mb-4">Upload a file and see success/error toasts</p>
        
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        
        <div className="flex gap-2">
          <button
            onClick={handleUploadManual}
            disabled={uploading || !file}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {uploading ? 'Uploading...' : 'Upload (Manual)'}
          </button>
          
          <button
            onClick={handleUploadWithHelper}
            disabled={uploading || !file}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
          >
            {uploading ? 'Uploading...' : 'Upload (Helper)'}
          </button>
        </p>
      </h2>

      {/* Example 4 */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">3. Custom Duration</h2>
        <p className="text-gray-600 mb-4">Toast that stays for 10 seconds</p>
        <button
          onClick={showCustomDurationToast}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Show 10s Toast
        </button>
      </p>

      {/* Example 5 */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">4. Persistent Toast</h2>
        <p className="text-gray-600 mb-4">Toast that requires manual dismissal</p>
        <button
          onClick={showPersistentToast}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Show Persistent Toast
        </button>
      </p>
    </h1>
  );
};

export default ToastExample;
