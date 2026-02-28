import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API Route: Get all regional hubs with statistics
 * GET /api/regional/hubs
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/regional/hubs`);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching regional hubs:', error);
    return res.status(500).json({
      error: 'Failed to fetch regional hubs',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
