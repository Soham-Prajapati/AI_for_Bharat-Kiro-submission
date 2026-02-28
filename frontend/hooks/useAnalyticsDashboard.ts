/**
 * Analytics Dashboard Hook
 * Manages analytics data fetching, caching, and auto-refresh
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@/services/api';
import {
  AnalyticsDashboard,
  Metric,
  Insight,
  PlatformPerformance,
  DateRange,
} from '@/types/api';

// ============================================================================
// TYPES
// ============================================================================

interface UseAnalyticsDashboardOptions {
  userId: string;
  dateRange?: DateRange;
  autoRefresh?: boolean;
  refresh