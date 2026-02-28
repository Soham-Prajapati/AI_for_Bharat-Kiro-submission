'use client';

import React from 'react';
import WatermarkEditor from '@/components/WatermarkEditor';

export default function WatermarkPage() {
  const handleExport = (watermarkedUrl: string) => {
    console.log('Watermarked content URL:', watermarkedUrl);
    // In a real app, this would trigger a download or save
  };

  const handleError = (error: Error) => {
    console.error('Watermark error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <WatermarkEditor
        onExport={handleExport}
        onError={handleError}
      />
    </div>
  );
}
