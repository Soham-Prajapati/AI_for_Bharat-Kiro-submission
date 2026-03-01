/**
 * Regional Network API Service
 * Handles all API calls for regional network features
 */

import {
  GetRegionsRequest,
  GetRegionsResponse,
  GetCreatorsRequest,
  GetCreatorsResponse,
  GetCreatorRequest,
  GetCreatorResponse,
  SendCollaborationRequest,
  SendCollaborationResponse,
  GetCollaborationRequestsRequest,
  GetCollaborationRequestsResponse,
  UpdateCollaborationRequest,
  UpdateCollaborationResponse,
} from '@/types/regional-network';

// ============================================================================
// API CLIENT EXTENSION
// ============================================================================

/**
 * Add regional network methods to the existing API client
 * This should be integrated into frontend/services/api.ts
 */

export const regionalNetworkApi = {
  /**
   * Get all regions with optional statistics
   */
  getRegions: async (params: GetRegionsRequest): Promise<GetRegionsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.includeStats) {
      queryParams.append('includeStats', 'true');
    }

    const response = await fetch(`/api/regional/regions?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch regions');
    }

    return response.json();
  },

  /**
   * Get creators with filtering, search, and pagination
   */
  getCreators: async (params: GetCreatorsRequest): Promise<GetCreatorsResponse> => {
    const queryParams = new URLSearchParams();
    
    // Pagination
    queryParams.append('page', params.page.toString());
    queryParams.append('limit', params.limit.toString());
    
    // Search
    if (params.query) {
      queryParams.append('query', params.query);
    }
    
    // Region filter
    if (params.regionId) {
      queryParams.append('regionId', params.regionId);
    }
    
    // Filters
    if (params.regions && params.regions.length > 0) {
      queryParams.append('regions', params.regions.join(','));
    }
    if (params.languages && params.languages.length > 0) {
      queryParams.append('languages', params.languages.join(','));
    }
    if (params.domains && params.domains.length > 0) {
      queryParams.append('domains', params.domains.join(','));
    }
    if (params.skills && params.skills.length > 0) {
      queryParams.append('skills', params.skills.join(','));
    }
    if (params.minFollowers !== undefined) {
      queryParams.append('minFollowers', params.minFollowers.toString());
    }
    if (params.maxFollowers !== undefined) {
      queryParams.append('maxFollowers', params.maxFollowers.toString());
    }
    if (params.minEngagement !== undefined) {
      queryParams.append('minEngagement', params.minEngagement.toString());
    }
    if (params.availableOnly) {
      queryParams.append('availableOnly', 'true');
    }
    if (params.verifiedOnly) {
      queryParams.append('verifiedOnly', 'true');
    }
    if (params.minRating !== undefined) {
      queryParams.append('minRating', params.minRating.toString());
    }
    
    // Sorting
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder);
    }

    const response = await fetch(`/api/regional/creators?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch creators');
    }

    return response.json();
  },

  /**
   * Get a single creator by ID with optional stats
   */
  getCreator: async (params: GetCreatorRequest): Promise<GetCreatorResponse> => {
    const queryParams = new URLSearchParams();
    if (params.includeStats) {
      queryParams.append('includeStats', 'true');
    }

    const response = await fetch(
      `/api/regional/creators/${params.creatorId}?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch creator');
    }

    return response.json();
  },

  /**
   * Send a collaboration request to another creator
   */
  sendCollaborationRequest: async (
    data: SendCollaborationRequest
  ): Promise<SendCollaborationResponse> => {
    const response = await fetch('/api/regional/collaboration/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send collaboration request');
    }

    return response.json();
  },

  /**
   * Get collaboration requests (sent or received)
   */
  getCollaborationRequests: async (
    params: GetCollaborationRequestsRequest
  ): Promise<GetCollaborationRequestsResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('type', params.type);
    
    if (params.status) {
      queryParams.append('status', params.status);
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const response = await fetch(`/api/regional/collaboration/requests?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch collaboration requests');
    }

    return response.json();
  },

  /**
   * Update a collaboration request (accept, reject, cancel)
   */
  updateCollaborationRequest: async (
    data: UpdateCollaborationRequest
  ): Promise<UpdateCollaborationResponse> => {
    const response = await fetch(
      `/api/regional/collaboration/request/${data.requestId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: data.status,
          message: data.message,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update collaboration request');
    }

    return response.json();
  },
};

export default regionalNetworkApi;
