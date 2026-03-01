'use client';

import { useState } from 'react';
import { Creator } from '@/types/regional';

interface CollabRequestProps {
  creator: Creator;
  onClose: () => void;
  onSend: (message: string, collabType: string) => void;
}

export default function CollabRequest({ creator, onClose, onSend }: CollabRequestProps) {
  const [message, setMessage] = useState('');
  const [collabType, setCollabType] = useState('video');
  const [sending, setSending] = useState(false);

  const collabTypes = [
    { value: 'video', label: '🎥 Joint Video', description: 'Create a video together' },
    { value: 'series', label: '📺 Video Series', description: 'Multi-part collaboration' },
    { value: 'cross-promotion', label: '📢 Cross-Promotion', description: 'Promote each other' },
    { value: 'challenge', label: '🎯 Challenge', description: 'Collaborative challenge' },
    { value: 'guest', label: '👤 Guest Appearance', description: 'Feature in each other\'s content' },
    { value: 'other', label: '✨ Other', description: 'Custom collaboration idea' },
  ];

  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      await onSend(message, collabType);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30 shadow-2xl shadow-purple-500/20 animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Collaboration Request
              </h2>
              <p className="text-purple-100">
                Send a collaboration request to {creator.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Creator Info */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
                {creator.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">{creator.name}</h3>
                <p className="text-gray-400 text-sm">{creator.niche} • {creator.audienceSize.toLocaleString()} followers</p>
                <p className="text-gray-500 text-xs mt-1">{creator.bio}</p>
              </div>
            </div>
          </div>

          {/* Collaboration Type */}
          <div>
            <label className="block text-white font-semibold mb-3">
              Collaboration Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {collabTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setCollabType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    collabType === type.value
                      ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                >
                  <div className="text-lg mb-1">{type.label}</div>
                  <div className="text-xs text-gray-400">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-white font-semibold mb-3">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain your collaboration idea..."
              rows={6}
              className="w-full bg-gray-800/50 border border-purple-500/20 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {message.length} / 500 characters
              </span>
              {message.length > 500 && (
                <span className="text-xs text-red-400">
                  Message too long
                </span>
              )}
            </div>
          </div>

          {/* Quick Templates */}
          <div>
            <label className="block text-white font-semibold mb-3">
              Quick Templates
            </label>
            <div className="space-y-2">
              {[
                "Hi! I love your content on [topic]. I'd like to collaborate on a video about [idea]. Let's discuss!",
                "Hey! I think our audiences would love to see us collaborate. I have some great ideas to share!",
                "Hello! I'm reaching out to explore a potential collaboration. I believe we can create something amazing together!",
              ].map((template, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(template)}
                  className="w-full text-left p-3 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700 hover:border-purple-500/30 rounded-lg text-sm text-gray-300 transition-all"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="text-blue-300 font-semibold mb-2">Tips for a great request:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Be specific about your collaboration idea</li>
                  <li>• Mention what value you can bring</li>
                  <li>• Keep it friendly and professional</li>
                  <li>• Include your availability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm p-6 border-t border-purple-500/20 rounded-b-2xl">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim() || message.length > 500 || sending}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                !message.trim() || message.length > 500 || sending
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
              }`}
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sending...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  <span>Send Request</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
