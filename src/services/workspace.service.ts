/**
 * Collaborative Workspace Service
 * Real-time collaborative editing for content with conflict resolution,
 * user presence tracking, and version history
 */

interface User {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  color: string; // For cursor/highlight color
}

interface UserPresence {
  userId: string;
  name: string;
  color: string;
  cursorPosition?: number;
  selection?: { start: number; end: number };
  lastActive: Date;
  isActive: boolean;
}

interface Change {
  changeId: string;
  userId: string;
  timestamp: Date;
  operation: Operation;
  version: number;
}

interface Operation {
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content?: string;
  length?: number; // For delete operations
  oldContent?: string; // For replace operations
}

interface Workspace {
  workspaceId: string;
  name: string;
  content: string;
  version: number;
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  users: User[];
  changes: Change[];
  permissions: WorkspacePermissions;
}

interface WorkspacePermissions {
  owner: string;
  editors: string[];
  viewers: string[];
  isPublic: boolean;
}

interface Comment {
  commentId: string;
  userId: string;
  userName: string;
  content: string;
  position: number;
  timestamp: Date;
  resolved: boolean;
  replies: CommentReply[];
}

interface CommentReply {
  replyId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

interface VersionSnapshot {
  version: number;
  content: string;
  timestamp: Date;
  userId: string;
  changeDescription: string;
}

export class WorkspaceService {
  private workspaces: Map<string, Workspace>;
  private userPresence: Map<string, Map<string, UserPresence>>; // workspaceId -> userId -> presence
  private comments: Map<string, Comment[]>; // workspaceId -> comments
  private versionHistory: Map<string, VersionSnapshot[]>; // workspaceId -> snapshots

  constructor() {
    this.workspaces = new Map();
    this.userPresence = new Map();
    this.comments = new Map();
    this.versionHistory = new Map();
  }

  /**
   * Create a new workspace
   */
  createWorkspace(
    name: string,
    initialContent: string,
    createdBy: User,
    permissions?: Partial<WorkspacePermissions>
  ): Workspace {
    const workspaceId = this.generateId();
    const now = new Date();

    const workspace: Workspace = {
      workspaceId,
      name,
      content: initialContent,
      version: 1,
      createdBy: createdBy.userId,
      createdAt: now,
      lastModified: now,
      users: [createdBy],
      changes: [],
      permissions: {
        owner: createdBy.userId,
        editors: permissions?.editors || [],
        viewers: permissions?.viewers || [],
        isPublic: permissions?.isPublic || false,
      },
    };

    this.workspaces.set(workspaceId, workspace);
    this.userPresence.set(workspaceId, new Map());
    this.comments.set(workspaceId, []);
    this.versionHistory.set(workspaceId, [
      {
        version: 1,
        content: initialContent,
        timestamp: now,
        userId: createdBy.userId,
        changeDescription: 'Initial version',
      },
    ]);

    return workspace;
  }

  /**
   * Get workspace by ID
   */
  getWorkspace(workspaceId: string): Workspace | undefined {
    return this.workspaces.get(workspaceId);
  }

  /**
   * Join workspace (add user to active users)
   */
  joinWorkspace(workspaceId: string, user: User): { success: boolean; workspace?: Workspace; error?: string } {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      return { success: false, error: 'Workspace not found' };
    }

    // Check permissions
    if (!this.canAccess(workspace, user.userId)) {
      return { success: false, error: 'Access denied' };
    }

    // Add user if not already in workspace
    if (!workspace.users.find((u) => u.userId === user.userId)) {
      workspace.users.push(user);
    }

    // Initialize user presence
    const presence = this.userPresence.get(workspaceId)!;
    presence.set(user.userId, {
      userId: user.userId,
      name: user.name,
      color: user.color,
      lastActive: new Date(),
      isActive: true,
    });

    return { success: true, workspace };
  }

  /**
   * Leave workspace (remove user from active users)
   */
  leaveWorkspace(workspaceId: string, userId: string): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    // Mark user as inactive
    const presence = this.userPresence.get(workspaceId);
    if (presence) {
      const userPresence = presence.get(userId);
      if (userPresence) {
        userPresence.isActive = false;
      }
    }

