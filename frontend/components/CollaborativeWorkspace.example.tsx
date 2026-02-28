/**
 * Collaborative Workspace Example Component
 * 
 * This example demonstrates how to use the workspace collaboration hooks
 * to build a real-time collaborative editor with cursor tracking,
 * user presence, and operational transform.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useWorkspace, useCollaboration } from '@/hooks';
import type { CollaborativeUser } from '@/types/workspace';

interface CollaborativeWorkspaceProps {
  workspaceId: string;
  userId: string;
  userName: string;
  userEmail: string;
}

export function CollaborativeWorkspace({
  workspaceId,
  userId,
  userName,
  userEmail,
}: CollaborativeWorkspaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localContent, setLocalContent] = useState('');

  // User configuration
  const user: CollaborativeUser = {
    id: userId,
    name: userName,
    email: userEmail,
    color: generateUserColor(userId),
    isActive: true,
    lastSeen: Date.now(),
  };

  // WebSocket connection
  const {
    workspace,
    users,
    isConnected,
    isSyncing,
    error,
    version,
    reconnect,
  } = useWorkspace({
    workspaceId,
    userId,
    user,
    onEvent: (event) => {
      console.log('[Workspace Event]', event.type, event.data);
      
      // Handle specific events
      switch (event.type) {
        case 'user_joined':
          showNotification(`${event.data.user.name} joined the workspace`);
          break;
        case 'user_left':
          showNotification(`User left the workspace`);
          break;
        case 'error':
          showNotification(`Error: ${event.data.message}`, 'error');
          break;
      }
    },
  });

  // Collaborative editing
  const {
    content,
    cursors,
    selections,
    applyOperation,
    updateCursor,
    updateSelection,
    clearSelection,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCollaboration({
    workspaceId,
    userId,
    initialContent: workspace?.content || '',
    onContentChange: (newContent) => {
      setLocalContent(newContent);
    },
    onCursorChange: (cursors) => {
      console.log('[Cursors Updated]', cursors.size, 'cursors');
    },
    onSelectionChange: (selections) => {
      console.log('[Selections Updated]', selections.size, 'selections');
    },
  });

  // Sync local content with collaboration content
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    const oldLength = localContent.length;
    const newLength = newText.length;

    if (newLength > oldLength) {
      // Insert operation
      const insertedText = newText.slice(cursorPos - (newLength - oldLength), cursorPos);
      applyOperation({
        type: 'insert',
        position: cursorPos - (newLength - oldLength),
        content: insertedText,
      });
    } else if (newLength < oldLength) {
      // Delete operation
      applyOperation({
        type: 'delete',
        position: cursorPos,
        length: oldLength - newLength,
      });
    }

    setLocalContent(newText);
  };

  // Handle cursor movement
  const handleCursorMove = () => {
    if (textareaRef.current) {
      const { selectionStart } = textareaRef.current;
      const lines = localContent.slice(0, selectionStart).split('\n');
      const line = lines.length - 1;
      const column = lines[lines.length - 1].length;
      
      updateCursor(line, column);
    }
  };

  // Handle text selection
  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      
      if (selectionStart === selectionEnd) {
        clearSelection();
        return;
      }

      const startLines = localContent.slice(0, selectionStart).split('\n');
      const endLines = localContent.slice(0, selectionEnd).split('\n');
      
      const start = {
        line: startLines.length - 1,
        column: startLines[startLines.length - 1].length,
      };
      
      const end = {
        line: endLines.length - 1,
        column: endLines[endLines.length - 1].length,
      };
      
      updateSelection(start, end);
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === 'y') {
        e.preventDefault();
        redo();
      }
    }
  };

  return (
    <div className="collaborative-workspace">
      {/* Header */}
      <div className="workspace-header">
        <div className="workspace-info">
          <h2>{workspace?.name || 'Loading...'}</h2>
          <span className="version">v{version}</span>
        </div>

        {/* Connection Status */}
        <div className="connection-status">
          {isConnected ? (
            <span className="status-badge connected">
              <span className="status-dot"></span>
              Connected
            </span>
          ) : (
            <span className="status-badge disconnected">
              <span className="status-dot"></span>
              Disconnected
            </span>
          )}
          
          {isSyncing && (
            <span className="status-badge syncing">
              <span className="spinner"></span>
              Syncing...
            </span>
          )}
          
          {error && (
            <span className="status-badge error">
              ⚠️ {error}
            </span>
          )}
          
          {!isConnected && (
            <button onClick={reconnect} className="btn-reconnect">
              Reconnect
            </button>
          )}
        </div>

        {/* Active Users */}
        <div className="active-users">
          <span className="users-label">
            {users.length} {users.length === 1 ? 'user' : 'users'} online
          </span>
          <div className="users-list">
            {users.map((user) => (
              <div
                key={user.id}
                className="user-avatar"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name[0].toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="toolbar-btn"
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="toolbar-btn"
            title="Redo (Ctrl+Shift+Z)"
          >
            ↷ Redo
          </button>
        </div>

        <div className="toolbar-group">
          <span className="toolbar-info">
            {localContent.length} characters
          </span>
          <span className="toolbar-info">
            {localContent.split('\n').length} lines
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="editor-container">
        <div className="editor-wrapper">
          {/* Main textarea */}
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleTextChange}
            onSelect={handleSelectionChange}
            onKeyUp={handleCursorMove}
            onClick={handleCursorMove}
            onKeyDown={handleKeyDown}
            className="editor-textarea"
            placeholder="Start typing..."
            spellCheck={false}
          />

          {/* Remote cursors overlay */}
          <div className="cursors-overlay">
            {Array.from(cursors.entries())
              .filter(([cursorUserId]) => cursorUserId !== userId)
              .map(([cursorUserId, cursor]) => {
                const cursorUser = users.find((u) => u.id === cursorUserId);
                if (!cursorUser) return null;

                return (
                  <div
                    key={cursorUserId}
                    className="remote-cursor"
                    style={{
                      top: `${cursor.line * 20 + 10}px`,
                      left: `${cursor.column * 8.5 + 10}px`,
                      borderLeftColor: cursorUser.color,
                    }}
                  >
                    <div
                      className="cursor-label"
                      style={{ backgroundColor: cursorUser.color }}
                    >
                      {cursorUser.name}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Remote selections overlay */}
          <div className="selections-overlay">
            {Array.from(selections.entries())
              .filter(([selectionUserId]) => selectionUserId !== userId)
              .map(([selectionUserId, selection]) => {
                const selectionUser = users.find((u) => u.id === selectionUserId);
                if (!selectionUser) return null;

                const startOffset = getTextOffset(localContent, selection.start);
                const endOffset = getTextOffset(localContent, selection.end);

                return (
                  <div
                    key={selectionUserId}
                    className="remote-selection"
                    style={{
                      top: `${selection.start.line * 20 + 10}px`,
                      left: `${selection.start.column * 8.5 + 10}px`,
                      width: `${(selection.end.column - selection.start.column) * 8.5}px`,
                      height: `${(selection.end.line - selection.start.line + 1) * 20}px`,
                      backgroundColor: `${selectionUser.color}33`,
                      borderColor: selectionUser.color,
                    }}
                  />
                );
              })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="workspace-footer">
        <div className="footer-info">
          Last updated: {workspace?.updatedAt ? new Date(workspace.updatedAt).toLocaleString() : 'Never'}
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .collaborative-workspace {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #1e1e1e;
          color: #d4d4d4;
        }

        .workspace-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: #252526;
          border-bottom: 1px solid #3e3e42;
        }

        .workspace-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .workspace-info h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .version {
          font-size: 0.875rem;
          color: #858585;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .status-badge.connected {
          background: #1e3a1e;
          color: #4caf50;
        }

        .status-badge.disconnected {
          background: #3a1e1e;
          color: #f44336;
        }

        .status-badge.syncing {
          background: #1e2a3a;
          color: #2196f3;
        }

        .status-badge.error {
          background: #3a1e1e;
          color: #f44336;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }

        .active-users {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .users-label {
          font-size: 0.875rem;
          color: #858585;
        }

        .users-list {
          display: flex;
          gap: 0.25rem;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          color: white;
          cursor: pointer;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          background: #2d2d30;
          border-bottom: 1px solid #3e3e42;
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toolbar-btn {
          padding: 0.5rem 1rem;
          background: #3e3e42;
          border: none;
          border-radius: 0.25rem;
          color: #d4d4d4;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .toolbar-btn:hover:not(:disabled) {
          background: #4e4e52;
        }

        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toolbar-info {
          font-size: 0.875rem;
          color: #858585;
        }

        .editor-container {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        .editor-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .editor-textarea {
          width: 100%;
          height: 100%;
          padding: 1rem;
          background: #1e1e1e;
          color: #d4d4d4;
          border: none;
          outline: none;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          line-height: 20px;
          resize: none;
        }

        .cursors-overlay,
        .selections-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .remote-cursor {
          position: absolute;
          width: 2px;
          height: 20px;
          border-left: 2px solid;
          pointer-events: none;
          animation: blink 1s infinite;
        }

        .cursor-label {
          position: absolute;
          top: -20px;
          left: 0;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
          white-space: nowrap;
          color: white;
        }

        .remote-selection {
          position: absolute;
          border: 1px solid;
          pointer-events: none;
        }

        .workspace-footer {
          padding: 0.5rem 1rem;
          background: #252526;
          border-top: 1px solid #3e3e42;
          font-size: 0.875rem;
          color: #858585;
        }

        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Utility functions
function generateUserColor(userId: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

function getTextOffset(text: string, position: { line: number; column: number }): number {
  const lines = text.split('\n');
  let offset = 0;
  
  for (let i = 0; i < position.line && i < lines.length; i++) {
    offset += lines[i].length + 1; // +1 for newline
  }
  
  offset += position.column;
  return offset;
}

function showNotification(message: string, type: 'info' | 'error' = 'info') {
  // Implement your notification system here
  console.log(`[${type.toUpperCase()}]`, message);
}
