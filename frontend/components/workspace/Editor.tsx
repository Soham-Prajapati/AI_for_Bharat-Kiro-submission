'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserPresence } from '@/types/workspace';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  activeUsers: UserPresence[];
  onCursorMove: (position: { line: number; column: number }) => void;
  readOnly?: boolean;
}

export default function Editor({
  content,
  onChange,
  activeUsers,
  onCursorMove,
  readOnly = false,
}: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleCursorMove = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const position = textarea.selectionStart;
      const lines = textarea.value.substring(0, position).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length;
      onCursorMove({ line, column });
    }
  };

  return (
    <div className="relative h-full">
      {/* Editor toolbar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Bold"
            aria-label="Bold"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Italic"
            aria-label="Italic"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Underline"
            aria-label="Underline"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20h10M7 4v8a5 5 0 0010 0V4" />
            </svg>
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Heading"
            aria-label="Heading"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Bullet list"
            aria-label="Bullet list"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Numbered list"
            aria-label="Numbered list"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Editor content */}
      <div className="relative h-[calc(100%-60px)]">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onSelect={handleCursorMove}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          readOnly={readOnly}
          placeholder="Start typing..."
          className="w-full h-full px-8 py-6 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 resize-none focus:outline-none text-base leading-relaxed"
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            minHeight: '100%',
          }}
        />

        {/* Cursor indicators for other users */}
        {activeUsers
          .filter((user) => user.cursorPosition)
          .map((user) => (
            <div
              key={user.userId}
              className="absolute pointer-events-none"
              style={{
                top: `${(user.cursorPosition?.line || 0) * 24}px`,
                left: `${(user.cursorPosition?.column || 0) * 8 + 32}px`,
              }}
            >
              <div
                className="w-0.5 h-5 animate-pulse"
                style={{ backgroundColor: user.user.color }}
              />
              <div
                className="absolute top-0 left-1 px-2 py-0.5 text-xs text-white rounded whitespace-nowrap"
                style={{ backgroundColor: user.user.color }}
              >
                {user.user.name}
              </div>
            </div>
          ))}
      </div>

      {/* Status bar */}
      <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>{content.split(/\s+/).filter(Boolean).length} words</span>
            <span>{content.length} characters</span>
          </div>
          {isFocused && (
            <span className="text-green-600 dark:text-green-400">● Editing</span>
          )}
        </div>
      </div>
    </div>
  );
}
