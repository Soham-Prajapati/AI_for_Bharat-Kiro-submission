export type Platform = 'youtube' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'facebook';
export type Trend = 'up' | 'down' | 'stable';

export interface TopPost {
  title: string;
  views: number;
  likes: number;
}

export interface PlatformData {
  platform: Platform;
  followers: number;
  engagement: number; // 0-1 (percentage)
  trend: Trend;
  topPost: TopPost;
}

export interface EngagementDataPoint {
  date: string;
  youtube: number;
  instagram: number;
  linkedin: number;
  twitter: number;
  tiktok: number;
  facebook: number;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  platform?: Platform;
}

export const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: '#FF0000',
  instagram: '#E1306C',
  linkedin: '#0077B5',
  twitter: '#1DA1F2',
  tiktok: '#00F2EA',
  facebook: '#1877F2',
};

export const PLATFORM_NAMES: Record<Platform, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  tiktok: 'TikTok',
  facebook: 'Facebook',
};
