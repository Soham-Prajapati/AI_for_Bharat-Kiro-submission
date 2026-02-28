/**
 * Regional Network UI - Custom React Hook
 * Manages state, API calls, and business logic for regional network features
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RegionalNetworkState,
  RegionData,
  CreatorProfile,
  CreatorFilters,
  CollaborationRequest,
  SendCollaborationRequest,
  WebSocketEvent,
  Region,
  PaginationParams,
} from '@/types/regional-network';
import apiClient from '@/services/api';

// ============================================================================
// HOOK CONFIGURATION
// ============================================================================

const DEFAULT_PAGE_SIZE = 20;
const DEBOUNCE_DELAY = 500;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: RegionalNetworkState = {
  regions: {
    data: [],
    stats: {},
    loading: false,
    error: null,
  },
  creators: {
    data: [],
    total: 0,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    hasMore: false,
    loading: false,
    error: null,
  },
  filters: {},
  searchQuery: '',
  selectedRegion: null,
  selectedCreator: null,
  collaborationRequests: {
    sent: [],
    received: [],
    loading: false,
    error: null,
  },
  notifications: {
    unreadCount: 0,
    items: [],
  },
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useRegionalNetwork() {
  const [state, setState] = useState<RegionalNetworkState>(initialState);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const wsRef = useRef<WebSocket | null>(null);

  // --------------------------------------------------------------------------
  // REGIONS
  // --------------------------------------------------------------------------

  const fetchRegions = useCallback(async (includeStats = true) => {
    setState((prev) => ({
      ...prev,
      regions: { ...prev.regions, loading: true, error: null },
    }));

    try {
      const response = await apiClient.regional.getRegions({ includeStats });
      
      setState((prev) => ({
        ...prev,
        regions: {
          data: response.regions,
          stats: response.stats || {},
          loading: false,
          error: null,
        },
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        regions: {
          ...prev.regions,
          loading: false,
          error: error.message || 'Failed to fetch regions',
        },
      }));
    }
  }, []);

  const selectRegion = useCallback((region: Region | null) => {
    setState((prev) => ({
      ...prev,
      selectedRegion: region,
      creators: { ...initialState.creators },
      filters: region ? { ...prev.filters, regions: [region] } : {},
    }));
  }, []);

  // --------------------------------------------------------------------------
  // CREATORS
  // --------------------------------------------------------------------------

  const fetchCreators = useCallback(
    async (params?: { page?: number; append?: boolean }) => {
      const page = params?.page || state.creators.page;
      const append = params?.append || false;

      setState((prev) => ({
        ...prev,
        creators: { ...prev.creators, loading: true, error: null },
      }));

      try {
        const response = await apiClient.regional.getCreators({
          ...state.filters,
          query: state.searchQuery,
          page,
          limit: state.creators.limit,
          regionId: state.selectedRegion || undefined,
        });

        setState((prev) => ({
          ...prev,
          creators: {
            data: append
              ? [...prev.creators.data, ...response.creators.items]
              : response.creators.items,
            total: response.creators.total,
            page: response.creators.page,
            limit: response.creators.limit,
            hasMore: response.creators.hasMore,
            loading: false,
            error: null,
          },
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          creators: {
            ...prev.creators,
            loading: false,
            error: error.message || 'Failed to fetch creators',
          },
        }));
      }
    },
    [state.filters, state.searchQuery, state.selectedRegion, state.creators.page, state.creators.limit]
  );

  const loadMoreCreators = useCallback(() => {
    if (!state.creators.loading && state.creators.hasMore) {
      fetchCreators({ page: state.creators.page + 1, append: true });
    }
  }, [state.creators.loading, state.creators.hasMore, state.creators.page, fetchCreators]);

  const selectCreator = useCallback(async (creatorId: string) => {
    try {
      const response = await apiClient.regional.getCreator({
        creatorId,
        includeStats: true,
      });

      setState((prev) => ({
        ...prev,
        selectedCreator: response.creator,
      }));
    } catch (error: any) {
      console.error('Failed to fetch creator:', error);
    }
  }, []);

  const clearSelectedCreator = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedCreator: null,
    }));
  }, []);

  // --------------------------------------------------------------------------
  // FILTERS & SEARCH
  // --------------------------------------------------------------------------

  const updateFilters = useCallback((newFilters: Partial<CreatorFilters>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      creators: { ...initialState.creators },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: {},
      creators: { ...initialState.creators },
    }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({
      ...prev,
      searchQuery: query,
    }));

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        creators: { ...initialState.creators },
      }));
    }, DEBOUNCE_DELAY);
  }, []);

  // --------------------------------------------------------------------------
  // COLLABORATION REQUESTS
  // --------------------------------------------------------------------------

  const fetchCollaborationRequests = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      collaborationRequests: { ...prev.collaborationRequests, loading: true, error: null },
    }));

    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        apiClient.regional.getCollaborationRequests({ type: 'sent' }),
        apiClient.regional.getCollaborationRequests({ type: 'received' }),
      ]);

      setState((prev) => ({
        ...prev,
        collaborationRequests: {
          sent: sentResponse.requests.items,
          received: receivedResponse.requests.items,
          loading: false,
          error: null,
        },
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        collaborationRequests: {
          ...prev.collaborationRequests,
          loading: false,
          error: error.message || 'Failed to fetch collaboration requests',
        },
      }));
    }
  }, []);

  const sendCollaborationRequest = useCallback(
    async (data: SendCollaborationRequest) => {
      try {
        const response = await apiClient.regional.sendCollaborationRequest(data);

        setState((prev) => ({
          ...prev,
          collaborationRequests: {
            ...prev.collaborationRequests,
            sent: [response.request, ...prev.collaborationRequests.sent],
          },
        }));

        return response;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to send collaboration request');
      }
    },
    []
  );

  const acceptCollaborationRequest = useCallback(async (requestId: string) => {
    try {
      const response = await apiClient.regional.updateCollaborationRequest({
        requestId,
        status: 'accepted',
      });

      setState((prev) => ({
        ...prev,
        collaborationRequests: {
          ...prev.collaborationRequests,
          received: prev.collaborationRequests.received.map((req) =>
            req.id === requestId ? response.request : req
          ),
        },
      }));

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to accept collaboration request');
    }
  }, []);

  const rejectCollaborationRequest = useCallback(async (requestId: string) => {
    try {
      const response = await apiClient.regional.updateCollaborationRequest({
        requestId,
        status: 'rejected',
      });

      setState((prev) => ({
        ...prev,
        collaborationRequests: {
          ...prev.collaborationRequests,
          received: prev.collaborationRequests.received.map((req) =>
            req.id === requestId ? response.request : req
          ),
        },
      }));

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reject collaboration request');
    }
  }, []);

  const cancelCollaborationRequest = useCallback(async (requestId: string) => {
    try {
      const response = await apiClient.regional.updateCollaborationRequest({
        requestId,
        status: 'cancelled',
      });

      setState((prev) => ({
        ...prev,
        collaborationRequests: {
          ...prev.collaborationRequests,
          sent: prev.collaborationRequests.sent.map((req) =>
            req.id === requestId ? response.request : req
          ),
        },
      }));

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel collaboration request');
    }
  }, []);

  // --------------------------------------------------------------------------
  // WEBSOCKET (Optional Real-time Updates)
  // --------------------------------------------------------------------------

  const connectWebSocket = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws';
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const wsEvent: WebSocketEvent = JSON.parse(event.data);
          
          // Handle different event types
          switch (wsEvent.type) {
            case 'collaboration_request_received':
              setState((prev) => ({
                ...prev,
                collaborationRequests: {
                  ...prev.collaborationRequests,
                  received: [wsEvent.payload, ...prev.collaborationRequests.received],
                },
                notifications: {
                  unreadCount: prev.notifications.unreadCount + 1,
                  items: [wsEvent, ...prev.notifications.items],
                },
              }));
              break;

            case 'collaboration_request_accepted':
            case 'collaboration_request_rejected':
              setState((prev) => ({
                ...prev,
                notifications: {
                  unreadCount: prev.notifications.unreadCount + 1,
                  items: [wsEvent, ...prev.notifications.items],
                },
              }));
              break;

            default:
              console.log('Unhandled WebSocket event:', wsEvent.type);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: {
        unreadCount: 0,
        items: [],
      },
    }));
  }, []);

  // --------------------------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------------------------

  // Fetch regions on mount
  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  // Fetch creators when filters or search changes
  useEffect(() => {
    if (state.regions.data.length > 0) {
      fetchCreators();
    }
  }, [state.filters, state.searchQuery, state.selectedRegion]);

  // Connect WebSocket on mount (optional)
  useEffect(() => {
    // Uncomment to enable real-time updates
    // connectWebSocket();
    
    return () => {
      disconnectWebSocket();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // --------------------------------------------------------------------------
  // RETURN
  // --------------------------------------------------------------------------

  return {
    // State
    state,
    
    // Regions
    regions: state.regions.data,
    regionsLoading: state.regions.loading,
    regionsError: state.regions.error,
    selectedRegion: state.selectedRegion,
    selectRegion,
    
    // Creators
    creators: state.creators.data,
    creatorsLoading: state.creators.loading,
    creatorsError: state.creators.error,
    creatorsHasMore: state.creators.hasMore,
    loadMoreCreators,
    selectedCreator: state.selectedCreator,
    selectCreator,
    clearSelectedCreator,
    
    // Filters & Search
    filters: state.filters,
    updateFilters,
    resetFilters,
    searchQuery: state.searchQuery,
    setSearchQuery,
    
    // Collaboration
    collaborationRequests: state.collaborationRequests,
    fetchCollaborationRequests,
    sendCollaborationRequest,
    acceptCollaborationRequest,
    rejectCollaborationRequest,
    cancelCollaborationRequest,
    
    // Notifications
    notifications: state.notifications,
    clearNotifications,
    
    // WebSocket
    connectWebSocket,
    disconnectWebSocket,
  };
}

export default useRegionalNetwork;
