import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API Route: Create collaboration request
 * POST /api/regional/collab-request
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { toCreatorId, message, collabType } = req.body;

    // Validate required fields
    if (!toCreatorId || !message || !collabType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['toCreatorId', 'message', 'collabType'],
      });
    }

    // In production, get fromCreatorId from authenticated session
    const fromCreatorId = 'current_user'; // TODO: Get from auth context

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/regional/collab-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromCreatorId,
        toCreatorId,
        message,
        collabType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error creating collaboration request:', error);
    return res.status(500).json({
      error: 'Failed to create collaboration request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
