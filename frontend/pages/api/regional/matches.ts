import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API Route: Get collaboration matches for a creator
 * GET /api/regional/matches?creatorId=xxx&limit=10
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { creatorId, limit = '10' } = req.query;

    if (!creatorId) {
      return res.status(400).json({ error: 'creatorId is required' });
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('creatorId', creatorId as string);
    params.append('limit', limit as string);

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/regional/matches?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return res.status(500).json({
      error: 'Failed to fetch matches',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
