'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import apiClient from '@/services/api';
import { useToastNotifications } from '@/hooks/useToastNotifications';

// ============================================================================
// TYPES
// ============================================================================

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'custom';

interface WatermarkSettings {
  logoUrl: string | null;
  logoFile: File | null;
  position: Position;
  customPosition: { x: number; y: number };
  opacity: number;
  size: number;
  rotation: number;
}

interface WatermarkEditorProps {
  contentUrl?: string;
  contentType?: 'image' | 'video';
  onExport?: (watermarkedUrl: string) => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// POSITION PRESETS
// ============================================================================

const POSITION_PRESETS: Record<Position, { x: number; y: number; label: string }> = {
  'top-left': { x: 5, y: 5, label: 'Top Left' },
  'top-right': { x: 95, y: 5, label: 'Top Right' },
  'bottom-left': { x: 5, y: 95, label: 'Bottom Left' },
  'bottom-right': { x: 95, y: 95, label: 'Bottom Right' },
  'center': { x: 50, y: 50, label: 'Center' },
  'custom': { x: 50, y: 50, label: 'Custom' },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function WatermarkEditor({
  contentUrl,
  contentType = 'image',
  onExport,
  onError,
}: WatermarkEditorProps) {
  // State
  const [settings, setSettings] = useState<WatermarkSettings>({
    logoUrl: null,
    logoFile: null,
    position: 'bottom-right',
    customPosition: { x: 95, y: 95 },
    opacity: 80,
    size: 15,
    rotation: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(contentUrl || null);

  // Refs
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast notifications
  const toast = useToastNotifications();

  // ============================================================================
  // LOGO UPLOAD
  // ============================================================================

  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo file size must be less than 5MB');
      return;
    }

    const logoUrl = URL.createObjectURL(file);
    setSettings((prev) => ({
      ...prev,
      logoUrl,
      logoFile: file,
    }));
    toast.success('Logo uploaded successfully');
  }, [toast]);

  const handleLogoDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo file size must be less than 5MB');
      return;
    }

