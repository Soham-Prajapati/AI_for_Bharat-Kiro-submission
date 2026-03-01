'use client';

import React, { useState } from 'react';

export interface ExportButtonProps {
  onExport: (format: 'csv' | 'pdf' | 'json') => void;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions = [
    { format: 'csv' as const, label: 'Export as CSV', icon: '📊' },
    { format: 'pdf' as const, label: 'Export as PDF', icon: '📄' },
    { format: 'json' as const, label: 'Export as JSON', icon: '{ }' },
  ];

  const handleExport = (format: 'csv' | 'pdf' | 'json') => {
    onExport(format);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-medium text-white transition-all hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>📥</span>
        <span>Export</span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-xl"
          >
            {exportOptions.map((option) => (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-gray-800"
              >
                <span className="text-lg">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </button>
  );
};
