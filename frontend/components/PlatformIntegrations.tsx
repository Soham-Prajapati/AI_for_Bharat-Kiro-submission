'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';

// Types
type PlatformName = 'youtube' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'facebook';

type ConnectionStatus = 'connected' | 'disconnected' | 'error';

interface PlatformAccount {
  username: string;
  followers: number;
  lastSync: Date | null;
}

interface Platform {
  id: PlatformName;
  name: string;
  icon: string;
  color: string;
  status: ConnectionStatus;
  account: PlatformAccount | null;
  isLoading: boolean;
}

interface PlatformSettings {
  autoPost: boolean;
  notifications: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
}

// Platform configuration
const PLATFORM_CONFIG: Record<PlatformName, { name: string; icon: string; color: string }> = {
  youtube: { name: 'YouTube', icon: '▶', color: '#FF0000' },
  instagram: { name: 'Instagram', icon: '📷', color: '#E4405F' },
  linkedin: { name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  twitter: { name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
  tiktok: { name: 'TikTok', icon: '🎵', color: '#000000' },
  facebook: { name: 'Facebook', icon: '👥', color: '#1877F2' },
};

const PlatformIntegrations: React.FC = () => {
  const { addToast } = useToast();
  const [platforms, setPlatforms] = useState<Platform[]>(
    Object.entries(PLATFORM_CONFIG).map(([id, config]) => ({
      id: id as PlatformName,
      ...config,
      status: 'disconnected' as ConnectionStatus,
      account: null,
      isLoading: false,
    }))
  );

  const [selectedPlatform, setSelectedPlatform] = useState<PlatformName | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<Record<PlatformName, PlatformSettings>>({
    youtube: { autoPost: true, notifications: true, syncFrequency: 'hourly' },
    instagram: { autoPost: true, notifications: true, syncFrequency: 'hourly' },
    linkedin: { autoPost: false, notifications: true, syncFrequency: 'daily' },
    twitter: { autoPost: true, notifications: true, syncFrequency: 'realtime' },
    tiktok: { autoPost: true, notifications: false, syncFrequency: 'hourly' },
    facebook: { autoPost: false, notifications: true, syncFrequency: 'daily' },
  });

  // Simulate OAuth flow
  const handleConnect = async (platformId: PlatformName) => {
    setPlatforms(prev =>
      prev.map(p => (p.id === platformId ? { ...p, isLoading: true } : p))
    );

    // Simulate OAuth popup/redirect
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate random success/failure
    const isSuccess = Math.random() > 0.2;

    if (isSuccess) {
      const mockAccount: PlatformAccount = {
        username: `@user_${platformId}`,
        followers: Math.floor(Math.random() * 100000) + 1000,
        lastSync: new Date(),
      };

      setPlatforms(prev =>
        prev.map(p =>
          p.id === platformId
            ? { ...p, status: 'connected', account: mockAccount, isLoading: false }
            : p
        )
      );

      addToast('success', `Successfully connected to ${PLATFORM_CONFIG[platformId].name}!`);
    } else {
      setPlatforms(prev =>
        prev.map(p =>
          p.id === platformId ? { ...p, status: 'error', isLoading: false } : p
        )
      );

      addToast('error', `Failed to connect to ${PLATFORM_CONFIG[platformId].name}. Please try again.`);
    }
  };

  const handleDisconnect = (platformId: PlatformName) => {
    setPlatforms(prev =>
      prev.map(p =>
        p.id === platformId
          ? { ...p, status: 'disconnected', account: null }
          : p
      )
    );

    addToast('info', `Disconnected from ${PLATFORM_CONFIG[platformId].name}`);
  };

  const handleSync = async (platformId: PlatformName) => {
    setPlatforms(prev =>
      prev.map(p => (p.id === platformId ? { ...p, isLoading: true } : p))
    );

    await new Promise(resolve => setTimeout(resolve, 1500));

    setPlatforms(prev =>
      prev.map(p =>
        p.id === platformId && p.account
          ? { ...p, account: { ...p.account, lastSync: new Date() }, isLoading: false }
          : p
      )
    );

    addToast('success', `${PLATFORM_CONFIG[platformId].name} synced successfully!`);
  };

  const openSettings = (platformId: PlatformName) => {
    setSelectedPlatform(platformId);
    setShowSettingsModal(true);
  };

  const saveSettings = () => {
    if (selectedPlatform) {
      addToast('success', `Settings saved for ${PLATFORM_CONFIG[selectedPlatform].name}`);
      setShowSettingsModal(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatLastSync = (date: Date | null): string => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Platform Integrations</h1>
          <p className="text-gray-400">Connect and manage your social media accounts</p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform, index) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              index={index}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
              onSettings={openSettings}
              formatNumber={formatNumber}
              formatLastSync={formatLastSync}
            />
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      
        {showSettingsModal && selectedPlatform && (
          <SettingsModal
            platform={selectedPlatform}
            settings={platformSettings[selectedPlatform]}
            onClose={() => setShowSettingsModal(false)}
            onSave={saveSettings}
            onChange={(newSettings) =>
              setPlatformSettings(prev => ({
                ...prev,
                [selectedPlatform]: newSettings,
              }))
            }
          />
        )}
      
    </div>
  );
};

// Platform Card Component
interface PlatformCardProps {
  platform: Platform;
  index: number;
  onConnect: (id: PlatformName) => void;
  onDisconnect: (id: PlatformName) => void;
  onSync: (id: PlatformName) => void;
  onSettings: (id: PlatformName) => void;
  formatNumber: (num: number) => string;
  formatLastSync: (date: Date | null) => string;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  index,
  onConnect,
  onDisconnect,
  onSync,
  onSettings,
  formatNumber,
  formatLastSync,
}) => {
  const getStatusColor = () => {
    switch (platform.status) {
      case 'connected':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (platform.status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      default:
        return 'Disconnected';
    }
  };

  return (
    <div
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
      style={{
        boxShadow: `0 4px 20px ${platform.color}15`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: `${platform.color}20` }}
          >
            {platform.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span className="text-sm text-gray-400">{getStatusText()}</span>
            </div>
          </div>
        </div>

        {/* Settings Button */}
        {platform.status === 'connected' && (
          <button
            onClick={() => onSettings(platform.id)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Account Info */}
      {platform.status === 'connected' && platform.account && (
        <div
          className="mb-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Username</span>
            <span className="text-sm text-white font-medium">{platform.account.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Followers</span>
            <span className="text-sm text-white font-medium">
              {formatNumber(platform.account.followers)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Last Sync</span>
            <span className="text-sm text-white font-medium">
              {formatLastSync(platform.account.lastSync)}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {platform.status === 'error' && (
        <div
          className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <p className="text-sm text-red-400">Connection failed. Please try again.</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {platform.status === 'connected' ? (
          <>
            <button
              onClick={() => onSync(platform.id)}
              disabled={platform.isLoading}
              className="w-full px-4 py-2 bg-gradient-to-r text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundImage: `linear-gradient(to right, ${platform.color}, ${platform.color}dd)`,
              }}
            >
              {platform.isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Syncing...
                </span>
              ) : (
                'Sync Now'
              )}
            </button>
            <button
              onClick={() => onDisconnect(platform.id)}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={() => onConnect(platform.id)}
            disabled={platform.isLoading}
            className="w-full px-4 py-2 bg-gradient-to-r text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundImage: `linear-gradient(to right, ${platform.color}, ${platform.color}dd)`,
            }}
          >
            {platform.isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Connecting...
              </span>
            ) : (
              'Connect'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Settings Modal Component
interface SettingsModalProps {
  platform: PlatformName;
  settings: PlatformSettings;
  onClose: () => void;
  onSave: () => void;
  onChange: (settings: PlatformSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  platform,
  settings,
  onClose,
  onSave,
  onChange,
}) => {
  const platformConfig = PLATFORM_CONFIG[platform];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg"
              style={{ backgroundColor: `${platformConfig.color}20` }}
            >
              {platformConfig.icon}
            </div>
            <h2 className="text-xl font-bold text-white">{platformConfig.name} Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Settings */}
        <div className="space-y-4 mb-6">
          {/* Auto Post */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Auto Post</p>
              <p className="text-sm text-gray-400">Automatically publish content</p>
            </div>
            <button
              onClick={() => onChange({ ...settings, autoPost: !settings.autoPost })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.autoPost ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
              />
            </button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Notifications</p>
              <p className="text-sm text-gray-400">Receive platform updates</p>
            </div>
            <button
              onClick={() => onChange({ ...settings, notifications: !settings.notifications })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.notifications ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
              />
            </button>
          </div>

          {/* Sync Frequency */}
          <div>
            <p className="text-white font-medium mb-2">Sync Frequency</p>
            <div className="grid grid-cols-3 gap-2">
              {(['realtime', 'hourly', 'daily'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => onChange({ ...settings, syncFrequency: freq })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.syncFrequency === freq
                      ? 'bg-gradient-to-r text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  style={
                    settings.syncFrequency === freq
                      ? {
                          backgroundImage: `linear-gradient(to right, ${platformConfig.color}, ${platformConfig.color}dd)`,
                        }
                      : undefined
                  }
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 text-white font-semibold rounded-lg transition-all"
            style={{
              backgroundImage: `linear-gradient(to right, ${platformConfig.color}, ${platformConfig.color}dd)`,
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformIntegrations;
