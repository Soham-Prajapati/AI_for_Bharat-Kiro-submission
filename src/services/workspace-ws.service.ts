/**
 * WebSocket Server for Real-time Collaboration
 * Handles workspace connections, user presence, and change synchronization
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { workspaceService, User, Change } from '../services/workspace.service';
import { v4 as uuidv4 } from 'uuid';

interface WSMessage {
  type: 'join' | 'leave' | 'change' | 'cursor' | 'presence';
  workspaceId: string;
  userId?: string;
  user?: User;
  change?: Change;
  cursor?: { line: number; column: number };
}

interface ClientConnection {
  ws: WebSocket;
  workspaceId: string;
  userId: string;
}

class WorkspaceWebSocketServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientConnection> = new Map();

  /**
   * Initialize WebSocket server
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/workspace'
    });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = uuidv4();
      console.log(`[WS] New connection: ${clientId}`);

      ws.on('message', (data: Buffer) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          this.handleMessage(clientId, ws, message);
        } catch (error) {
          console.error('[WS] Invalid message:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            error: 'Invalid message format' 
          }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      ws.on('error', (error) => {
        console.error('[WS] Connection error:', error);
        this.handleDisconnect(clientId);
      });
    });

    console.log('[WS] WebSocket server initialized on /ws/workspace');
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(clientId: string, ws: WebSocket, message: WSMessage): void {
    switch (message.type) {
      case 'join':
        this.handleJoin(clientId, ws, message);
        break;

      case 'leave':
        this.handleLeave(clientId, message);
        break;

      case 'change':
        this.handleChange(clientId, message);
        break;

      case 'cursor':
        this.handleCursor(clientId, message);
        break;

      case 'presence':
        this.handlePresence(message);
        break;

      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          error: 'Unknown message type' 
        }));
    }
  }

  /**
   * Handle user joining workspace
   */
  private handleJoin(clientId: string, ws: WebSocket, message: WSMessage): void {
    const { workspaceId, user } = message;

    if (!workspaceId || !user) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        error: 'workspaceId and user required' 
      }));
      return;
    }

    // Check if workspace exists
    const workspace = workspaceService.get(workspaceId);
    if (!workspace) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        error: 'Workspace not found' 
      }));
      return;
    }

    // Add user to workspace
    workspaceService.addUser(workspaceId, user);

    // Store client connection
    this.clients.set(clientId, {
      ws,
      workspaceId,
      userId: user.id
    });

    // Send current workspace state to new user
    ws.send(JSON.stringify({
      type: 'init',
      workspace: {
        id: workspace.id,
        name: workspace.name,
        content: workspace.content,
        version: workspace.version
      },
      users: workspaceService.getUsers(workspaceId)
    }));

    // Broadcast user joined to others
    this.broadcast(workspaceId, {
      type: 'user-joined',
      user
    }, user.id);

    console.log(`[WS] User ${user.id} joined workspace ${workspaceId}`);
  }

  /**
   * Handle user leaving workspace
   */
  private handleLeave(clientId: string, message: WSMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { workspaceId, userId } = client;

    // Remove user from workspace
    workspaceService.removeUser(workspaceId, userId);

    // Broadcast user left
    this.broadcast(workspaceId, {
      type: 'user-left',
      userId
    });

    // Remove client
    this.clients.delete(clientId);

    console.log(`[WS] User ${userId} left workspace ${workspaceId}`);
  }

  /**
   * Handle content change
   */
  private handleChange(clientId: string, message: WSMessage): void {
    const client = this.clients.get(clientId);
    if (!client || !message.change) return;

    const { workspaceId } = client;

    // Apply change with OT
    const result = workspaceService.applyChange(workspaceId, message.change);

    if (!result.success) {
      client.ws.send(JSON.stringify({
        type: 'error',
        error: 'Failed to apply change'
      }));
      return;
    }

    // Broadcast transformed change to all users
    this.broadcast(workspaceId, {
      type: 'change',
      change: result.transformedChange
    });

    console.log(`[WS] Change applied in workspace ${workspaceId}`);
  }

  /**
   * Handle cursor position update
   */
  private handleCursor(clientId: string, message: WSMessage): void {
    const client = this.clients.get(clientId);
    if (!client || !message.cursor) return;

    const { workspaceId, userId } = client;

    // Update cursor position
    workspaceService.updateCursor(workspaceId, userId, message.cursor);

    // Broadcast cursor position
    this.broadcast(workspaceId, {
      type: 'cursor',
      userId,
      cursor: message.cursor
    }, userId);
  }

  /**
   * Handle presence request
   */
  private handlePresence(message: WSMessage): void {
    const { workspaceId } = message;
    if (!workspaceId) return;

    const users = workspaceService.getUsers(workspaceId);

    this.broadcast(workspaceId, {
      type: 'presence',
      users
    });
  }

  /**
   * Broadcast message to all users in workspace
   */
  private broadcast(workspaceId: string, message: any, excludeUserId?: string): void {
    this.clients.forEach((client, clientId) => {
      if (client.workspaceId === workspaceId && client.userId !== excludeUserId) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(message));
        }
      }
    });
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { workspaceId, userId } = client;

    // Remove user from workspace
    workspaceService.removeUser(workspaceId, userId);

    // Broadcast user left
    this.broadcast(workspaceId, {
      type: 'user-left',
      userId
    });

    // Remove client
    this.clients.delete(clientId);

    console.log(`[WS] Client ${clientId} disconnected`);
  }

  /**
   * Get active connections count
   */
  getConnectionCount(): number {
    return this.clients.size;
  }
}

export const workspaceWSServer = new WorkspaceWebSocketServer();
