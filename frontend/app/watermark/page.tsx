'use client';

import React from 'react';
import WatermarkEditor from '@/components/WatermarkEditor';

export default function WatermarkPage() {
  const handleExport = (watermarkedUrl: string) => {
    console.log('Watermarked content URL:', watermarkedUrl);
  };

  const handleError = (error: Error) => {
    console.error('Watermark error:', error);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            <span className="text-[10px] font-mono font-semibold text-brand-400 uppercase tracking-widest">Brand Protection</span>
          </div>
          <h1 className="text-4xl font-black font-display text-white leading-none">
            Watermark <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Editor</span>
          </h1>
          <p className="mt-2 text-white/40 text-sm">Add your brand watermark to protect your content across platforms.</p>
        </div>
        <WatermarkEditor
          onExport={handleExport}
          onError={handleError}
        />
      </div>
    </div>
  );
}
