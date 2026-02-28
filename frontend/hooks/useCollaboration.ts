import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Operation,
  OperationType,
  CursorPosition,
  TextSelection,
  UserPresence,
  OptimisticUpdate,
  UpdateQueue,
  TransformResult,
  ConflictResolution,
  WorkspaceConfig,
  DEFAULT_WORKSPACE_CONFIG,
} from '@/types/workspace';
import { useWorkspace } from './useWorkspace';

interface UseCollaborationOptions {
  workspaceId: string;
  userId: string;
  initialContent?: string;
  config?: Partial<WorkspaceConfig>;
  onContentChange?: (content: string) => void;
  onCursorChange?: (cursors: Map<string, CursorPosition>) => void;
  onSelectionChange?: (selections: Map<string, TextSelection>) => void;
}

interface UseCollaborationReturn {
  content: string;
  cursors: Map<string, CursorPosition>;
  selections: Map<string, TextSelection>;
  presences: Map<string, UserPresence>;
  applyOperation: (operation: Omit<Operation, 'userId' | 'timestamp'>) => void;
  updateCursor: (line: number, column: number) => void;
  updateSelection: (start: { line: number; column: number }, end: { line: number; column: number }) => void;
  clearSelection: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Custom hook for real-time collaborative editing
 * Implements Operational Transform for conflict resolution
 */
export function useCollaboration(options: UseCollaborationOptions): UseCollaborationReturn {
  const {
    workspaceId,
    userId,
    initialContent = '',
    config: userConfig,
    onContentChange,
    onCursorChange,
    onSelectionChange,
  } = options;

  const config = { ...DEFAULT_WORKSPACE_CONFIG, ...userConfig };

  // Content state
  const [content, setContent] = useState(initialContent);
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [selections, setSelections] = useState<Map<string, TextSelection>>(new Map());
  const [presences, setPresences] = useState<Map<string, UserPresence>>(new Map());

  // Operation queues
  const updateQueue = useRef<UpdateQueue>({
    pending: [],
    confirmed: [],
    rejected: [],
  });

  // History for undo/redo
  const history = useRef<Operation[]>([]);
  const historyIndex = useRef(0);

  // Batching
  const operationBatch = useRef<Operation[]>([]);
  const batchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Throttling
  const cursorThrottle = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection (not initialized here, would be passed or created)
  const { sendMessage, version } = useWorkspace({
    workspaceId,
    userId,
    user: {
      id: userId,
      name: 'User',
      email: '',
      color: generateUserColor(userId),
      isActive: true,
      lastSeen: Date.now(),
    },
    config: userConfig,
    onEvent: (event) => {
      if (event.type === 'operation_applied') {
        handleRemoteOperation(event.data.operation);
      } else if (event.type === 'cursor_moved') {
        handleRemoteCursor(event.data);
      } else if (event.type === 'selection_changed') {
        handleRemoteSelection(event.data);
      }
    },
  });

  // ============================================================================
  // OPERATIONAL TRANSFORM
  // ============================================================================

  /**
   * Transform two concurrent operations
   * Returns transformed versions that can be applied in any order
   */
  const transformOperations = useCallback(
    (op1: Operation, op2: Operation): TransformResult => {
      // Insert vs Insert
      if (op1.type === 'insert' && op2.type === 'insert') {
        if (op1.position < op2.position) {
          return {
            transformed: op2,
            inverse: { ...op1, position: op1.position },
          };
        } else if (op1.position > op2.position) {
          return {
            transformed: { ...op2, position: op2.position },
            inverse: { ...op1, position: op1.position + (op2.content?.length || 0) },
          };
        } else {
          // Same position, use userId to break tie
          if (op1.userId < op2.userId) {
            return {
              transformed: { ...op2, position: op2.position + (op1.content?.length || 0) },
              inverse: op1,
            };
          } else {
            return {
              transformed: op2,
              inverse: { ...op1, position: op1.position + (op2.content?.length || 0) },
            };
          }
        }
      }

      // Insert vs Delete
      if (op1.type === 'insert' && op2.type === 'delete') {
        if (op1.position <= op2.position) {
          return {
            transformed: { ...op2, position: op2.position + (op1.content?.length || 0) },
            inverse: op1,
          };
        } else if (op1.position > op2.position + (op2.length || 0)) {
          return {
            transformed: op2,
            inverse: { ...op1, position: op1.position - (op2.length || 0) },
          };
        } else {
          // Insert is within deleted range
          return {
            transformed: { ...op2, length: (op2.length || 0) + (op1.content?.length || 0) },
            inverse: { ...op1, position: op2.position },
          };
        }
      }

      // Delete vs Insert
      if (op1.type === 'delete' && op2.type === 'insert') {
        if (op2.position <= op1.position) {
          return {
            transformed: op2,
            inverse: { ...op1, position: op1.position + (op2.content?.length || 0) },
          };
        } else if (op2.position >= op1.position + (op1.length || 0)) {
          return {
            transformed: { ...op2, position: op2.position - (op1.length || 0) },
            inverse: op1,
          };
        } else {
          // Insert is within deleted range
          return {
            transformed: { ...op2, position: op1.position },
            inverse: { ...op1, length: (op1.length || 0) + (op2.content?.length || 0) },
          };
        }
      }

      // Delete vs Delete
      if (op1.type === 'delete' && op2.type === 'delete') {
        if (op1.position + (op1.length || 0) <= op2.position) {
          return {
            transformed: { ...op2, position: op2.position - (op1.length || 0) },
            inverse: op1,
          };
        } else if (op2.position + (op2.length || 0) <= op1.position) {
          return {
            transformed: op2,
            inverse: { ...op1, position: op1.position - (op2.length || 0) },
          };
        } else {
          // Overlapping deletes
          const start = Math.min(op1.position, op2.position);
          const end1 = op1.position + (op1.length || 0);
          const end2 = op2.position + (op2.length || 0);
          const end = Math.max(end1, end2);

          return {
            transformed: { ...op2, position: start, length: end - start - (op1.length || 0) },
            inverse: { ...op1, position: start, length: end - start - (op2.length || 0) },
          };
        }
      }

      // Default: no transformation needed
      return { transformed: op2, inverse: op1 };
    },
    []
  );

  /**
   * Apply operation to content
   */
  const applyOperationToContent = useCallback((content: string, operation: Operation): string => {
    switch (operation.type) {
      case 'insert':
        return (
          content.slice(0, operation.position) +
          (operation.content || '') +
          content.slice(operation.position)
        );

      case 'delete':
        return (
          content.slice(0, operation.position) +
          content.slice(operation.position + (operation.length || 0))
        );

      case 'retain':
        return content;

      default:
        return content;
    }
  }, []);

  // ============================================================================
  // OPERATION HANDLING
  // ============================================================================

  /**
   * Apply local operation with optimistic update
   */
  const applyOperation = useCallback(
    (operation: Omit<Operation, 'userId' | 'timestamp'>) => {
      const fullOperation: Operation = {
        ...operation,
        userId,
        timestamp: Date.now(),
      };

      // Apply optimistically
      const newContent = applyOperationToContent(content, fullOperation);
      setContent(newContent);
      onContentChange?.(newContent);

      // Add to history
      history.current = history.current.slice(0, historyIndex.current + 1);
      history.current.push(fullOperation);
      historyIndex.current++;

      // Trim history if too large
      if (history.current.length > config.maxHistorySize) {
        history.current = history.current.slice(-config.maxHistorySize);
        historyIndex.current = history.current.length - 1;
      }

      // Add to optimistic update queue
      const optimisticUpdate: OptimisticUpdate = {
        id: `${userId}-${Date.now()}-${Math.random()}`,
        operation: fullOperation,
        localVersion: version,
        status: 'pending',
        timestamp: Date.now(),
        retryCount: 0,
      };
      updateQueue.current.pending.push(optimisticUpdate);

      // Batch operations
      operationBatch.current.push(fullOperation);

      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }

      batchTimeout.current = setTimeout(() => {
        if (operationBatch.current.length > 0) {
          // Send batched operations
          operationBatch.current.forEach((op) => {
            sendMessage('workspace:operation', {
              operation: op,
              version: version + 1,
            });
          });
          operationBatch.current = [];
        }
      }, config.operationBatchDelay);
    },
    [
      userId,
      content,
      version,
      config.maxHistorySize,
      config.operationBatchDelay,
      applyOperationToContent,
      onContentChange,
      sendMessage,
    ]
  );

