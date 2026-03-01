import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { CacheService } from '../services/cache.service';
import { knowledgeGraphService } from '../services/knowledge-graph.service';

const router = Router();
const cache = new CacheService();
const CACHE_TTL = 1 * 60 * 60; // 1 hour

// GET /api/graph/explore - Explore knowledge graph
router.get('/explore', asyncHandler(async (req: Request, res: Response) => {
  const { topic, depth = 2 } = req.query;
  const cacheKey = `graph:explore:${topic}:${depth}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached as string));
  }

  // Uses the actual knowledge graph service
  const graphData = await knowledgeGraphService.exploreGraph(topic as string, Number(depth));

  await cache.set(cacheKey, JSON.stringify(graphData), CACHE_TTL);
  res.json(graphData);
}));

// GET /api/graph/related - Get related content
router.get('/related', asyncHandler(async (req: Request, res: Response) => {
  const { contentId, limit = 10 } = req.query;
  const cacheKey = `graph:related:${contentId}:${limit}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached as string));
  }

  // Uses the actual knowledge graph service
  const recommendations = await knowledgeGraphService.findRelatedContent(contentId as string, Number(limit));

  await cache.set(cacheKey, JSON.stringify({ recommendations }), CACHE_TTL);
  res.json({ recommendations });
}));

export default router;
