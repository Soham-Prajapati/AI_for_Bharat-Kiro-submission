/**
 * Collaborative Workspace Service
 * Real-time collaborative editing for generated content
 */

import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { line: number; column: number };
}

export interface Change {
  id: string;
  userId: string;
  timestamp: number;
  operation: 'insert' | 'delete' | 'replace';
  position: number;
  content?: string;
  length?: number;
}

export interface Workspace {
  id: string;
  name: string;
  content: string;
  users: Map<string, User>;
  changes: Change[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkspaceService {
  private workspaces: Map<string, Workspace> = new Map();

  /**
   * Create a new workspace
   */
  create(name: string, initialContent: string = ''): Workspace {
    const workspace: Workspace = {
      id: uuidv4(),
      name,
      content: initialContent,
      users: new Map(),
      changes: [],
      version: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workspaces.set(workspace.id, workspace);
    return workspace;
  }

  /**
   * Get workspace by ID
   */
  get(workspaceId: string): Workspace | undefined {
    return this.workspaces.get(workspaceId);
  }

  /**
   * Add user to workspace
   */
  addUser(workspaceId: string, user: User): boolean {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return false;

    workspace.users.set(user.id, user);
    return true;
  }

  /**
   * Remove user from workspace
   */
  removeUser(workspaceId: string, userId: string): boolean {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return false;

    return workspace.users.delete(userId);
  }

  /**
   * Update user cursor position
   */
  updateCursor(workspaceId: string, userId: string, cursor: { line: number; column: number }): boolean {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return false;

    const user = workspace.users.get(userId);
    if (!user) return false;

    user.cursor = cursor;
    return true;
  }

  /**
   * Apply change to workspace (Operational Transform)
   */
  applyChange(workspaceId: string, change: Change): { success: boolean; transformedChange?: Change } {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return { success: false };

    // Simple OT: transform change against concurrent changes
    let transformedChange = { ...change };
    
    // Get concurrent changes (same version)
    const concurrentChanges = workspace.changes.filter(c => c.timestamp > change.timestamp - 1000);
    
    for (const concurrent of concurrentChanges) {
      transformedChange = this.transform(transformedChange, concurrent);
    }

    // Apply the transformed change
    try {
      workspace.content = this.applyOperation(workspace.content, transformedChange);
      workspace.changes.push(transformedChange);
      workspace.version++;
      workspace.updatedAt = new Date();

      return { success: true, transformedChange };
    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Operational Transform: transform change A against change B
   */
  private transform(changeA: Change, changeB: Change): Change {
    const transformed = { ...changeA };

    // If B happened before A at an earlier position, adjust A's position
    if (changeB.position < changeA.position) {
      if (changeB.operation === 'insert' && changeB.content) {
        transformed.position += changeB.content.length;
      } else if (changeB.operation === 'delete' && changeB.length) {
        transformed.position -= changeB.length;
      }
    }

    return transformed;
  }

  /**
   * Apply operation to content string
   */
  private applyOperation(content: string, change: Change): string {
    switch (change.operation) {
      case 'insert':
        return content.slice(0, change.position) + (change.content || '') + content.slice(change.position);
      
      case 'delete':
        return content.slice(0, change.position) + content.slice(change.position + (change.length || 0));
      
      case 'replace':
        return content.slice(0, change.position) + (change.content || '') + content.slice(change.position + (change.length || 0));
      
      default:
        return content;
    }
  }

  /**
   * Get workspace users (for presence)
   */
  getUsers(workspaceId: string): User[] {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return [];

    return Array.from(workspace.users.values());
  }

  /**
   * Delete workspace
   */
  delete(workspaceId: string): boolean {
    return this.workspaces.delete(workspaceId);
  }

  /**
   * List all workspaces (for admin/debugging)
   */
  list(): Workspace[] {
    return Array.from(this.workspaces.values());
  }
}

export const workspaceService = new WorkspaceService();
