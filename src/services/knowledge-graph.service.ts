/**
 * Knowledge Graph Service
 * 
 * Maps relationships between content, topics, creators
 * - Extract entities (people, places, topics, concepts)
 * - Build graph database (DynamoDB-based for AWS compatibility)
 * - Find related content and suggest connections
 * - Discover content clusters and communities
 * - Recommend collaboration opportunities
 */

import { GitHubModelsService } from './github-models.service';

export interface GraphNode {
  nodeId: string;
  type: 'content' | 'topic' | 'creator' | 'entity';
  label: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface GraphEdge {
  edgeId: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  weight: number;
  properties: Record<string, any>;
  createdAt: string;
}

export interface Entity {
  name: string;
  type: 'person' | 'place' | 'organization' | 'concept' | 'product' | 'event';
  mentions: number;
  confidence: number;
}

export interface ContentRecommendation {
  contentId: string;
  title: string;
  reason: string;
  relevanceScore: number;
  sharedTopics: string[];
  sharedEntities: string[];
}

export interface GraphCluster {
  clusterId: string;
  name: string;
  nodes: GraphNode[];
  centralTopic: string;
  size: number;
  density: number;
}

export class KnowledgeGraphService {
  private githubModels: GitHubModelsService;
  private graph: Map<string, GraphNode>;
  private edges: Map<string, GraphEdge>;

  constructor() {
    this.githubModels = new GitHubModelsService();
    this.graph = new Map();
    this.edges = new Map();
  }

  /**
   * Add content to knowledge graph
   * Extracts entities and creates nodes/edges
   */
  async addContent(
    contentId: string,
    title: string,
    transcript: string,
    creatorId: string,
    metadata?: Record<string, any>
  ): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    // Extract entities from content
    const entities = await this.extractEntities(transcript);

