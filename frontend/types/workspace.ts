/**
 * Workspace Collaboration Types
 * Real-time collaborative editing with Operational Transform
 */

// ============================================================================
// CORE WORKSPACE TYPES
// ============================================================================

export interface Workspace {
  id: string;
  name: string;
  content: string;
  version: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: WorkspaceMetadata;
}

export interface WorkspaceMetadata {
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  lastEditedBy?: string;
}

// ============================================================================
// COLLABORATION TYPES
// ============================================================================

export interface CollaborativeUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string; // Unique color for cursor/selection
  isActive: boolean;
  lastSeen: number;
}

export interface CursorPosition {
  userId: string;
  line: number;
  column: number;
  timestamp: number;
}

export interface TextSelection {
  userId: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
  timestamp: number;
}

export interface UserPresence {
  userId: string;
  user: User;
  cursor?: CursorPosition | null;
  selection?: TextSelection | null;
  isTyping: boolean;
  lastActive: Date;
  lastActivity?: number;
  cursorPosition?: { line: number; column: number };
}

// ============================================================================
// WORKSPACE UI TYPES
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
}

export interface Reply {
  id: string;
  commentId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  workspaceId: string;
  userId: string;
  user: User;
  content: string;
  position: { line: number; column: number };
  resolved: boolean;
  replies: Reply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VersionHistoryEntry {
  id: string;
  workspaceId: string;
  version: number;
  userId: string;
  user: User;
  changes: string;
  content: string;
  timestamp: Date;
}

// ============================================================================
// OPERATIONAL TRANSFORM TYPES
// ============================================================================

export type OperationType = 'insert' | 'delete' | 'retain';

export interface Operation {
  type: OperationType;
  position: number;
  content?: string; // For insert operations
  length?: number; // For delete/retain operations
  userId: string;
  timestamp: number;
}

export interface OperationTransform {
  operation: Operation;
  baseVersion: number;
  resultVersion: number;
}

export interface TransformResult {
  transformed: Operation;
  inverse: Operation;
}

// ============================================================================
// WEBSOCKET MESSAGE TYPES
// ============================================================================

export type WebSocketMessageType =
  | 'workspace:join'
  | 'workspace:leave'
  | 'workspace:sync'
  | 'workspace:operation'
  | 'workspace:cursor'
  | 'workspace:selection'
  | 'workspace:presence'
  | 'workspace:user_joined'
  | 'workspace:user_left'
  | 'workspace:error'
  | 'workspace:ack';

export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  workspaceId: string;
  userId: string;
  data: T;
  timestamp: number;
  messageId?: string;
}

// Specific message payloads
export interface JoinWorkspacePayload {
  workspaceId: string;
  userId: string;
  user: CollaborativeUser;
}

export interface LeaveWorkspacePayload {
  workspaceId: string;
  userId: string;
}

export interface SyncWorkspacePayload {
  workspace: Workspace;
  users: CollaborativeUser[];
  version: number;
}

export interface OperationPayload {
  operation: Operation;
  version: number;
}

export interface CursorPayload {
  cursor: CursorPosition;
}

export interface SelectionPayload {
  selection: TextSelection | null;
}

export interface PresencePayload {
  presence: UserPresence;
}

export interface UserJoinedPayload {
  user: CollaborativeUser;
}

export interface UserLeftPayload {
  userId: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: any;
}

export interface AckPayload {
  messageId: string;
  success: boolean;
  version?: number;
}

// ============================================================================
// COLLABORATION STATE
// ============================================================================

export interface CollaborationState {
  workspace: Workspace | null;
  users: Map<string, CollaborativeUser>;
  presences: Map<string, UserPresence>;
  pendingOperations: Operation[];
  version: number;
  isConnected: boolean;
  isSyncing: boolean;
  error: string | null;
}

// ============================================================================
// CONFLICT RESOLUTION
// ============================================================================

export interface ConflictResolution {
  localOperation: Operation;
  remoteOperation: Operation;
  resolved: Operation;
  strategy: 'local-wins' | 'remote-wins' | 'merge' | 'transform';
}

export interface OperationHistory {
  operations: Operation[];
  version: number;
  timestamp: number;
}

// ============================================================================
// OPTIMISTIC UPDATE TYPES
// ============================================================================

export interface OptimisticUpdate {
  id: string;
  operation: Operation;
  localVersion: number;
  status: 'pending' | 'confirmed' | 'rejected';
  timestamp: number;
  retryCount: number;
}

export interface UpdateQueue {
  pending: OptimisticUpdate[];
  confirmed: OptimisticUpdate[];
  rejected: OptimisticUpdate[];
}

// ============================================================================
// WORKSPACE EVENTS
// ============================================================================

export type WorkspaceEventType =
  | 'connected'
  | 'disconnected'
  | 'synced'
  | 'operation_applied'
  | 'user_joined'
  | 'user_left'
  | 'cursor_moved'
  | 'selection_changed'
  | 'error'
  | 'conflict_resolved';

export interface WorkspaceEvent<T = any> {
  type: WorkspaceEventType;
  workspaceId: string;
  data: T;
  timestamp: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface WorkspaceConfig {
  reconnectAttempts: number;
  reconnectInterval: number;
  heartbeatInterval: number;
  operationBatchSize: number;
  operationBatchDelay: number;
  cursorUpdateThrottle: number;
  presenceUpdateInterval: number;
  maxHistorySize: number;
}

export const DEFAULT_WORKSPACE_CONFIG: WorkspaceConfig = {
  reconnectAttempts: 5,
  reconnectInterval: 3000,
  heartbeatInterval: 30000,
  operationBatchSize: 10,
  operationBatchDelay: 100,
  cursorUpdateThrottle: 50,
  presenceUpdateInterval: 5000,
  maxHistorySize: 1000,
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface WorkspacePermissions {
  canEdit: boolean;
  canInvite: boolean;
  canDelete: boolean;
  isOwner: boolean;
}

export interface WorkspaceStats {
  totalEdits: number;
  activeUsers: number;
  lastEditTime: number;
  collaborationTime: number;
}
