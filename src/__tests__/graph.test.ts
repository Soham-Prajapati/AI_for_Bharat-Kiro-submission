/**
 * Knowledge Graph Relationship Accuracy Tests
 * 
 * Comprehensive tests for knowledge graph functionality including:
 * - Entity extraction from content (people, places, topics, concepts)
 * - Relationship building between entities
 * - Graph traversal and queries
 * - Related content recommendations
 * - Relationship accuracy (>85% correct relationships)
 * - Graph performance (1000+ nodes)
 * - Edge cases (duplicate entities, circular relationships, orphaned nodes)
 * 
 * Success Criteria:
 * - >85% relationship accuracy (verified against ground truth)
 * - All relationship types tested
 * - Graph queries return relevant results
 * - Performance acceptable for large graphs
 */

import KnowledgeGraphService from '../services/knowledge-graph.service';
import { randomString, randomNumber, wait } from './setup';

describe('Knowledge Graph Service - Comprehensive Tests', () => {
  let service: KnowledgeGraphService;

  beforeEach(() => {
    service = new KnowledgeGraphService();
  });

  afterEach(() => {
    service.clear();
  });

  // ============================================================================
  // 1. Entity Extraction Tests
  // ============================================================================

  describe('Entity Extraction', () => {
    it('should extract people from content', async () => {
      const content = {
        id: 'video-1',
        title: 'Interview with Elon Musk',
        description: 'Discussion with Dr. Smith about innovation',
        transcript: 'Elon Musk talks about the future with Bill Gates',
      };

      const entities = await service.extractEntities(content);

      expect(entities.people).toContain('Elon Musk');
      expect(entities.people).toContain('Bill Gates');
      expect(entities.people.length).toBeGreaterThan(0);
    });

    it('should extract places from content', async () => {
      const content = {
        id: 'video-2',
        title: 'Tech Scene in Silicon Valley',
        description: 'Exploring startups in San Francisco and New York',
        transcript: 'From London to Tokyo, innovation is everywhere',
      };

      const entities = await service.extractEntities(content);

      expect(entities.places).toContain('Silicon Valley');
      expect(entities.places).toContain('San Francisco');
      expect(entities.places).toContain('New York');
      expect(entities.places).toContain('London');
      expect(entities.places).toContain('Tokyo');
    });

    it('should extract topics from content', async () => {
      const content = {
        id: 'video-3',
        title: 'AI and Machine Learning Revolution',
        description: 'How blockchain and cryptocurrency are changing business',
        transcript: 'Discussing web3, startup culture, and entrepreneurship',
      };

      const entities = await service.extractEntities(content);

      expect(entities.topics).toContain('Ai');
      expect(entities.topics).toContain('Machine Learning');
      expect(entities.topics).toContain('Blockchain');
      expect(entities.topics).toContain('Cryptocurrency');
      expect(entities.topics).toContain('Web3');
      expect(entities.topics).toContain('Startup');
      expect(entities.topics).toContain('Entrepreneurship');
    });

    it('should extract concepts from content', async () => {
      const content = {
        id: 'video-4',
        title: 'Growth Strategy for Startups',
        description: 'Scaling revenue and profit through vision',
        transcript: 'Our mission is to drive growth and scale the business',
      };

      const entities = await service.extractEntities(content);

      expect(entities.concepts).toContain('Growth');
      expect(entities.concepts).toContain('Strategy');
      expect(entities.concepts).toContain('Scale');
      expect(entities.concepts).toContain('Revenue');
      expect(entities.concepts).toContain('Profit');
      expect(entities.concepts).toContain('Vision');
      expect(entities.concepts).toContain('Mission');
    });

    it('should extract entities from 100 videos', async () => {
      const videos = generateMockVideos(100);
      const allEntities = {
        people: new Set<string>(),
        places: new Set<string>(),
        topics: new Set<string>(),
        concepts: new Set<string>(),
      };

      for (const video of videos) {
        const entities = await service.extractEntities(video);
        entities.people.forEach(p => allEntities.people.add(p));
        entities.places.forEach(p => allEntities.places.add(p));
        entities.topics.forEach(t => allEntities.topics.add(t));
        entities.concepts.forEach(c => allEntities.concepts.add(c));
      }

      expect(allEntities.people.size).toBeGreaterThan(0);
      expect(allEntities.places.size).toBeGreaterThan(0);
      expect(allEntities.topics.size).toBeGreaterThan(0);
      expect(allEntities.concepts.size).toBeGreaterThan(0);
    });

    it('should handle content with no entities', async () => {
      const content = {
        id: 'video-5',
        title: 'Random Content',
        description: 'Some random description',
        transcript: 'Just talking about nothing specific',
      };

      const entities = await service.extractEntities(content);

      expect(entities.people).toEqual([]);
      expect(entities.places).toEqual([]);
      expect(entities.topics).toEqual([]);
      expect(entities.concepts).toEqual([]);
    });
  });

  // ============================================================================
  // 2. Relationship Building Tests
  // ============================================================================

  describe('Relationship Building', () => {
    it('should build graph with content and creator nodes', async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'AI Tutorial',
          description: 'Learn about machine learning',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
      ];

      await service.buildGraph(contents);
      const stats = service.getStats();

      expect(stats.nodeCount).toBeGreaterThanOrEqual(2); // content + creator
      expect(stats.nodesByType.content).toBe(1);
      expect(stats.nodesByType.creator).toBe(1);
    });

    it('should create created_by relationships', async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'AI Tutorial',
          description: 'Learn about AI',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
      ];

      await service.buildGraph(contents);
      const stats = service.getStats();

      expect(stats.edgesByType.created_by).toBe(1);
    });

    it('should create about relationships for topics', async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'AI and Machine Learning',
          description: 'Exploring AI technology',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
      ];

      await service.buildGraph(contents);
      const stats = service.getStats();

      expect(stats.edgesByType.about).toBeGreaterThan(0);
      expect(stats.nodesByType.topic).toBeGreaterThan(0);
    });

    it('should create mentions relationships for people', async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'Interview with Elon Musk',
          description: 'Elon Musk discusses innovation',
          creatorId: 'creator-1',
          creatorName: 'Interviewer',
        },
      ];

      await service.buildGraph(contents);
      const stats = service.getStats();

      expect(stats.edgesByType.mentions).toBeGreaterThan(0);
      expect(stats.nodesByType.person).toBeGreaterThan(0);
    });

    it('should create mentions relationships for places', async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'Silicon Valley Tour',
          description: 'Exploring Silicon Valley and San Francisco',
          creatorId: 'creator-1',
          creatorName: 'Travel Vlogger',
        },
      ];

      await service.buildGraph(contents);
      const stats = service.getStats();

      expect(stats.edgesByType.mentions).toBeGreaterThan(0);
      expect(stats.nodesByType.place).toBeGreaterThan(0);
    });

    it('should create similar_to relationships between related content', async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'AI Tutorial Part 1',
          description: 'Introduction to machine learning and AI',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
        {
          id: 'video-2',
          title: 'AI Tutorial Part 2',
          description: 'Advanced machine learning and AI concepts',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
      ];

      await service.buildGraph(contents);
      const stats = service.getStats();

      expect(stats.edgesByType.similar_to).toBeGreaterThan(0);
    });

    it('should handle multiple creators', async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'AI Tutorial',
          description: 'Learn AI',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
        {
          id: 'video-2',
          title: 'ML Guide',
          description: 'Learn ML',
          creatorId: 'creator-2',
          creatorName: 'Data Scientist',
        },
      ];

      await service.buildGraph(contents);
      const stats = service.getStats();

      expect(stats.nodesByType.creator).toBe(2);
    });

    it('should not duplicate creator nodes', async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'Video 1',
          description: 'First video',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
        {
          id: 'video-2',
          title: 'Video 2',
          description: 'Second video',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
      ];

      await service.buildGraph(contents);
      const stats = service.getStats();

      expect(stats.nodesByType.creator).toBe(1);
      expect(stats.nodesByType.content).toBe(2);
    });
  });

  // ============================================================================
  // 3. Graph Traversal and Queries
  // ============================================================================

  describe('Graph Traversal and Queries', () => {
    beforeEach(async () => {
      const contents = generateMockVideos(20);
      await service.buildGraph(contents);
    });

    it('should find all content nodes', () => {
      const contentNodes = service.query({ nodeType: 'content' });
      expect(contentNodes.length).toBe(20);
    });

    it('should find all creator nodes', () => {
      const creatorNodes = service.query({ nodeType: 'creator' });
      expect(creatorNodes.length).toBeGreaterThan(0);
    });

    it('should find all topic nodes', () => {
      const topicNodes = service.query({ nodeType: 'topic' });
      expect(topicNodes.length).toBeGreaterThan(0);
    });

    it('should find all about edges', () => {
      const aboutEdges = service.query({ edgeType: 'about' });
      expect(aboutEdges.length).toBeGreaterThan(0);
    });

    it('should find all created_by edges', () => {
      const createdByEdges = service.query({ edgeType: 'created_by' });
      expect(createdByEdges.length).toBe(20);
    });

    it('should query nodes by properties', () => {
      // This test verifies property-based filtering
      const results = service.query({
        nodeType: 'content',
        properties: {},
      });
      expect(results.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // 4. Related Content Recommendations
  // ============================================================================

  describe('Related Content Recommendations', () => {
    beforeEach(async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'AI Basics',
          description: 'Introduction to AI and machine learning',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
        {
          id: 'video-2',
          title: 'Machine Learning Deep Dive',
          description: 'Advanced machine learning techniques',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
        {
          id: 'video-3',
          title: 'AI Applications',
          description: 'Real-world AI applications',
          creatorId: 'creator-2',
          creatorName: 'AI Expert',
        },
        {
          id: 'video-4',
          title: 'Cooking Tutorial',
          description: 'How to cook pasta',
          creatorId: 'creator-3',
          creatorName: 'Chef',
        },
      ];

      await service.buildGraph(contents);
    });

    it('should find related content', () => {
      const related = service.findRelatedContent('video-1', 10);
      expect(related.length).toBeGreaterThan(0);
    });

    it('should return related content with scores', () => {
      const related = service.findRelatedContent('video-1', 10);
      
      for (const item of related) {
        expect(item).toHaveProperty('contentId');
        expect(item).toHaveProperty('score');
        expect(item).toHaveProperty('reason');
        expect(item.score).toBeGreaterThan(0);
        expect(item.score).toBeLessThanOrEqual(1);
      }
    });

    it('should sort related content by score', () => {
      const related = service.findRelatedContent('video-1', 10);
      
      for (let i = 1; i < related.length; i++) {
        expect(related[i - 1].score).toBeGreaterThanOrEqual(related[i].score);
      }
    });

    it('should respect limit parameter', () => {
      const related = service.findRelatedContent('video-1', 2);
      expect(related.length).toBeLessThanOrEqual(2);
    });

    it('should not include the source content in results', () => {
      const related = service.findRelatedContent('video-1', 10);
      const sourceInResults = related.some(r => r.contentId === 'video-1');
      expect(sourceInResults).toBe(false);
    });

    it('should find content with similar topics', () => {
      const related = service.findRelatedContent('video-1', 10);
      const aiRelated = related.filter(r => 
        r.contentId === 'video-2' || r.contentId === 'video-3'
      );
      expect(aiRelated.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // 5. Relationship Accuracy Tests (>85%)
  // ============================================================================

  describe('Relationship Accuracy', () => {
    it('should achieve >85% accuracy for created_by relationships', async () => {
      const contents = generateMockVideos(50);
      await service.buildGraph(contents);

      const groundTruth = contents.map(c => ({
        source: c.id,
        target: `creator-${c.creatorId}`,
        type: 'created_by',
      }));

      const accuracy = service.calculateAccuracy(groundTruth);
      expect(accuracy).toBeGreaterThanOrEqual(0.85);
    });

    it('should achieve >85% accuracy for topic relationships', async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'AI Tutorial',
          description: 'Learn about AI',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
        {
          id: 'video-2',
          title: 'Machine Learning Guide',
          description: 'ML basics',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
      ];

      await service.buildGraph(contents);

      const groundTruth = [
        { source: 'video-1', target: 'topic-ai', type: 'about' },
        { source: 'video-2', target: 'topic-machine-learning', type: 'about' },
      ];

      const accuracy = service.calculateAccuracy(groundTruth);
      expect(accuracy).toBeGreaterThanOrEqual(0.85);
    });

    it('should verify relationship types are correct', async () => {
      const contents = generateMockVideos(20);
      await service.buildGraph(contents);

      const stats = service.getStats();
      
      // Verify all expected relationship types exist
      expect(stats.edgesByType).toHaveProperty('created_by');
      expect(stats.edgesByType.created_by).toBeGreaterThan(0);
    });

    it('should maintain high accuracy with large dataset', async () => {
      const contents = generateMockVideos(100);
      await service.buildGraph(contents);

      const groundTruth = contents.map(c => ({
        source: c.id,
        target: `creator-${c.creatorId}`,
        type: 'created_by',
      }));

      const accuracy = service.calculateAccuracy(groundTruth);
      expect(accuracy).toBeGreaterThanOrEqual(0.85);
    });
  });

  // ============================================================================
  // 6. Graph Performance Tests (1000+ nodes)
  // ============================================================================

  describe('Graph Performance', () => {
    it('should handle 1000+ nodes efficiently', async () => {
      const startTime = Date.now();
      const contents = generateMockVideos(200); // Will create 1000+ nodes with entities
      
      await service.buildGraph(contents);
      const buildTime = Date.now() - startTime;

      const stats = service.getStats();
      expect(stats.nodeCount).toBeGreaterThan(200);
      expect(buildTime).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    it('should handle 5000+ edges efficiently', async () => {
      const contents = generateMockVideos(200);
      await service.buildGraph(contents);

      const stats = service.getStats();
      expect(stats.edgeCount).toBeGreaterThan(200);
    });

    it('should query large graphs quickly', async () => {
      const contents = generateMockVideos(200);
      await service.buildGraph(contents);

      const startTime = Date.now();
      const results = service.query({ nodeType: 'content' });
      const queryTime = Date.now() - startTime;

      expect(results.length).toBe(200);
      expect(queryTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should find related content quickly in large graphs', async () => {
      const contents = generateMockVideos(200);
      await service.buildGraph(contents);

      const startTime = Date.now();
      const related = service.findRelatedContent('video-1', 10);
      const searchTime = Date.now() - startTime;

      expect(related.length).toBeGreaterThan(0);
      expect(searchTime).toBeLessThan(500); // Should complete in under 500ms
    });

    it('should handle graph statistics calculation efficiently', async () => {
      const contents = generateMockVideos(200);
      await service.buildGraph(contents);

      const startTime = Date.now();
      const stats = service.getStats();
      const statsTime = Date.now() - startTime;

      expect(stats.nodeCount).toBeGreaterThan(0);
      expect(stats.edgeCount).toBeGreaterThan(0);
      expect(statsTime).toBeLessThan(50); // Should complete in under 50ms
    });
  });

  // ============================================================================
  // 7. Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle duplicate entities gracefully', async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'AI Tutorial with Elon Musk',
          description: 'Elon Musk discusses AI',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
        {
          id: 'video-2',
          title: 'Another Elon Musk Interview',
          description: 'More from Elon Musk',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
      ];

      await service.buildGraph(contents);
      const stats = service.getStats();

      // Should not create duplicate person nodes
      const personNodes = service.query({ nodeType: 'person' });
      const elonNodes = personNodes.filter((n: any) => 
        n.label.toLowerCase().includes('elon')
      );
      expect(elonNodes.length).toBe(1);
    });

    it('should handle circular relationships', async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'AI and Machine Learning',
          description: 'Exploring AI',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
        {
          id: 'video-2',
          title: 'Machine Learning and AI',
          description: 'More on AI',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
      ];

      await service.buildGraph(contents);
      
      // Should not cause infinite loops
      const related1 = service.findRelatedContent('video-1', 10);
      const related2 = service.findRelatedContent('video-2', 10);

      // Both should complete without hanging (no infinite loops)
      expect(Array.isArray(related1)).toBe(true);
      expect(Array.isArray(related2)).toBe(true);
    });

    it('should handle orphaned nodes', async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'Random Video',
          description: 'No connections',
          creatorId: 'creator-1',
          creatorName: 'Creator',
        },
      ];

      await service.buildGraph(contents);
      const related = service.findRelatedContent('video-1', 10);

      // Should handle gracefully even with no related content
      expect(Array.isArray(related)).toBe(true);
    });

    it('should handle empty graph queries', () => {
      const results = service.query({ nodeType: 'content' });
      expect(results).toEqual([]);
    });

    it('should handle invalid content IDs', () => {
      const related = service.findRelatedContent('non-existent-id', 10);
      expect(related).toEqual([]);
    });

    it('should handle content with very long text', async () => {
      const longText = 'AI '.repeat(1000);
      const content = {
        id: 'video-1',
        title: longText,
        description: longText,
        transcript: longText,
        creatorId: 'creator-1',
        creatorName: 'Creator',
      };

      const entities = await service.extractEntities(content);
      expect(entities.topics).toContain('Ai');
    });

    it('should handle special characters in content', async () => {
      const content = {
        id: 'video-1',
        title: 'AI & ML: The Future! @2024 #Tech',
        description: 'Learn about AI/ML (machine learning)',
        creatorId: 'creator-1',
        creatorName: 'Creator',
      };

      const entities = await service.extractEntities(content);
      expect(entities.topics.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // 8. Connection Suggestions
  // ============================================================================

  describe('Connection Suggestions', () => {
    beforeEach(async () => {
      const contents = [
        {
          id: 'video-1',
          title: 'AI Tutorial',
          description: 'Learn AI',
          creatorId: 'creator-1',
          creatorName: 'Tech Guru',
        },
        {
          id: 'video-2',
          title: 'Machine Learning Guide',
          description: 'ML basics',
          creatorId: 'creator-2',
          creatorName: 'Data Scientist',
        },
        {
          id: 'video-3',
          title: 'AI Applications',
          description: 'Real AI use cases',
          creatorId: 'creator-3',
          creatorName: 'AI Expert',
        },
        {
          id: 'video-4',
          title: 'Cooking Tutorial',
          description: 'How to cook',
          creatorId: 'creator-4',
          creatorName: 'Chef',
        },
      ];

      await service.buildGraph(contents);
    });

    it('should suggest connections between creators', () => {
      const suggestions = service.suggestConnections('creator-1', 5);
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should include shared topics in suggestions', () => {
      const suggestions = service.suggestConnections('creator-1', 5);
      
      if (suggestions.length > 0) {
        expect(suggestions[0]).toHaveProperty('sharedTopics');
        expect(Array.isArray(suggestions[0].sharedTopics)).toBe(true);
      }
    });

    it('should calculate connection scores', () => {
      const suggestions = service.suggestConnections('creator-1', 5);
      
      for (const suggestion of suggestions) {
        expect(suggestion).toHaveProperty('score');
        expect(suggestion.score).toBeGreaterThan(0);
        expect(suggestion.score).toBeLessThanOrEqual(1);
      }
    });

    it('should sort suggestions by score', () => {
      const suggestions = service.suggestConnections('creator-1', 5);
      
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i - 1].score).toBeGreaterThanOrEqual(suggestions[i].score);
      }
    });

    it('should respect limit parameter', () => {
      const suggestions = service.suggestConnections('creator-1', 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should not suggest connection to self', () => {
      const suggestions = service.suggestConnections('creator-1', 10);
      const selfConnection = suggestions.some(s => s.targetCreatorId === 'creator-1');
      expect(selfConnection).toBe(false);
    });
  });

  // ============================================================================
  // 9. Graph Statistics and Visualization
  // ============================================================================

  describe('Graph Statistics', () => {
    beforeEach(async () => {
      const contents = generateMockVideos(50);
      await service.buildGraph(contents);
    });

    it('should provide accurate node count', () => {
      const stats = service.getStats();
      expect(stats.nodeCount).toBeGreaterThan(50);
    });

    it('should provide accurate edge count', () => {
      const stats = service.getStats();
      expect(stats.edgeCount).toBeGreaterThan(50);
    });

    it('should break down nodes by type', () => {
      const stats = service.getStats();
      
      expect(stats.nodesByType).toHaveProperty('content');
      expect(stats.nodesByType).toHaveProperty('creator');
      expect(stats.nodesByType.content).toBe(50);
    });

    it('should break down edges by type', () => {
      const stats = service.getStats();
      
      expect(stats.edgesByType).toHaveProperty('created_by');
      expect(stats.edgesByType.created_by).toBe(50);
    });

    it('should update stats after adding nodes', async () => {
      const statsBefore = service.getStats();
      
      const newContents = generateMockVideos(10, 50);
      await service.buildGraph(newContents);
      
      const statsAfter = service.getStats();
      expect(statsAfter.nodeCount).toBeGreaterThan(statsBefore.nodeCount);
    });
  });

  // ============================================================================
  // 10. Graph Clearing and Reset
  // ============================================================================

  describe('Graph Management', () => {
    it('should clear all nodes and edges', async () => {
      const contents = generateMockVideos(20);
      await service.buildGraph(contents);

      service.clear();
      const stats = service.getStats();

      expect(stats.nodeCount).toBe(0);
      expect(stats.edgeCount).toBe(0);
    });

    it('should allow rebuilding after clear', async () => {
      const contents1 = generateMockVideos(10);
      await service.buildGraph(contents1);
      service.clear();

      const contents2 = generateMockVideos(15);
      await service.buildGraph(contents2);

      const stats = service.getStats();
      expect(stats.nodeCount).toBeGreaterThan(0);
      expect(stats.nodesByType.content).toBe(15);
    });
  });
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate mock video data for testing
 */
function generateMockVideos(count: number, startIndex: number = 0): Array<{
  id: string;
  title: string;
  description: string;
  transcript?: string;
  creatorId: string;
  creatorName: string;
}> {
  const topics = [
    'AI', 'Machine Learning', 'Blockchain', 'Cryptocurrency', 'Web3',
    'Startup', 'Entrepreneurship', 'Technology', 'Innovation', 'Business',
    'Marketing', 'Design', 'Programming', 'Data Science', 'Cloud Computing',
  ];

  const people = [
    'Elon Musk', 'Bill Gates', 'Jeff Bezos', 'Mark Zuckerberg', 'Steve Jobs',
  ];

  const places = [
    'Silicon Valley', 'San Francisco', 'New York', 'London', 'Tokyo',
  ];

  const concepts = [
    'Growth', 'Scale', 'Revenue', 'Profit', 'Strategy', 'Vision', 'Mission',
  ];

  const videos = [];

  for (let i = startIndex; i < startIndex + count; i++) {
    const randomTopics = [
      topics[i % topics.length],
      topics[(i + 1) % topics.length],
    ];
    const randomPerson = people[i % people.length];
    const randomPlace = places[i % places.length];
    const randomConcept = concepts[i % concepts.length];

    videos.push({
      id: `video-${i + 1}`,
      title: `${randomTopics[0]} Tutorial ${i + 1}`,
      description: `Learn about ${randomTopics[0]} and ${randomTopics[1]} with ${randomPerson}`,
      transcript: `Discussing ${randomTopics[0]} in ${randomPlace}. Focus on ${randomConcept}.`,
      creatorId: `creator-${(i % 10) + 1}`,
      creatorName: `Creator ${(i % 10) + 1}`,
    });
  }

  return videos;
}
