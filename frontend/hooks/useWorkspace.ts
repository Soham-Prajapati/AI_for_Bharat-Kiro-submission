import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Workspace,
  CollaborativeUser,
  WebSocketMessage,
  WebSocketMessageType,
  JoinWorkspacePayload,
  SyncWorkspacePayload,
  OperationPayload,
  UserJoinedPayload,
  UserLeftPayload,
  ErrorPayload,
  WorkspaceConfig,
  DEFAULT_WORKSPACE_CONFIG,
  WorkspaceEvent,
  WorkspaceEventType,
} from '@/types/workspace';

interface UseWorkspaceOptions {
  workspaceId: string;
  userId: string;
  user: CollaborativeUser;
  config?: Partial<WorkspaceConfig>;
  onEvent?: (event: WorkspaceEvent) => void;
}

interface UseWorkspaceReturn {
  workspace: Workspace | null;
  users: CollaborativeUser[];
  isConnected: boolean;
  isSyncing: boolean;
  error: string | null;
  version: number;
  sendMessage: <T = any>(type: WebSocketMessageType, data: T) => void;
  reconnect: () => void;
  disconnect: () => void;
}

/**
 * Custom hook for managing WebSocket connection to workspace
 * Handles connection lifecycle, message routing, and state synchronization
 */
export function useWorkspace(options: UseWorkspaceOptions): UseWorkspaceReturn {
  const { workspaceId, userId, user, config: userConfig, onEvent } = options;
  const config = { ...DEFAULT_WORKSPACE_CONFIG, ...userConfig };

  // WebSocket connection
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  // State
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [users, setUsers] = useState<CollaborativeUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  // Event emitter
  const emitEvent = useCallback(
    (type: WorkspaceEventType, data: any) => {
      const event: WorkspaceEvent = {
        type,
        workspaceId,
        data,
        timestamp: Date.now(),
      };
      onEvent?.(event);
    },
    [workspaceId, onEvent]
  );

  // Send message through WebSocket
  const sendMessage = useCallback(
    <T = any>(type: WebSocketMessageType, data: T) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const message: WebSocketMessage<T> = {
          type,
          workspaceId,
          userId,
          data,
          timestamp: Date.now(),
          messageId: `${userId}-${Date.now()}-${Math.random()}`,
        };
        ws.current.send(JSON.stringify(message));
      } else {
        console.warn('[useWorkspace] Cannot send message: not connected');
      }
    },
    [workspaceId, userId]
  );

  // Handle incoming WebSocket messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'workspace:sync': {
            const payload = message.data as SyncWorkspacePayload;
            setWorkspace(payload.workspace);
            setUsers(payload.users);
            setVersion(payload.version);
            setIsSyncing(false);
            emitEvent('synced', payload);
            break;
          }

          case 'workspace:user_joined': {
            const payload = message.data as UserJoinedPayload;
            setUsers((prev) => {
              const exists = prev.some((u) => u.id === payload.user.id);
              return exists ? prev : [...prev, payload.user];
            });
            emitEvent('user_joined', payload.user);
            break;
          }

          case 'workspace:user_left': {
            const payload = message.data as UserLeftPayload;
            setUsers((prev) => prev.filter((u) => u.id !== payload.userId));
            emitEvent('user_left', payload);
            break;
          }

          case 'workspace:operation': {
            const payload = message.data as OperationPayload;
            setVersion(payload.version);
            emitEvent('operation_applied', payload);
            break;
          }

          case 'workspace:error': {
            const payload = message.data as ErrorPayload;
            setError(payload.message);
            emitEvent('error', payload);
            break;
          }

          case 'workspace:ack': {
            // Acknowledgment received, operation confirmed
            break;
          }

          default:
            console.warn('[useWorkspace] Unknown message type:', message.type);
        }
      } catch (err) {
        console.error('[useWorkspace] Failed to parse message:', err);
      }
    },
    [emitEvent]
  );

  // Start heartbeat to keep connection alive
  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }

    heartbeatInterval.current = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        sendMessage('workspace:presence', {
          presence: {
            userId,
            cursor: null,
            selection: null,
            isTyping: false,
            lastActivity: Date.now(),
          },
        });
      }
    }, config.heartbeatInterval);
  }, [sendMessage, userId, config.heartbeatInterval]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    try {
      // Close existing connection
      if (ws.current) {
        ws.current.close();
      }

      // Build WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
      const wsUrl = `${protocol}//${host}/ws/workspace/${workspaceId}`;

      console.log('[useWorkspace] Connecting to:', wsUrl);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('[useWorkspace] Connected');
        setIsConnected(true);
        setError(null);
        reconnectCount.current = 0;
        setIsSyncing(true);

        // Join workspace
        const joinPayload: JoinWorkspacePayload = {
          workspaceId,
          userId,
          user,
        };
        sendMessage('workspace:join', joinPayload);

        // Start heartbeat
        startHeartbeat();

        emitEvent('connected', { workspaceId });
      };

      ws.current.onmessage = handleMessage;

      ws.current.onclose = () => {
        console.log('[useWorkspace] Disconnected');
        setIsConnected(false);
        stopHeartbeat();
        emitEvent('disconnected', { workspaceId });

        // Attempt reconnection
        if (reconnectCount.current < config.reconnectAttempts) {
          reconnectCount.current++;
          console.log(
            `[useWorkspace] Reconnecting... (${reconnectCount.current}/${config.reconnectAttempts})`
          );

          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, config.reconnectInterval);
        } else {
          setError('Failed to connect after multiple attempts');
        }
      };

      ws.current.onerror = (event) => {
        console.error('[useWorkspace] WebSocket error:', event);
        setError('WebSocket connection error');
        emitEvent('error', { message: 'WebSocket connection error' });
      };
    } catch (err) {
      console.error('[useWorkspace] Connection failed:', err);
      setError('Failed to establish WebSocket connection');
    }
  }, [
    workspaceId,
    userId,
    user,
    config.reconnectAttempts,
    config.reconnectInterval,
    sendMessage,
    handleMessage,
    startHeartbeat,
    stopHeartbeat,
    emitEvent,
  ]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    reconnectCount.current = 0;
    connect();
  }, [connect]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    stopHeartbeat();

    if (ws.current) {
      sendMessage('workspace:leave', { workspaceId, userId });
      ws.current.close();
      ws.current = null;
    }

    setIsConnected(false);
  }, [workspaceId, userId, sendMessage, stopHeartbeat]);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    workspace,
    users,
    isConnected,
    isSyncing,
    error,
    version,
    sendMessage,
    reconnect,
    disconnect,
  };
}