  /**
   * Handle remote operation from another user
   */
  const handleRemoteOperation = useCallback(
    (remoteOp: Operation) => {
      // Transform against pending operations
      let transformedOp = remoteOp;

      for (const update of updateQueue.current.pending) {
        const result = transformOperations(update.operation, transformedOp);
        transformedOp = result.transformed;
      }

      // Apply transformed operation
      const newContent = applyOperationToContent(content, transformedOp);
      setContent(newContent);
      onContentChange?.(newContent);
    },
    [content, transformOperations, applyOperationToContent, onContentChange]
  );

  // ============================================================================
  // CURSOR & SELECTION
  // ============================================================================

  /**
   * Update local cursor position
   */
  const updateCursor = useCallback(
    (line: number, column: number) => {
      if (cursorThrottle.current) {
        clearTimeout(cursorThrottle.current);
      }

      cursorThrottle.current = setTimeout(() => {
        const cursor: CursorPosition = {
          userId,
          line,
          column,
          timestamp: Date.now(),
        };

        sendMessage('workspace:cursor', { cursor });
      }, config.cursorUpdateThrottle);
    },
    [userId, config.cursorUpdateThrottle, sendMessage]
  );

  /**
   * Update local selection
   */
  const updateSelection = useCallback(
    (start: { line: number; column: number }, end: { line: number; column: number }) => {
      const selection: TextSelection = {
        userId,
        start,
        end,
        timestamp: Date.now(),
      };

      sendMessage('workspace:selection', { selection });
    },
    [userId, sendMessage]
  );

