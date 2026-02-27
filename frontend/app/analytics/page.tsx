'use client';

import { motion } from 'framer-motion';
import PlatformCard from '@/components/PlatformCard';
import EngagementChart from '@/components/EngagementChart';
import RecommendationList from '@/components/RecommendationList';
import { PlatformData, EngagementDataPoint, Recommendation } from '@/types/analytics';
import { BarChart3, TrendingUp } from 'lucide-react';

// Mock data for platform performance
const platformsData: PlatformData[] = [
  {
    platform: 'youtube',
    followers: 125000,
    engagement: 0.045,
    trend: 'up',
    topPost: {
      title: 'How to Build a Content Strategy in 2024',
      views: 45000,
      likes: 3200,
    },
  },
  {
    platform: 'instagram',
    followers: 89000,
    engagement: 0.092,
    trend: 'up',
    topPost: {
      title: 'Behind the Scenes: Content Creation Process',
      views: 12000,
      likes: 8900,
    },
  },
  {
    platform: 'linkedin',
    followers: 34000,
    engagement: 0.038,
    trend: 'stable',
    topPost: {
      title: 'The Future of Content Marketing',
      views: 8500,
      likes: 1200,
    },
  },
  {
    platform: 'twitter',
    followers: 56000,
    engagement: 0.028,
    trend: 'down',
    topPost: {
      title: 'Quick tips for better engagement',
      views: 15000,
      likes: 890,
    },
  },
  {
    platform: 'tiktok',
    followers: 210000,
    engagement: 0.115,
    trend: 'up',
    topPost: {
      title: 'Viral content creation hack',
      views: 450000,
      likes: 52000,
    },
  },
  {
    platform: 'facebook',
    followers: 67000,
    engagement: 0.022,
    trend: 'down',
    topPost: {
      title: 'Community Q&A Session',
      views: 5600,
      likes: 780,
    },
  },
];

// Mock data for engagement over time
const engagementData: EngagementDataPoint[] = [
  { date: 'Jan', youtube: 3.8, instagram: 7.5, linkedin: 3.2, twitter: 2.1, tiktok: 9.8, facebook: 1.8 },
  { date: 'Feb', youtube: 4.0, instagram: 8.2, linkedin: 3.5, twitter: 2.5, tiktok: 10.5, facebook: 2.0 },
  { date: 'Mar', youtube: 4.2, instagram: 8.8, linkedin: 3.8, twitter: 2.8, tiktok: 11.0, facebook: 2.1 },
  { date: 'Apr', youtube: 4.3, instagram: 9.0, linkedin: 3.7, twitter: 2.7, tiktok: 11.2, facebook: 2.2 },
  { date: 'May', youtube: 4.5, instagram: 9.2, linkedin: 3.8, twitter: 2.8, tiktok: 11.5, facebook: 2.2 },
];

// Mock recommendations
const recommendations: Recommendation[] = [
  {
    id: '1',
    priority: 'high',
    message: 'Your Instagram engagement is 2x higher than YouTube - consider posting more Reels and short-form content to capitalize on this trend.',
    platform: 'instagram',
  },
  {
    id: '2',
    priority: 'high',
    message: 'TikTok is your fastest-growing platform (+150% this month). Increase posting frequency to 3-5 times per week to maintain momentum.',
    platform: 'tiktok',
  },
  {
    id: '3',
    priority: 'medium',
    message: 'LinkedIn posts on Tuesdays get 40% more engagement. Schedule your professional content for Tuesday mornings (9-11 AM).',
    platform: 'linkedin',
  },
  {
    id: '4',
    priority: 'medium',
    message: 'Twitter engagement is declining. Try using more visual content (images/GIFs) and engaging with trending topics in your niche.',
    platform: 'twitter',
  },
  {
    id: '5',
    priority: 'low',
    message: 'Facebook shows lower engagement rates. Consider focusing resources on higher-performing platforms or testing video content.',
    platform: 'facebook',
  },
  {
    id: '6',
    priority: 'low',
    message: 'Cross-post your top TikTok content to Instagram Reels within 24 hours to maximize reach across both platforms.',
  },
];

export default function AnalyticsPage() {
  // Calculate total metrics
  const totalFollowers = platformsData.reduce((sum, p) => sum + p.followers, 0);
  const avgEngagement = platformsData.reduce((sum, p) => sum + p.engagement, 0) / platformsData.length;
  const growingPlatforms = platformsData.filter(p => p.trend === 'up').length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl sm:text-4xl font-bold">Ecosystem Analytics</h1>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              Cross-platform performance insights and recommendations
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border border-blue-500/30">
            <p className="text-blue-300 text-sm mb-1">Total Followers</p>
            <p className="text-3xl font-bold text-white">
              {(totalFollowers / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-6 border border-green-500/30">
            <p className="text-green-300 text-sm mb-1">Avg Engagement</p>
            <p className="text-3xl font-bold text-white">
              {(avgEngagement * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-300" />
              <p className="text-purple-300 text-sm">Growing Platforms</p>
            </div>
            <p className="text-3xl font-bold text-white mt-1">
              {growingPlatforms} / {platformsData.length}
            </p>
          </div>
        </motion.div>

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {platformsData.map((platform, index) => (
            <PlatformCard key={platform.platform} data={platform} index={index} />
          ))}
        </div>

        {/* Engagement Chart */}
        <div className="mb-8">
          <EngagementChart data={engagementData} />
        </div>

        {/* Recommendations */}
        <RecommendationList recommendations={recommendations} />
      </div>
    </div>
  );
}