    // Create content node
    const contentNode: GraphNode = {
      nodeId: contentId,
      type: 'content',
      label: title,
      properties: {
        creatorId,
        transcript: transcript.substring(0, 500), // Store preview
        entityCount: entities.length,
        ...metadata,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.graph.set(contentId, contentNode);

    // Create creator node if not exists
    const creatorNodeId = `creator_${creatorId}`;
    if (!this.graph.has(creatorNodeId)) {
      const creatorNode: GraphNode = {
        nodeId: creatorNodeId,
        type: 'creator',
        label: `Creator ${creatorId}`,
        properties: { creatorId, contentCount: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.graph.set(creatorNodeId, creatorNode);
    }

    // Create edge: creator -> content
    const creatorEdge = this.createEdge(creatorNodeId, contentId, 'created', 1.0);
    this.edges.set(creatorEdge.edgeId, creatorEdge);

    // Create entity nodes and edges
    const newNodes: GraphNode[] = [contentNode];
    const newEdges: GraphEdge[] = [creatorEdge];

    for (const entity of entities) {
      const entityNodeId = this.generateEntityNodeId(entity);

      // Create entity node if not exists
      if (!this.graph.has(entityNodeId)) {
        const entityNode: GraphNode = {
          nodeId: entityNodeId,
          type: 'entity',
          label: entity.name,
          properties: {
            entityType: entity.type,
            totalMentions: entity.mentions,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.graph.set(entityNodeId, entityNode);
        newNodes.push(entityNode);
      } else {
        // Update mention count
        const existingNode = this.graph.get(entityNodeId)!;
        existingNode.properties.totalMentions += entity.mentions;
      }

      // Create edge: content -> entity
      const entityEdge = this.createEdge(
        contentId,
        entityNodeId,
        'mentions',
        entity.confidence
      );
      this.edges.set(entityEdge.edgeId, entityEdge);
      newEdges.push(entityEdge);
    }

    return { nodes: newNodes, edges: newEdges };
  }

  /**
   * Extract entities from text using AI
   */
  private async extractEntities(text: string): Promise<Entity[]> {
    const prompt = `Extract named entities from the following text. Return a JSON array of entities with name, type (person/place/organization/concept/product/event), mentions count, and confidence (0-1).

Text: ${text.substring(0, 2000)}

Return format:
[
  { "name": "Entity Name", "type": "person", "mentions": 3, "confidence": 0.95 }
]`;

    try {
      const response = await this.githubModels.generate(prompt, {
        temperature: 0.3,
        maxTokens: 1000,
      });

      const entities = JSON.parse(response);
      return entities;
    } catch (error) {
      console.error('Entity extraction failed:', error);
      // Fallback: basic entity extraction
      return this.extractEntitiesBasic(text);
    }
  }

  /**
   * Basic entity extraction (fallback)
   */
  private extractEntitiesBasic(text: string): Entity[] {
    const entities: Entity[] = [];
    const words = text.split(/\s+/);

    // Simple capitalized word detection
    const capitalizedWords = words.filter(
      (w) => w.length > 3 && /^[A-Z][a-z]+/.test(w)
    );

    const uniqueWords = [...new Set(capitalizedWords)];
    for (const word of uniqueWords.slice(0, 10)) {
      entities.push({
        name: word,
        type: 'concept',
        mentions: capitalizedWords.filter((w) => w === word).length,
        confidence: 0.6,
      });
    }

    return entities;
  }

  /**
   * Find related content based on shared entities/topics
   */
  async findRelatedContent(
    contentId: string,
    limit: number = 10
  ): Promise<ContentRecommendation[]> {
    const contentNode = this.graph.get(contentId);
    if (!contentNode) {
      throw new Error('Content not found in graph');
    }

    // Get entities connected to this content
    const contentEntities = this.getConnectedNodes(contentId, 'mentions');

    // Find other content that shares entities
    const relatedContent = new Map<string, ContentRecommendation>();

    for (const entity of contentEntities) {
      // Find all content mentioning this entity
      const relatedNodes = this.getIncomingNodes(entity.nodeId, 'mentions');

      for (const node of relatedNodes) {
        if (node.nodeId === contentId || node.type !== 'content') continue;

        if (!relatedContent.has(node.nodeId)) {
          relatedContent.set(node.nodeId, {
            contentId: node.nodeId,
            title: node.label,
            reason: '',
            relevanceScore: 0,
            sharedTopics: [],
            sharedEntities: [],
          });
        }

        const rec = relatedContent.get(node.nodeId)!;
        rec.sharedEntities.push(entity.label);
        rec.relevanceScore += 1;
      }
    }

    // Sort by relevance and format
    const recommendations = Array.from(relatedContent.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
      .map((rec) => ({
        ...rec,
        reason: `Shares ${rec.sharedEntities.length} entities: ${rec.sharedEntities.slice(0, 3).join(', ')}`,
      }));

    return recommendations;
  }

  /**
   * Explore graph starting from a node
   */
  async exploreGraph(
    startNodeId: string,
    depth: number = 2
  ): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    const visited = new Set<string>();
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    const explore = (nodeId: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(nodeId)) return;

      visited.add(nodeId);
      const node = this.graph.get(nodeId);
      if (node) nodes.push(node);

      // Get connected edges
      const nodeEdges = Array.from(this.edges.values()).filter(
        (e) => e.sourceId === nodeId || e.targetId === nodeId
      );

      for (const edge of nodeEdges) {
        edges.push(edge);
        const nextNodeId = edge.sourceId === nodeId ? edge.targetId : edge.sourceId;
        explore(nextNodeId, currentDepth + 1);
      }
    };

    explore(startNodeId, 0);
    return { nodes, edges };
  }

  /**
   * Find content clusters (communities)
   */
  async findClusters(): Promise<GraphCluster[]> {
    // Simple clustering: group content by shared entities
    const clusters = new Map<string, Set<string>>();

    // For each entity, collect all content mentioning it
    for (const node of this.graph.values()) {
      if (node.type === 'entity') {
        const relatedContent = this.getIncomingNodes(node.nodeId, 'mentions');
        if (relatedContent.length >= 2) {
          clusters.set(node.nodeId, new Set(relatedContent.map((n) => n.nodeId)));
        }
      }
    }

    // Convert to cluster objects
    const clusterList: GraphCluster[] = [];
    let clusterId = 1;

    for (const [entityId, contentIds] of clusters.entries()) {
      const entityNode = this.graph.get(entityId);
      if (!entityNode) continue;

      const nodes = Array.from(contentIds)
        .map((id) => this.graph.get(id))
        .filter((n): n is GraphNode => n !== undefined);

      clusterList.push({
        clusterId: `cluster_${clusterId++}`,
        name: `${entityNode.label} Community`,
        nodes,
        centralTopic: entityNode.label,
        size: nodes.length,
        density: this.calculateClusterDensity(Array.from(contentIds)),
      });
    }

    return clusterList.sort((a, b) => b.size - a.size);
  }

  /**
   * Get graph statistics
   */
  getStatistics(): {
    totalNodes: number;
    totalEdges: number;
    nodesByType: Record<string, number>;
    avgDegree: number;
  } {
    const nodesByType: Record<string, number> = {};

    for (const node of this.graph.values()) {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    }

    const degrees = new Map<string, number>();
    for (const edge of this.edges.values()) {
      degrees.set(edge.sourceId, (degrees.get(edge.sourceId) || 0) + 1);
      degrees.set(edge.targetId, (degrees.get(edge.targetId) || 0) + 1);
    }

    const avgDegree =
      Array.from(degrees.values()).reduce((sum, d) => sum + d, 0) / degrees.size || 0;

    return {
      totalNodes: this.graph.size,
      totalEdges: this.edges.size,
      nodesByType,
      avgDegree,
    };
  }

  /**
   * Search graph by keyword
   */
  searchGraph(keyword: string): GraphNode[] {
    const lowerKeyword = keyword.toLowerCase();
    return Array.from(this.graph.values()).filter(
      (node) =>
        node.label.toLowerCase().includes(lowerKeyword) ||
        JSON.stringify(node.properties).toLowerCase().includes(lowerKeyword)
    );
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private createEdge(
    sourceId: string,
    targetId: string,
    relationship: string,
    weight: number
  ): GraphEdge {
    return {
      edgeId: `${sourceId}_${relationship}_${targetId}`,
      sourceId,
      targetId,
      relationship,
      weight,
      properties: {},
      createdAt: new Date().toISOString(),
    };
  }

  private generateEntityNodeId(entity: Entity): string {
    return `entity_${entity.type}_${entity.name.toLowerCase().replace(/\s+/g, '_')}`;
  }

  private getConnectedNodes(nodeId: string, relationship?: string): GraphNode[] {
    const edges = Array.from(this.edges.values()).filter(
      (e) =>
        e.sourceId === nodeId && (!relationship || e.relationship === relationship)
    );

    return edges
      .map((e) => this.graph.get(e.targetId))
      .filter((n): n is GraphNode => n !== undefined);
  }

  private getIncomingNodes(nodeId: string, relationship?: string): GraphNode[] {
    const edges = Array.from(this.edges.values()).filter(
      (e) =>
        e.targetId === nodeId && (!relationship || e.relationship === relationship)
    );

    return edges
      .map((e) => this.graph.get(e.sourceId))
      .filter((n): n is GraphNode => n !== undefined);
  }

  private calculateClusterDensity(nodeIds: string[]): number {
    if (nodeIds.length < 2) return 0;

    let edgeCount = 0;
    for (const edge of this.edges.values()) {
      if (nodeIds.includes(edge.sourceId) && nodeIds.includes(edge.targetId)) {
        edgeCount++;
      }
    }

    const maxEdges = (nodeIds.length * (nodeIds.length - 1)) / 2;
    return maxEdges > 0 ? edgeCount / maxEdges : 0;
  }

  /**
   * Get mock graph data for testing
   */
  getMockGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [
      {
        nodeId: 'content_001',
        type: 'content',
        label: 'How to Make Butter Chicken',
        properties: { creatorId: 'creator_001', views: 50000 },
        createdAt: '2026-02-01T10:00:00Z',
        updatedAt: '2026-02-01T10:00:00Z',
      },
      {
        nodeId: 'content_002',
        type: 'content',
        label: 'Indian Cooking Basics',
        properties: { creatorId: 'creator_001', views: 30000 },
        createdAt: '2026-02-05T14:00:00Z',
        updatedAt: '2026-02-05T14:00:00Z',
      },
      {
        nodeId: 'content_003',
        type: 'content',
        label: 'Best Restaurants in Delhi',
        properties: { creatorId: 'creator_002', views: 25000 },
        createdAt: '2026-02-10T09:00:00Z',
        updatedAt: '2026-02-10T09:00:00Z',
      },
      {
        nodeId: 'creator_creator_001',
        type: 'creator',
        label: 'FoodVlogger',
        properties: { creatorId: 'creator_001', contentCount: 2 },
        createdAt: '2026-01-15T08:00:00Z',
        updatedAt: '2026-02-05T14:00:00Z',
      },
      {
        nodeId: 'creator_creator_002',
        type: 'creator',
        label: 'TravelExplorer',
        properties: { creatorId: 'creator_002', contentCount: 1 },
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-02-10T09:00:00Z',
      },
      {
        nodeId: 'entity_concept_indian_food',
        type: 'entity',
        label: 'Indian Food',
        properties: { entityType: 'concept', totalMentions: 15 },
        createdAt: '2026-02-01T10:00:00Z',
        updatedAt: '2026-02-10T09:00:00Z',
      },
      {
        nodeId: 'entity_place_delhi',
        type: 'entity',
        label: 'Delhi',
        properties: { entityType: 'place', totalMentions: 8 },
        createdAt: '2026-02-05T14:00:00Z',
        updatedAt: '2026-02-10T09:00:00Z',
      },
      {
        nodeId: 'entity_concept_cooking',
        type: 'entity',
        label: 'Cooking',
        properties: { entityType: 'concept', totalMentions: 12 },
        createdAt: '2026-02-01T10:00:00Z',
        updatedAt: '2026-02-05T14:00:00Z',
      },
    ];

    const edges: GraphEdge[] = [
      {
        edgeId: 'creator_creator_001_created_content_001',
        sourceId: 'creator_creator_001',
        targetId: 'content_001',
        relationship: 'created',
        weight: 1.0,
        properties: {},
        createdAt: '2026-02-01T10:00:00Z',
      },
      {
        edgeId: 'creator_creator_001_created_content_002',
        sourceId: 'creator_creator_001',
        targetId: 'content_002',
        relationship: 'created',
        weight: 1.0,
        properties: {},
        createdAt: '2026-02-05T14:00:00Z',
      },
      {
        edgeId: 'creator_creator_002_created_content_003',
        sourceId: 'creator_creator_002',
        targetId: 'content_003',
        relationship: 'created',
        weight: 1.0,
        properties: {},
        createdAt: '2026-02-10T09:00:00Z',
      },
      {
        edgeId: 'content_001_mentions_entity_concept_indian_food',
        sourceId: 'content_001',
        targetId: 'entity_concept_indian_food',
        relationship: 'mentions',
        weight: 0.95,
        properties: {},
        createdAt: '2026-02-01T10:00:00Z',
      },
      {
        edgeId: 'content_001_mentions_entity_concept_cooking',
        sourceId: 'content_001',
        targetId: 'entity_concept_cooking',
        relationship: 'mentions',
        weight: 0.9,
        properties: {},
        createdAt: '2026-02-01T10:00:00Z',
      },
      {
        edgeId: 'content_002_mentions_entity_concept_indian_food',
        sourceId: 'content_002',
        targetId: 'entity_concept_indian_food',
        relationship: 'mentions',
        weight: 0.92,
        properties: {},
        createdAt: '2026-02-05T14:00:00Z',
      },
      {
        edgeId: 'content_002_mentions_entity_concept_cooking',
        sourceId: 'content_002',
        targetId: 'entity_concept_cooking',
        relationship: 'mentions',
        weight: 0.88,
        properties: {},
        createdAt: '2026-02-05T14:00:00Z',
      },
      {
        edgeId: 'content_003_mentions_entity_concept_indian_food',
        sourceId: 'content_003',
        targetId: 'entity_concept_indian_food',
        relationship: 'mentions',
        weight: 0.85,
        properties: {},
        createdAt: '2026-02-10T09:00:00Z',
      },
      {
        edgeId: 'content_003_mentions_entity_place_delhi',
        sourceId: 'content_003',
        targetId: 'entity_place_delhi',
        relationship: 'mentions',
        weight: 0.93,
        properties: {},
        createdAt: '2026-02-10T09:00:00Z',
      },
    ];

    return { nodes, edges };
  }
}