  /**
   * Clear local selection
   */
  const clearSelection = useCallback(() => {
    sendMessage('workspace:selection', { selection: null });
  }, [sendMessage]);

  /**
   * Handle remote cursor update
   */
  const handleRemoteCursor = useCallback(
    (data: { cursor: CursorPosition }) => {
      setCursors((prev) => {
        const next = new Map(prev);
        next.set(data.cursor.userId, data.cursor);
        return next;
      });
      onCursorChange?.(cursors);
    },
    [cursors, onCursorChange]
  );

  /**
   * Handle remote selection update
   */
  const handleRemoteSelection = useCallback(
    (data: { selection: TextSelection | null }) => {
      if (data.selection) {
        setSelections((prev) => {
          const next = new Map(prev);
          next.set(data.selection!.userId, data.selection!);
          return next;
        });
      } else {
        setSelections((prev) => {
          const next = new Map(prev);
          next.delete(userId);
          return next;
        });
      }
      onSelectionChange?.(selections);
    },
    [userId, selections, onSelectionChange]
  );

  // ============================================================================
  // UNDO / REDO
  // ============================================================================

  const undo = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      const operation = history.current[historyIndex.current];

      // Create inverse operation
      let inverseOp: Operation;
      if (operation.type === 'insert') {
        inverseOp = {
          type: 'delete',
          position: operation.position,
          length: operation.content?.length || 0,
          userId,
          timestamp: Date.now(),
        };
      } else if (operation.type === 'delete') {
        inverseOp = {
          type: 'insert',
          position: operation.position,
          content: '', // Would need to store deleted content
          userId,
          timestamp: Date.now(),
        };
      } else {
        return;
      }

      const newContent = applyOperationToContent(content, inverseOp);
      setContent(newContent);
      onContentChange?.(newContent);

      sendMessage('workspace:operation', {
        operation: inverseOp,
        version: version + 1,
      });
    }
  }, [userId, content, version, applyOperationToContent, onContentChange, sendMessage]);

  const redo = useCallback(() => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current++;
      const operation = history.current[historyIndex.current];

      const newContent = applyOperationToContent(content, operation);
      setContent(newContent);
      onContentChange?.(newContent);

      sendMessage('workspace:operation', {
        operation,
        version: version + 1,
      });
    }
  }, [content, version, applyOperationToContent, onContentChange, sendMessage]);

  const canUndo = historyIndex.current > 0;
  const canRedo = historyIndex.current < history.current.length - 1;

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }
      if (cursorThrottle.current) {
        clearTimeout(cursorThrottle.current);
      }
    };
  }, []);

  return {
    content,
    cursors,
    selections,
    presences,
    applyOperation,
    updateCursor,
    updateSelection,
    clearSelection,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Generate consistent color for user based on ID
 */
function generateUserColor(userId: string): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
    '#F8B739',
    '#52B788',
  ];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
