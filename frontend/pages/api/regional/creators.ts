import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API Route: Get creators by region
 * GET /api/regional/creators?region=north&language=hindi&niche=technology
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { region, language, niche, minAudienceSize } = req.query;

    // Build query parameters
    const params = new URLSearchParams();
    if (region) params.append('region', region as string);
    if (language) params.append('language', language as string);
    if (niche) params.append('niche', niche as string);
    if (minAudienceSize) params.append('minAudienceSize', minAudienceSize as string);

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/regional/creators?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching creators:', error);
    return res.status(500).json({
      error: 'Failed to fetch creators',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