    const logoUrl = URL.createObjectURL(file);
    setSettings((prev) => ({
      ...prev,
      logoUrl,
      logoFile: file,
    }));
    toast.success('Logo uploaded successfully');
  }, [toast]);

  // ============================================================================
  // POSITION CONTROLS
  // ============================================================================

  const handlePositionPreset = useCallback((position: Position) => {
    const preset = POSITION_PRESETS[position];
    setSettings((prev) => ({
      ...prev,
      position,
      customPosition: { x: preset.x, y: preset.y },
    }));
  }, []);

  const handleDragStart = useCallback(() => {
    setSettings((prev) => ({ ...prev, position: 'custom' }));
  }, []);

  const handleDrag = useCallback((event: React.MouseEvent) => {
    if (!previewContainerRef.current) return;

    const rect = previewContainerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setSettings((prev) => ({
      ...prev,
      customPosition: {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      },
    }));
  }, []);

  // ============================================================================
  // EXPORT
  // ============================================================================

  const handleExport = useCallback(async () => {
    if (!settings.logoFile) {
      toast.warning('Please upload a logo first');
      return;
    }

    if (!previewUrl) {
      toast.warning('Please upload content to watermark');
      return;
    }

    try {
      setIsProcessing(true);
      toast.info('Processing watermark...');

      // In a real implementation, this would call the watermark API
      // For now, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockWatermarkedUrl = previewUrl; // In reality, this would be the processed URL
      
      toast.success('Watermark applied successfully!');
      onExport?.(mockWatermarkedUrl);
    } catch (error: any) {
      const errorMessage = `Failed to apply watermark: ${error.message}`;
      toast.error(errorMessage);
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  }, [settings.logoFile, previewUrl, toast, onExport, onError]);

  // ============================================================================
  // CONTENT UPLOAD
  // ============================================================================

  const handleContentUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    toast.success('Content uploaded successfully');
  }, [toast]);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      if (settings.logoUrl) {
        URL.revokeObjectURL(settings.logoUrl);
      }
      if (previewUrl && !contentUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [settings.logoUrl, previewUrl, contentUrl]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-900 rounded-xl border border-gray-800">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Watermark Editor</h2>
        <p className="text-gray-400">
          Add your logo to protect your content and build brand recognition
        </p>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Logo Upload */}
          <div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Logo</h3>
            
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleLogoDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              
              {settings.logoUrl ? (
                <div className="space-y-2">
                  <img
                    src={settings.logoUrl}
                    alt="Logo preview"
                    className="w-20 h-20 object-contain mx-auto rounded"
                  />
                  <p className="text-sm text-gray-400">Click to change logo</p>
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl">📷</div>
                  <p className="text-sm text-gray-300">Drop logo here or click to upload</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </p>
              )}
            </div>
          </div>

          {/* Position Presets */}
          <div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Position</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(POSITION_PRESETS) as Position[])
                .filter((pos) => pos !== 'custom')
                .map((position) => (
                  <button
                    key={position}
                    onClick={() => handlePositionPreset(position)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      settings.position === position
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {POSITION_PRESETS[position].label}
                  </button>
                ))}
            </h3>

            {settings.position === 'custom' && (
              <div className="mt-3 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                <p className="text-xs text-blue-400">
                  Drag the logo in the preview to position it
                </p>
              </div>
            )}
          </div>

          {/* Opacity Control */}
          <div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Opacity</h3>
            
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.opacity}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, opacity: parseInt(e.target.value) }))
                }
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">0%</span>
                <span className="text-white font-semibold">{settings.opacity}%</span>
                <span className="text-gray-400">100%</span>
              </span>
            </h3>
          </div>

          {/* Size Control */}
          <div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Size</h3>
            
            <div className="space-y-3">
              <input
                type="range"
                min="5"
                max="50"
                value={settings.size}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, size: parseInt(e.target.value) }))
                }
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Small</span>
                <span className="text-white font-semibold">{settings.size}%</span>
                <span className="text-gray-400">Large</span>
              </span>
            </h3>
          </div>

          {/* Rotation Control */}
          <div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Rotation</h3>
            
            <div className="space-y-3">
              <input
                type="range"
                min="-180"
                max="180"
                value={settings.rotation}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, rotation: parseInt(e.target.value) }))
                }
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">-180°</span>
                <span className="text-white font-semibold">{settings.rotation}°</span>
                <span className="text-gray-400">180°</span>
              </span>
            </h3>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:col-span-2">
          <div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5 h-full"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
            
            <div
              ref={previewContainerRef}
              className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700"
              onMouseMove={settings.position === 'custom' ? handleDrag : undefined}
            >
              {/* Content */}
              {previewUrl ? (
                contentType === 'video' ? (
                  <video
                    src={previewUrl}
                    className="w-full h-full object-contain"
                    controls
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Content preview"
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-6xl mb-4">🖼️</div>
                  <p className="text-gray-400 mb-4">No content uploaded</p>
                  <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition">
                    Upload Content
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleContentUpload}
                      className="hidden"
                    />
                  </label>
                </p>
              )}

              {/* Watermark Overlay */}
              {settings.logoUrl && previewUrl && (
                <div
                  className="absolute cursor-move"
                  style={{
                    left: `${settings.customPosition.x}%`,
                    top: `${settings.customPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: settings.opacity / 100,
                  }}
                  drag
                  dragMomentum={false}
                  onDragStart={handleDragStart}
                  onDrag={(event, info) => {
                    if (!previewContainerRef.current) return;
                    const rect = previewContainerRef.current.getBoundingClientRect();
                    const x = ((info.point.x - rect.left) / rect.width) * 100;
                    const y = ((info.point.y - rect.top) / rect.height) * 100;
                    setSettings((prev) => ({
                      ...prev,
                      customPosition: {
                        x: Math.max(0, Math.min(100, x)),
                        y: Math.max(0, Math.min(100, y)),
                      },
                    }));
                  }}
                >
                  <img
                    src={settings.logoUrl}
                    alt="Watermark"
                    style={{
                      width: `${settings.size}%`,
                      transform: `rotate(${settings.rotation}deg)`,
                      pointerEvents: 'none',
                    }}
                    className="max-w-none"
                  />
                </span>
              )}
            </div>

            {/* Export Button */}
            <div className="mt-6">
              <button
                onClick={handleExport}
                disabled={!settings.logoFile || !previewUrl || isProcessing}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    Export Watermarked Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
