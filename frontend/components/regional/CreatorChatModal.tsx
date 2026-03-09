'use client';

import { useState, useRef, useEffect } from 'react';
import { Creator, ChatMessage } from '@/types/regional';
import { useAuth } from '@/hooks/useAuth';

const PLATFORM_ICONS: Record<string, string> = {
  youtube: '📺', instagram: '📸', twitter: '🐦',
  linkedin: '💼', facebook: '👥', tiktok: '🎵',
};

const AI_AGENTS = [
  {
    id: 'collab-planner',
    icon: '🗓️',
    name: 'Collab Planner',
    desc: 'Plans content calendar, topic ideas & deliverables for your collab',
    color: 'from-brand-600 to-brand-500',
    border: 'border-brand-500/30',
  },
  {
    id: 'reach-estimator',
    icon: '📊',
    name: 'Reach Estimator',
    desc: 'Estimates combined reach, virality score & best posting times',
    color: 'from-cyan-600 to-cyan-400',
    border: 'border-cyan-500/30',
  },
  {
    id: 'contract-drafter',
    icon: '📄',
    name: 'Contract Drafter',
    desc: 'Generates a simple collab agreement with deliverables & revenue split',
    color: 'from-emerald-600 to-emerald-400',
    border: 'border-emerald-500/30',
  },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function seed(id: string, myName: string, creatorName: string): ChatMessage[] {
  const now = Date.now();
  return [
    { id: '1', senderId: id, senderName: creatorName, text: `Hey! Saw your profile — love what you\'re doing with your content. Would be great to connect! 🙌`, timestamp: new Date(now - 3600000).toISOString(), type: 'message' },
    { id: '2', senderId: 'me', senderName: myName, text: `Thanks so much! Big fan of your work too. Open to a collab?`, timestamp: new Date(now - 3000000).toISOString(), type: 'message' },
    { id: '3', senderId: id, senderName: creatorName, text: `Absolutely! I think our audiences would overlap well. What did you have in mind?`, timestamp: new Date(now - 1800000).toISOString(), type: 'message' },
  ];
}

interface Props {
  creator: Creator;
  onClose: () => void;
}

type Tab = 'chat' | 'profile' | 'agents';

export default function CreatorChatModal({ creator, onClose }: Props) {
  const { user } = useAuth();
  const myName = user?.name || 'You';

  const [tab, setTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(() => seed(creator.id, myName, creator.name));
  const [input, setInput] = useState('');
  const [agentRunning, setAgentRunning] = useState<string | null>(null);
  const [agentOutputs, setAgentOutputs] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, tab]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: myName,
      text,
      timestamp: new Date().toISOString(),
      type: 'message',
    };
    setMessages(prev => [...prev, msg]);
    setInput('');

    // Simulate creator reply after 1.5s
    setTimeout(() => {
      const replies = [
        'Sounds great! Let\'s make it happen 🚀',
        'Love that idea! We should jump on a quick call.',
        'I was thinking something similar. Let\'s draft a plan!',
        'My audience would love this. When are you free?',
        'Perfect timing — I\'m planning a series on this topic!',
      ];
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        senderId: creator.id,
        senderName: creator.name,
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toISOString(),
        type: 'message',
      }]);
    }, 1500);
  };

  const spawnAgent = (agentId: string, agentName: string) => {
    setAgentRunning(agentId);
    setAgentOutputs(prev => ({ ...prev, [agentId]: '' }));

    const myAudience = 50000; // fallback estimate for current user
    const combined = creator.audienceSize + myAudience;

    const outputs: Record<string, string> = {
      'collab-planner': `✅ **Collab Plan: ${myName} × ${creator.name}**\n\n**Content Theme:** ${creator.niche} meets your audience\n\n**Week 1 — Ideation**\n• Joint brainstorm call (30 min)\n• 3 content idea pitches per creator\n• Decide on format: podcast/video/reel\n\n**Week 2 — Production**\n• Cross-post on both channels\n• Creator 1 leads, Creator 2 guests\n• Swap roles for second piece\n\n**Deliverables:** 2 long-form + 4 short-form pieces\n**Estimated combined reach:** ${fmt(Math.round(combined * 1.4))}`,
      'reach-estimator': `📊 **Reach Analysis**\n\n**Your audience:** ~${fmt(myAudience)}\n**${creator.name}'s audience:** ${fmt(creator.audienceSize)}\n\n**Combined raw reach:** ${fmt(combined)}\n**Cross-pollination boost:** +35%\n**Estimated net reach:** ${fmt(Math.round(combined * 1.35))}\n\n**Virality Score:** ${Math.floor(Math.random() * 20) + 72}/100 🔥\n**Best day to post:** Wednesday & Friday\n**Best time:** 7–9 PM IST\n\n**Top platforms to cross-post:** ${creator.platforms.slice(0, 2).join(', ')}`,
      'contract-drafter': `📄 **Simple Collab Agreement**\n\nBetween: **${myName}** and **${creator.name}**\nDate: ${new Date().toLocaleDateString('en-IN')}\n\n**Scope of Work:**\nBoth parties agree to produce 1 co-created video and 2 supporting reels.\n\n**Credit:**\nFull credit given to both creators on all published content.\n\n**Revenue Split:**\n• AdSense / Creator Fund: 50/50 split\n• Sponsorships sourced by either party: 70/30 (sourcing party gets 70%)\n\n**Timeline:** 3 weeks from agreement date\n\n**IP Rights:**\nEach creator retains rights to their own channel's copy of content.\n\n*This is a good-faith agreement and not a legal contract.*`,
    };

    // Simulate streaming output
    const fullText = outputs[agentId] || `✅ Agent complete.`;
    let i = 0;
    const interval = setInterval(() => {
      i += 8;
      setAgentOutputs(prev => ({ ...prev, [agentId]: fullText.slice(0, i) }));
      if (i >= fullText.length) {
        clearInterval(interval);
        setAgentRunning(null);
        // Add agent update to chat
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          senderId: 'agent',
          senderName: `🤖 ${agentName}`,
          text: `Agent task complete. Output shared with ${creator.name}.`,
          timestamp: new Date().toISOString(),
          type: 'agent_update',
        }]);
      }
    }, 30);
  };

  const ts = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-[#0d1117] border border-white/[0.10] rounded-3xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
        style={{ height: 'min(90vh, 680px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07] flex-shrink-0">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${creator.avatarColor ?? 'from-brand-500 to-cyan-500'} flex items-center justify-center text-lg font-bold text-white flex-shrink-0`}>
            {creator.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base truncate">{creator.name}</span>
              {creator.verified && <span className="text-blue-400 text-xs">✔</span>}
              {creator.lookingForCollabs && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 uppercase tracking-widest">Open to Collabs</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-white/40">
              <span>{creator.niche}</span>
              <span>·</span>
              <span>{creator.city}</span>
              <span>·</span>
              <span>{fmt(creator.audienceSize)} followers</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/[0.07] rounded-xl transition-colors text-white/40 hover:text-white flex-shrink-0">✕</button>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <div className="flex gap-0.5 px-5 pt-3 flex-shrink-0">
          {(['chat', 'profile', 'agents'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                tab === t ? 'bg-brand-600 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
            >
              {t === 'chat' ? '💬 Chat' : t === 'profile' ? '👤 Profile' : '🤖 AI Agents'}
            </button>
          ))}
        </div>

        {/* ── Chat Tab ───────────────────────────────────────────── */}
        {tab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
              {messages.map(msg => {
                const isMe = msg.senderId === 'me';
                const isAgent = msg.senderId === 'agent';
                if (isAgent) return (
                  <div key={msg.id} className="flex justify-center">
                    <div className="text-[11px] font-mono px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400">
                      {msg.senderName}: {msg.text}
                    </div>
                  </div>
                );
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && (
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${creator.avatarColor ?? 'from-brand-500 to-cyan-500'} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-auto`}>
                        {creator.name.charAt(0)}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-brand-600 text-white rounded-br-sm'
                          : 'bg-white/[0.06] text-white/90 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-white/25 px-1">{ts(msg.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="flex items-center gap-2 px-5 py-4 border-t border-white/[0.07] flex-shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={`Message ${creator.name}…`}
                className="flex-1 bg-white/[0.05] border border-white/[0.10] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand-500/50 focus:bg-white/[0.07] transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                Send
              </button>
            </div>
          </>
        )}

        {/* ── Profile Tab ────────────────────────────────────────── */}
        {tab === 'profile' && (
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 min-h-0">
            {/* Audience breakdown */}
            <div>
              <h3 className="text-xs font-mono font-semibold text-white/30 uppercase tracking-widest mb-3">Audience Breakdown</h3>
              <div className="grid grid-cols-2 gap-3">
                {creator.platforms.map(p => {
                  const count = creator.followersByPlatform?.[p] ?? 0;
                  const pct = creator.audienceSize > 0 ? Math.round((count / creator.audienceSize) * 100) : 0;
                  return (
                    <div key={p} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{PLATFORM_ICONS[p] ?? '📱'}</span>
                        <span className="text-sm font-semibold text-white capitalize">{p}</span>
                      </div>
                      <div className="text-xl font-black text-white font-display">{fmt(count)}</div>
                      <div className="mt-1.5 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[10px] text-white/30 mt-1">{pct}% of total</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Stats */}
            <div>
              <h3 className="text-xs font-mono font-semibold text-white/30 uppercase tracking-widest mb-3">Creator Stats</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-emerald-400">{fmt(creator.audienceSize)}</div>
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">Total</div>
                </div>
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-brand-400">{creator.platforms.length}</div>
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">Platforms</div>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-cyan-400">{creator.languages.length}</div>
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">Languages</div>
                </div>
              </div>
            </div>
            {/* Bio */}
            <div>
              <h3 className="text-xs font-mono font-semibold text-white/30 uppercase tracking-widest mb-2">About</h3>
              <p className="text-sm text-white/60 leading-relaxed">{creator.bio}</p>
            </div>
            {/* Languages & collab prefs */}
            <div>
              <h3 className="text-xs font-mono font-semibold text-white/30 uppercase tracking-widest mb-2">Languages</h3>
              <div className="flex flex-wrap gap-1.5">
                {creator.languages.map(l => (
                  <span key={l} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/60 capitalize">{l}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AI Agents Tab ──────────────────────────────────────── */}
        {tab === 'agents' && (
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 min-h-0">
            <p className="text-xs text-white/40">Spawn an AI agent to help plan, analyse, or formalise your collaboration with <strong className="text-white/70">{creator.name}</strong>.</p>
            {AI_AGENTS.map(agent => (
              <div key={agent.id} className={`border ${agent.border} rounded-2xl overflow-hidden`}>
                <div className="flex items-start gap-3 p-4 bg-white/[0.03]">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-xl flex-shrink-0`}>
                    {agent.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{agent.name}</div>
                    <div className="text-xs text-white/40 mt-0.5">{agent.desc}</div>
                  </div>
                  <button
                    onClick={() => spawnAgent(agent.id, agent.name)}
                    disabled={agentRunning !== null}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-gradient-to-r ${agent.color} text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90`}
                  >
                    {agentRunning === agent.id ? '⏳ Running…' : 'Run'}
                  </button>
                </div>
                {agentOutputs[agent.id] && (
                  <div className="px-4 pb-4 pt-2 bg-black/20 border-t border-white/[0.05]">
                    <pre className="text-[11px] text-white/70 whitespace-pre-wrap leading-relaxed font-mono">
                      {agentOutputs[agent.id]}
                      {agentRunning === agent.id && <span className="animate-pulse text-brand-400">▌</span>}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
