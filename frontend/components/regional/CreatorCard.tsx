'use client';

import { Creator } from '@/types/regional';

interface CreatorCardProps {
  creator: Creator;
  onCollabRequest: (creator: Creator) => void;
  showMatchInfo?: boolean;
  matchReasons?: string[];
}

export default function CreatorCard({
  creator,
  onCollabRequest,
  showMatchInfo = false,
  matchReasons = [],
}: CreatorCardProps) {
  const platformIcons: Record<string, string> = {
    youtube: '📺',
    instagram: '📸',
    tiktok: '🎵',
    twitter: '🐦',
    linkedin: '💼',
    facebook: '👥',
  };

  const languageNames: Record<string, string> = {
    hindi: 'Hindi',
    bengali: 'Bengali',
    tamil: 'Tamil',
    telugu: 'Telugu',
    marathi: 'Marathi',
    gujarati: 'Gujarati',
    kannada: 'Kannada',
    malayalam: 'Malayalam',
    odia: 'Odia',
  };

  const formatAudience = (size: number): string => {
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`;
    if (size >= 1000) return `${(size / 1000).toFixed(1)}K`;
    return size.toString();
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
            {creator.name.charAt(0)}
          </div>
          {creator.lookingForCollabs && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <span className="text-xs">✓</span>
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-white font-semibold text-lg truncate">
                {creator.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-purple-400 text-sm">{creator.niche}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 text-sm capitalize">
                  {creator.region} India
                </span>
              </span>
            </div>
            
            {/* Audience Size Badge */}
            <div className="bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 flex-shrink-0">
              <div className="text-purple-300 font-semibold text-sm">
                {formatAudience(creator.audienceSize)}
              </span>
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">
            {creator.bio}
          </p>

          {/* Languages */}
          <div className="flex flex-wrap gap-2 mt-3">
            {creator.languages.map((lang) => (
              <span
                key={lang}
                className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30"
              >
                {languageNames[lang]}
              </span>
            ))}
          </div>

          {/* Platforms */}
          <div className="flex items-center gap-2 mt-3">
            {creator.platforms.map((platform) => (
              <span
                key={platform}
                className="text-lg"
                title={platform}
              >
                {platformIcons[platform] || '🌐'}
              </span>
            ))}
          </div>

          {/* Match Reasons (if showing match info) */}
          {showMatchInfo && matchReasons.length > 0 && (
            <div className="mt-3 pt-3 border-t border-purple-500/20">
              <div className="text-xs text-gray-400 mb-2">Why this match:</div>
              <ul className="space-y-1">
                {matchReasons.slice(0, 3).map((reason, index) => (
                  <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => onCollabRequest(creator)}
            disabled={!creator.lookingForCollabs}
            className={`mt-4 w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
              creator.lookingForCollabs
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {creator.lookingForCollabs ? (
              <span className="flex items-center justify-center gap-2">
                <span>🤝</span>
                <span>Request Collaboration</span>
              </span>
            ) : (
              'Not Available'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
