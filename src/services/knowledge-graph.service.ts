/**
 * Knowledge Graph Service
 * 
 * Builds and manages a knowledge graph for content relationships,
 * entity extraction, and intelligent recommendations.
 */

export interface GraphNode {
  id: string;
  type: 'content' | 'creator' | 'topic' | 'concept' | 'person' | 'place';
  label: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'created_by' | 'about' | 'mentions' | 'related_to' | 'similar_to';
  weight: number;
  properties?: Record<string, any>;
}

export interface KnowledgeGraph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  adjacencyList: Map<string, Set<string>>;
}

export interface EntityExtractionResult {
  people: string[];
  places: string[];
  topics: string[];
  concepts: string[];
}

export interface RelatedContent {
  contentId: string;
  score: number;
  reason: string;
}

export interface ConnectionSuggestion {
  creatorId: string;
  targetCreatorId: string;
  sharedTopics: string[];
  score: number;
}

export class KnowledgeGraphService {
  private graph: KnowledgeGraph;

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      adjacencyList: new Map(),
    };
  }

  /**
   * Extract entities from content
   */
  async extractEntities(content: {
    id: string;
    title: string;
    description: string;
    transcript?: string;
  }): Promise<EntityExtractionResult> {
    const text = `${content.title} ${content.description} ${content.transcript || ''}`.toLowerCase();
    
    // Simple entity extraction (in production, use NLP/AI)
    const people = this.extractPeople(text);
    const places = this.extractPlaces(text);
    const topics = this.extractTopics(text);
    const concepts = this.extractConcepts(text);

    return { people, places, topics, concepts };
  }

  /**
   * Add a node to the graph
   */
  addNode(node: GraphNode): void {
    this.graph.nodes.set(node.id, node);
    if (!this.graph.adjacencyList.has(node.id)) {
      this.graph.adjacencyList.set(node.id, new Set());
    }
  }

  /**
   * Add an edge to the graph
   */
  addEdge(edge: GraphEdge): void {
    this.graph.edges.set(edge.id, edge);
    
    // Update adjacency list
    if (!this.graph.adjacencyList.has(edge.source)) {
      this.graph.adjacencyList.set(edge.source, new Set());
    }
    this.graph.adjacencyList.get(edge.source)!.add(edge.target);
  }

  /**
   * Build knowledge graph from content
   */
  async buildGraph(contents: Array<{
    id: string;
    title: string;
    description: string;
    transcript?: string;
    creatorId: string;
    creatorName: string;
  }>): Promise<void> {
    for (const content of contents) {
      // Add content node
      this.addNode({
        id: content.id,
        type: 'content',
        label: content.title,
        properties: { description: content.description },
      });

      // Add creator node
      const creatorNodeId = `creator-${content.creatorId}`;
      if (!this.graph.nodes.has(creatorNodeId)) {
        this.addNode({
          id: creatorNodeId,
          type: 'creator',
          label: content.creatorName,
          properties: { creatorId: content.creatorId },
        });
      }

      // Add created_by edge
      this.addEdge({
        id: `${content.id}-created-by-${creatorNodeId}`,
        source: content.id,
        target: creatorNodeId,
        type: 'created_by',
        weight: 1.0,
      });

      // Extract and add entities
      const entities = await this.extractEntities(content);

      // Add topic nodes and edges
      for (const topic of entities.topics) {
        const topicId = `topic-${topic.toLowerCase().replace(/\s+/g, '-')}`;
        if (!this.graph.nodes.has(topicId)) {
          this.addNode({
            id: topicId,
            type: 'topic',
            label: topic,
            properties: {},
          });
        }
        this.addEdge({
          id: `${content.id}-about-${topicId}`,
          source: content.id,
          target: topicId,
          type: 'about',
          weight: 0.8,
        });
      }

      // Add person nodes and edges
      for (const person of entities.people) {
        const personId = `person-${person.toLowerCase().replace(/\s+/g, '-')}`;
        if (!this.graph.nodes.has(personId)) {
          this.addNode({
            id: personId,
            type: 'person',
            label: person,
            properties: {},
          });
        }
        this.addEdge({
          id: `${content.id}-mentions-${personId}`,
          source: content.id,
          target: personId,
          type: 'mentions',
          weight: 0.6,
        });
      }

      // Add place nodes and edges
      for (const place of entities.places) {
        const placeId = `place-${place.toLowerCase().replace(/\s+/g, '-')}`;
        if (!this.graph.nodes.has(placeId)) {
          this.addNode({
            id: placeId,
            type: 'place',
            label: place,
            properties: {},
          });
        }
        this.addEdge({
          id: `${content.id}-mentions-${placeId}`,
          source: content.id,
          target: placeId,
          type: 'mentions',
          weight: 0.6,
        });
      }
    }

    // Add similarity edges between content
    this.addSimilarityEdges();
  }

  /**
   * Find related content
   */
  findRelatedContent(contentId: string, limit: number = 10): RelatedContent[] {
    const related: RelatedContent[] = [];
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number; path: string[] }> = [
      { id: contentId, depth: 0, path: [] },
    ];

    while (queue.length > 0 && related.length < limit) {
      const current = queue.shift()!;
      
      if (visited.has(current.id)) continue;
      visited.add(current.id);

      if (current.depth > 0 && current.depth <= 3) {
        const node = this.graph.nodes.get(current.id);
        if (node && node.type === 'content') {
          const score = 1.0 / current.depth;
          const reason = this.getRelationshipReason(current.path);
          related.push({ contentId: current.id, score, reason });
        }
      }

      // Explore neighbors
      const neighbors = this.graph.adjacencyList.get(current.id) || new Set();
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId) && current.depth < 3) {
          const edge = Array.from(this.graph.edges.values()).find(
            e => e.source === current.id && e.target === neighborId
          );
          queue.push({
            id: neighborId,
            depth: current.depth + 1,
            path: [...current.path, edge?.type || 'unknown'],
          });
        }
      }
    }

    return related.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Suggest connections between creators
   */
  suggestConnections(creatorId: string, limit: number = 5): ConnectionSuggestion[] {
    const creatorNodeId = `creator-${creatorId}`;
    const suggestions: ConnectionSuggestion[] = [];

    // Find topics this creator covers
    const creatorTopics = this.getCreatorTopics(creatorNodeId);

    // Find other creators with similar topics
    const allCreators = Array.from(this.graph.nodes.values()).filter(
      n => n.type === 'creator' && n.id !== creatorNodeId
    );

    for (const otherCreator of allCreators) {
      const otherTopics = this.getCreatorTopics(otherCreator.id);
      const sharedTopics = creatorTopics.filter(t => otherTopics.includes(t));

      if (sharedTopics.length > 0) {
        const score = sharedTopics.length / Math.max(creatorTopics.length, otherTopics.length);
        suggestions.push({
          creatorId,
          targetCreatorId: otherCreator.properties.creatorId,
          sharedTopics,
          score,
        });
      }
    }

    return suggestions.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Query graph for specific relationships
   */
  query(params: {
    nodeType?: string;
    edgeType?: string;
    properties?: Record<string, any>;
  }): Array<GraphNode | GraphEdge> {
    const results: Array<GraphNode | GraphEdge> = [];

    if (params.nodeType) {
      for (const node of this.graph.nodes.values()) {
        if (node.type === params.nodeType) {
          if (!params.properties || this.matchesProperties(node.properties, params.properties)) {
            results.push(node);
          }
        }
      }
    }

    if (params.edgeType) {
      for (const edge of this.graph.edges.values()) {
        if (edge.type === params.edgeType) {
          if (!params.properties || this.matchesProperties(edge.properties || {}, params.properties)) {
            results.push(edge);
          }
        }
      }
    }

    return results;
  }

  /**
   * Calculate relationship accuracy
   */
  calculateAccuracy(groundTruth: Array<{ source: string; target: string; type: string }>): number {
    let correct = 0;
    let total = groundTruth.length;

    for (const truth of groundTruth) {
      const edge = Array.from(this.graph.edges.values()).find(
        e => e.source === truth.source && e.target === truth.target && e.type === truth.type
      );
      if (edge) correct++;
    }

    return total > 0 ? correct / total : 0;
  }

  /**
   * Get graph statistics
   */
  getStats(): {
    nodeCount: number;
    edgeCount: number;
    nodesByType: Record<string, number>;
    edgesByType: Record<string, number>;
  } {
    const nodesByType: Record<string, number> = {};
    const edgesByType: Record<string, number> = {};

    for (const node of this.graph.nodes.values()) {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    }

    for (const edge of this.graph.edges.values()) {
      edgesByType[edge.type] = (edgesByType[edge.type] || 0) + 1;
    }

    return {
      nodeCount: this.graph.nodes.size,
      edgeCount: this.graph.edges.size,
      nodesByType,
      edgesByType,
    };
  }

  /**
   * Clear the graph
   */
  clear(): void {
    this.graph.nodes.clear();
    this.graph.edges.clear();
    this.graph.adjacencyList.clear();
  }

  // Private helper methods

  private extractPeople(text: string): string[] {
    const people: string[] = [];
    const patterns = [
      /\b(elon musk|jeff bezos|bill gates|mark zuckerberg|steve jobs)\b/gi,
      /\b(dr\.|mr\.|mrs\.|ms\.)\s+[a-z]+\b/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        people.push(...matches.map(m => this.capitalize(m)));
      }
    }

    return [...new Set(people)];
  }

  private extractPlaces(text: string): string[] {
    const places: string[] = [];
    const patterns = [
      /\b(new york|san francisco|london|paris|tokyo|beijing|silicon valley)\b/gi,
      /\b(usa|uk|china|japan|germany|france)\b/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        places.push(...matches.map(m => this.capitalize(m)));
      }
    }

    return [...new Set(places)];
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    const keywords = [
      'ai', 'machine learning', 'blockchain', 'cryptocurrency', 'web3',
      'startup', 'entrepreneurship', 'technology', 'innovation', 'business',
      'marketing', 'design', 'programming', 'data science', 'cloud computing',
    ];

    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        topics.push(this.capitalize(keyword));
      }
    }

    return [...new Set(topics)];
  }

  private extractConcepts(text: string): string[] {
    const concepts: string[] = [];
    const patterns = [
      /\b(growth|scale|revenue|profit|strategy|vision|mission)\b/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        concepts.push(...matches.map(m => this.capitalize(m)));
      }
    }

    return [...new Set(concepts)];
  }

  private addSimilarityEdges(): void {
    const contentNodes = Array.from(this.graph.nodes.values()).filter(n => n.type === 'content');

    for (let i = 0; i < contentNodes.length; i++) {
      for (let j = i + 1; j < contentNodes.length; j++) {
        const similarity = this.calculateSimilarity(contentNodes[i], contentNodes[j]);
        if (similarity > 0.3) {
          this.addEdge({
            id: `${contentNodes[i].id}-similar-${contentNodes[j].id}`,
            source: contentNodes[i].id,
            target: contentNodes[j].id,
            type: 'similar_to',
            weight: similarity,
          });
        }
      }
    }
  }

  private calculateSimilarity(node1: GraphNode, node2: GraphNode): number {
    // Find common neighbors
    const neighbors1 = this.graph.adjacencyList.get(node1.id) || new Set();
    const neighbors2 = this.graph.adjacencyList.get(node2.id) || new Set();

    const intersection = new Set([...neighbors1].filter(x => neighbors2.has(x)));
    const union = new Set([...neighbors1, ...neighbors2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private getCreatorTopics(creatorNodeId: string): string[] {
    const topics: string[] = [];

    // Find all content by this creator
    for (const edge of this.graph.edges.values()) {
      if (edge.target === creatorNodeId && edge.type === 'created_by') {
        const contentId = edge.source;
        
        // Find topics for this content
        for (const topicEdge of this.graph.edges.values()) {
          if (topicEdge.source === contentId && topicEdge.type === 'about') {
            const topicNode = this.graph.nodes.get(topicEdge.target);
            if (topicNode) {
              topics.push(topicNode.label);
            }
          }
        }
      }
    }

    return [...new Set(topics)];
  }

  private getRelationshipReason(path: string[]): string {
    if (path.length === 0) return 'direct';
    return path.join(' → ');
  }

  private matchesProperties(nodeProps: Record<string, any>, queryProps: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(queryProps)) {
      if (nodeProps[key] !== value) return false;
    }
    return true;
  }

  private capitalize(str: string): string {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
}

export default KnowledgeGraphService;