    // Remove from active users list after delay (keep for history)
    setTimeout(() => {
      workspace.users = workspace.users.filter((u) => u.userId !== userId);
    }, 5000);
  }

  /**
   * Apply operation to workspace (with Operational Transform)
   */
  applyOperation(
    workspaceId: string,
    userId: string,
    operation: Operation,
    clientVersion: number
  ): { success: boolean; newVersion?: number; transformedOperation?: Operation; error?: string } {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      return { success: false, error: 'Workspace not found' };
    }

    // Check permissions
    if (!this.canEdit(workspace, userId)) {
      return { success: false, error: 'Edit permission denied' };
    }

    // Transform operation if client is behind
    let transformedOp = operation;
    if (clientVersion < workspace.version) {
      const missedChanges = workspace.changes.filter((c) => c.version > clientVersion);
      transformedOp = this.transformOperation(operation, missedChanges);
    }

    // Apply operation to content
    const result = this.applyOperationToContent(workspace.content, transformedOp);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Update workspace
    workspace.content = result.content!;
    workspace.version++;
    workspace.lastModified = new Date();

    // Record change
    const change: Change = {
      changeId: this.generateId(),
      userId,
      timestamp: new Date(),
      operation: transformedOp,
      version: workspace.version,
    };
    workspace.changes.push(change);

    // Create version snapshot every 10 changes
    if (workspace.changes.length % 10 === 0) {
      this.createVersionSnapshot(workspaceId, userId, 'Auto-save checkpoint');
    }

    return {
      success: true,
      newVersion: workspace.version,
      transformedOperation: transformedOp,
    };
  }

  /**
   * Operational Transform: Transform operation based on concurrent changes
   */
  private transformOperation(operation: Operation, concurrentChanges: Change[]): Operation {
    let transformedOp = { ...operation };

    for (const change of concurrentChanges) {
      const concurrentOp = change.operation;

      // Transform based on operation types
      if (concurrentOp.type === 'insert') {
        // If concurrent insert happened before our operation, shift position
        if (concurrentOp.position <= transformedOp.position) {
          transformedOp.position += concurrentOp.content?.length || 0;
        }
      } else if (concurrentOp.type === 'delete') {
        // If concurrent delete happened before our operation, shift position
        if (concurrentOp.position < transformedOp.position) {
          transformedOp.position -= Math.min(
            concurrentOp.length || 0,
            transformedOp.position - concurrentOp.position
          );
        }
      } else if (concurrentOp.type === 'replace') {
        // Handle replace operations
        const oldLen = concurrentOp.oldContent?.length || 0;
        const newLen = concurrentOp.content?.length || 0;
        if (concurrentOp.position < transformedOp.position) {
          transformedOp.position += newLen - oldLen;
        }
      }
    }

    return transformedOp;
  }

  /**
   * Apply operation to content string
   */
  private applyOperationToContent(
    content: string,
    operation: Operation
  ): { success: boolean; content?: string; error?: string } {
    try {
      let newContent = content;

      switch (operation.type) {
        case 'insert':
          if (operation.position < 0 || operation.position > content.length) {
            return { success: false, error: 'Invalid insert position' };
          }
          newContent =
            content.slice(0, operation.position) + (operation.content || '') + content.slice(operation.position);
          break;

        case 'delete':
          if (operation.position < 0 || operation.position >= content.length) {
            return { success: false, error: 'Invalid delete position' };
          }
          const deleteEnd = Math.min(operation.position + (operation.length || 0), content.length);
          newContent = content.slice(0, operation.position) + content.slice(deleteEnd);
          break;

        case 'replace':
          if (operation.position < 0 || operation.position >= content.length) {
            return { success: false, error: 'Invalid replace position' };
          }
          const replaceEnd = Math.min(
            operation.position + (operation.oldContent?.length || 0),
            content.length
          );
          newContent =
            content.slice(0, operation.position) + (operation.content || '') + content.slice(replaceEnd);
          break;

        default:
          return { success: false, error: 'Unknown operation type' };
      }

      return { success: true, content: newContent };
    } catch (error) {
      return { success: false, error: 'Failed to apply operation' };
    }
  }

  /**
   * Update user presence (cursor position, selection)
   */
  updatePresence(
    workspaceId: string,
    userId: string,
    cursorPosition?: number,
    selection?: { start: number; end: number }
  ): void {
    const presence = this.userPresence.get(workspaceId);
    if (!presence) return;

    const userPresence = presence.get(userId);
    if (!userPresence) return;

    userPresence.cursorPosition = cursorPosition;
    userPresence.selection = selection;
    userPresence.lastActive = new Date();
    userPresence.isActive = true;
  }

  /**
   * Get all active users in workspace
   */
  getActiveUsers(workspaceId: string): UserPresence[] {
    const presence = this.userPresence.get(workspaceId);
    if (!presence) return [];

    return Array.from(presence.values()).filter((p) => p.isActive);
  }

  /**
   * Add comment to workspace
   */
  addComment(workspaceId: string, userId: string, userName: string, content: string, position: number): Comment {
    const comment: Comment = {
      commentId: this.generateId(),
      userId,
      userName,
      content,
      position,
      timestamp: new Date(),
      resolved: false,
      replies: [],
    };

    const comments = this.comments.get(workspaceId) || [];
    comments.push(comment);
    this.comments.set(workspaceId, comments);

    return comment;
  }

  /**
   * Reply to comment
   */
  replyToComment(workspaceId: string, commentId: string, userId: string, userName: string, content: string): void {
    const comments = this.comments.get(workspaceId);
    if (!comments) return;

    const comment = comments.find((c) => c.commentId === commentId);
    if (!comment) return;

    comment.replies.push({
      replyId: this.generateId(),
      userId,
      userName,
      content,
      timestamp: new Date(),
    });
  }

  /**
   * Resolve comment
   */
  resolveComment(workspaceId: string, commentId: string): void {
    const comments = this.comments.get(workspaceId);
    if (!comments) return;

    const comment = comments.find((c) => c.commentId === commentId);
    if (comment) {
      comment.resolved = true;
    }
  }

  /**
   * Get all comments for workspace
   */
  getComments(workspaceId: string, includeResolved: boolean = false): Comment[] {
    const comments = this.comments.get(workspaceId) || [];
    return includeResolved ? comments : comments.filter((c) => !c.resolved);
  }

  /**
   * Create version snapshot
   */
  createVersionSnapshot(workspaceId: string, userId: string, description: string): VersionSnapshot {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const snapshot: VersionSnapshot = {
      version: workspace.version,
      content: workspace.content,
      timestamp: new Date(),
      userId,
      changeDescription: description,
    };

    const history = this.versionHistory.get(workspaceId) || [];
    history.push(snapshot);
    this.versionHistory.set(workspaceId, history);

    return snapshot;
  }

  /**
   * Get version history
   */
  getVersionHistory(workspaceId: string): VersionSnapshot[] {
    return this.versionHistory.get(workspaceId) || [];
  }

  /**
   * Restore to specific version
   */
  restoreVersion(workspaceId: string, version: number, userId: string): { success: boolean; error?: string } {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      return { success: false, error: 'Workspace not found' };
    }

    if (!this.canEdit(workspace, userId)) {
      return { success: false, error: 'Edit permission denied' };
    }

    const history = this.versionHistory.get(workspaceId);
    if (!history) {
      return { success: false, error: 'No version history found' };
    }

    const snapshot = history.find((s) => s.version === version);
    if (!snapshot) {
      return { success: false, error: 'Version not found' };
    }

    // Restore content
    workspace.content = snapshot.content;
    workspace.version++;
    workspace.lastModified = new Date();

    // Create new snapshot for restore action
    this.createVersionSnapshot(workspaceId, userId, `Restored to version ${version}`);

    return { success: true };
  }

  /**
   * Update workspace permissions
   */
  updatePermissions(
    workspaceId: string,
    userId: string,
    permissions: Partial<WorkspacePermissions>
  ): { success: boolean; error?: string } {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      return { success: false, error: 'Workspace not found' };
    }

    // Only owner can update permissions
    if (workspace.permissions.owner !== userId) {
      return { success: false, error: 'Only owner can update permissions' };
    }

    workspace.permissions = { ...workspace.permissions, ...permissions };
    return { success: true };
  }

  /**
   * Check if user can access workspace
   */
  private canAccess(workspace: Workspace, userId: string): boolean {
    return (
      workspace.permissions.isPublic ||
      workspace.permissions.owner === userId ||
      workspace.permissions.editors.includes(userId) ||
      workspace.permissions.viewers.includes(userId)
    );
  }

  /**
   * Check if user can edit workspace
   */
  private canEdit(workspace: Workspace, userId: string): boolean {
    return workspace.permissions.owner === userId || workspace.permissions.editors.includes(userId);
  }

  /**
   * Get workspace statistics
   */
  getWorkspaceStats(workspaceId: string): {
    totalChanges: number;
    activeUsers: number;
    totalComments: number;
    unresolvedComments: number;
    currentVersion: number;
    lastModified: Date;
  } | null {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return null;

    const comments = this.comments.get(workspaceId) || [];
    const activeUsers = this.getActiveUsers(workspaceId);

    return {
      totalChanges: workspace.changes.length,
      activeUsers: activeUsers.length,
      totalComments: comments.length,
      unresolvedComments: comments.filter((c) => !c.resolved).length,
      currentVersion: workspace.version,
      lastModified: workspace.lastModified,
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * List all workspaces for a user
   */
  listUserWorkspaces(userId: string): Workspace[] {
    return Array.from(this.workspaces.values()).filter((w) => this.canAccess(w, userId));
  }

  /**
   * Delete workspace (owner only)
   */
  deleteWorkspace(workspaceId: string, userId: string): { success: boolean; error?: string } {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      return { success: false, error: 'Workspace not found' };
    }

    if (workspace.permissions.owner !== userId) {
      return { success: false, error: 'Only owner can delete workspace' };
    }

    this.workspaces.delete(workspaceId);
    this.userPresence.delete(workspaceId);
    this.comments.delete(workspaceId);
    this.versionHistory.delete(workspaceId);

    return { success: true };
  }
}

export const workspaceService = new WorkspaceService();
