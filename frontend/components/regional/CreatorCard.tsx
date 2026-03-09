'use client';

import { Creator } from '@/types/regional';

const PLATFORM_ICONS: Record<string, string> = {
  youtube:   '📺',
  instagram: '📸',
  twitter:   '🐦',
  linkedin:  '💼',
  facebook:  '👥',
  tiktok:    '🎵',
};

const PLATFORM_COLORS: Record<string, string> = {
  youtube:   'text-red-400',
  instagram: 'text-pink-400',
  twitter:   'text-sky-400',
  linkedin:  'text-blue-400',
  facebook:  'text-indigo-400',
  tiktok:    'text-purple-400',
};

const AUDIENCE_LABELS: Record<string, string> = {
  beginners:    '🌱 Beginners',
  intermediate: '🔥 Intermediate',
  expert:       '🧠 Expert',
  general:      '🌍 General',
  youth:        '⚡ Youth',
  professional: '💼 Pro',
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

interface Props {
  creator: Creator;
  onCollabRequest: (creator: Creator) => void;
  onOpenChat: (creator: Creator) => void;
  showMatchInfo?: boolean;
  matchReasons?: string[];
}

export default function CreatorCard({
  creator,
  onCollabRequest,
  onOpenChat,
  showMatchInfo = false,
  matchReasons = [],
}: Props) {
  const topPlatform = creator.platforms.reduce((best, p) =>
    (creator.followersByPlatform?.[p] ?? 0) > (creator.followersByPlatform?.[best] ?? 0) ? p : best,
    creator.platforms[0] ?? 'youtube'
  );

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 hover:border-brand-500/30 hover:bg-white/[0.05] transition-all duration-200 group">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${creator.avatarColor ?? 'from-brand-500 to-cyan-500'} flex items-center justify-center text-xl font-bold text-white shadow-lg`}>
            {creator.name.charAt(0)}
          </div>
          {creator.lookingForCollabs && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#030712] flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">✓</span>
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenChat(creator)}
                  className="font-bold text-white text-base truncate hover:text-brand-400 transition-colors text-left"
                >
                  {creator.name}
                </button>
                {creator.verified && <span className="text-blue-400 text-xs flex-shrink-0" title="Verified">✔</span>}
              </div>
              <div className="text-xs text-white/40 font-mono mt-0.5">{creator.handle}</div>
            </div>
            {/* Total audience badge */}
            <div className="flex-shrink-0 text-right">
              <div className="text-lg font-black text-white font-display">{fmt(creator.audienceSize)}</div>
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">total</div>
            </div>
          </div>

          {/* Niche + city + audience type */}
          <div className="flex items-center flex-wrap gap-1.5 mt-2">
            <span className="text-xs font-semibold text-brand-400">{creator.niche}</span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/40">{creator.city}</span>
            {creator.audienceType && (
              <>
                <span className="text-white/20">·</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/50">
                  {AUDIENCE_LABELS[creator.audienceType] ?? creator.audienceType}
                </span>
              </>
            )}
          </div>

          {/* Platform breakdown */}
          <div className="flex items-center gap-3 mt-2.5">
            {creator.platforms.slice(0, 4).map(p => (
              <div key={p} className="flex items-center gap-1">
                <span className={`text-[11px] ${PLATFORM_COLORS[p] ?? 'text-white/40'}`}>{PLATFORM_ICONS[p] ?? '📱'}</span>
                <span className="text-[11px] text-white/40">{fmt(creator.followersByPlatform?.[p] ?? 0)}</span>
              </div>
            ))}
          </div>

          {/* Bio */}
          <p className="text-xs text-white/40 mt-2 leading-relaxed line-clamp-2">{creator.bio}</p>
        </div>
      </div>

      {/* Match reasons */}
      {showMatchInfo && matchReasons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.05] flex flex-wrap gap-1.5">
          {matchReasons.map((r, i) => (
            <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{r}</span>
          ))}
        </div>
      )}

      {/* Action row */}
      <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center gap-2">
        <button
          onClick={() => onOpenChat(creator)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
        >
          <span>💬</span> Message
        </button>
        {creator.lookingForCollabs && (
          <button
            onClick={() => onCollabRequest(creator)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.10] hover:bg-white/[0.08] hover:border-emerald-500/30 text-white/70 text-xs font-semibold transition-colors"
          >
            <span>🤝</span> Collab
          </button>
        )}
      </div>
    </div>
  );
}


