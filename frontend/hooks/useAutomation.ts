/**
 * useAutomation Hook
 * Comprehensive React hook for automation management
 */

import { useState, useEffect, useCallback } from 'react';
import automationService, { AutomationValidator } from '@/services/automation.service';
import {
  Automation,
  CreateAutomationRequest,
  UpdateAutomationRequest,
  ListAutomationsRequest,
  AutomationStatus,
  TestAutomationResponse,
  AutomationExecution,
  AutomationTemplate,
  ValidationResult,
  AutomationListState,
} from '@/types/automation';

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

interface UseAutomationReturn {
  // State
  automations: Automation[];
  loading: boolean;
  error: string | null;
  selectedAutomation: Automation | null;
  testResults: TestAutomationResponse | null;
  validationResult: ValidationResult | null;
  templates: AutomationTemplate[];

  // Actions
  fetchAutomations: (params: ListAutomationsRequest) => Promise<void>;
  createAutomation: (data: CreateAutomationRequest) => Promise<Automation>;
  updateAutomation: (id: string, data: UpdateAutomationRequest) => Promise<Automation>;
  deleteAutomation: (id: string) => Promise<void>;
  toggleAutomation: (id: string, enabled: boolean) => Promise<void>;
  testAutomation: (id: string, dryRun?: boolean) => Promise<TestAutomationResponse>;
  triggerAutomation: (id: string) => Promise<string>;
  duplicateAutomation: (id: string, newName?: string) => Promise<Automation>;
  validateAutomation: (automation: Partial<Automation>) => ValidationResult;
  selectAutomation: (automation: Automation | null) => void;
  fetchTemplates: () => Promise<void>;
  createFromTemplate: (templateId: string, userId: string) => Promise<Automation>;
  clearError: () => void;
  refresh: () => Promise<void>;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useAutomation(userId?: string): UseAutomationReturn {
  const [state, setState] = useState<AutomationListState>({
    automations: [],
    loading: false,
    error: null,
    filters: {},
    pagination: {
      total: 0,
      limit: 20,
      offset: 0,
    },
    selectedAutomation: undefined,
  });

  const [testResults, setTestResults] = useState<TestAutomationResponse | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);

  // ============================================================================
  // FETCH AUTOMATIONS
  // ============================================================================

  const fetchAutomations = useCallback(async (params: ListAutomationsRequest) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await automationService.list(params);
      setState((prev) => ({
        ...prev,
        automations: response.automations,
        loading: false,
        pagination: {
          total: response.total,
          limit: response.limit,
          offset: response.offset,
        },
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch automations',
      }));
    }
  }, []);

  // ============================================================================
  // CREATE AUTOMATION
  // ============================================================================

  const createAutomation = useCallback(
    async (data: CreateAutomationRequest): Promise<Automation> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const automation = await automationService.create(data);
        setState((prev) => ({
          ...prev,
          automations: [automation, ...prev.automations],
          loading: false,
        }));
        return automation;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to create automation',
        }));
        throw err;
      }
    },
    []
  );

  // ============================================================================
  // UPDATE AUTOMATION
  // ============================================================================

  const updateAutomation = useCallback(
    async (id: string, data: UpdateAutomationRequest): Promise<Automation> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const automation = await automationService.update(id, data);
        setState((prev) => ({
          ...prev,
          automations: prev.automations.map((a) =>
            a.automationId === id ? automation : a
          ),
          loading: false,
          selectedAutomation:
            prev.selectedAutomation?.automationId === id
              ? automation
              : prev.selectedAutomation,
        }));
        return automation;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to update automation',
        }));
        throw err;
      }
    },
    []
  );

  // ============================================================================
  // DELETE AUTOMATION
  // ============================================================================

  const deleteAutomation = useCallback(async (id: string): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await automationService.delete(id);
      setState((prev) => ({
        ...prev,
        automations: prev.automations.filter((a) => a.automationId !== id),
        loading: false,
        selectedAutomation:
          prev.selectedAutomation?.automationId === id
            ? undefined
            : prev.selectedAutomation,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to delete automation',
      }));
      throw err;
    }
  }, []);

  // ============================================================================
  // TOGGLE AUTOMATION
  // ============================================================================

  const toggleAutomation = useCallback(
    async (id: string, enabled: boolean): Promise<void> => {
      try {
        await automationService.toggle({ automationId: id, enabled });
        setState((prev) => ({
          ...prev,
          automations: prev.automations.map((a) =>
            a.automationId === id ? { ...a, enabled } : a
          ),
          selectedAutomation:
            prev.selectedAutomation?.automationId === id
              ? { ...prev.selectedAutomation, enabled }
              : prev.selectedAutomation,
        }));
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          error: err.message || 'Failed to toggle automation',
        }));
        throw err;
      }
    },
    []
  );

  // ============================================================================
  // TEST AUTOMATION
  // ============================================================================

  const testAutomation = useCallback(
    async (id: string, dryRun: boolean = true): Promise<TestAutomationResponse> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      setTestResults(null);

      try {
        const results = await automationService.test({
          automationId: id,
          dryRun,
        });
        setTestResults(results);
        setState((prev) => ({ ...prev, loading: false }));
        return results;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to test automation',
        }));
        throw err;
      }
    },
    []
  );

  // ============================================================================
  // TRIGGER AUTOMATION
  // ============================================================================

  const triggerAutomation = useCallback(async (id: string): Promise<string> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { executionId } = await automationService.trigger(id);
      setState((prev) => ({ ...prev, loading: false }));
      return executionId;
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to trigger automation',
      }));
      throw err;
    }
  }, []);

  // ============================================================================
  // DUPLICATE AUTOMATION
  // ============================================================================

  const duplicateAutomation = useCallback(
    async (id: string, newName?: string): Promise<Automation> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const automation = await automationService.duplicate(id, newName);
        setState((prev) => ({
          ...prev,
          automations: [automation, ...prev.automations],
          loading: false,
        }));
        return automation;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to duplicate automation',
        }));
        throw err;
      }
    },
    []
  );

  // ============================================================================
  // VALIDATE AUTOMATION
  // ============================================================================

  const validateAutomation = useCallback((automation: Partial<Automation>): ValidationResult => {
    const result = AutomationValidator.validateAutomation(automation);
    setValidationResult(result);
    return result;
  }, []);

  // ============================================================================
  // SELECT AUTOMATION
  // ============================================================================

  const selectAutomation = useCallback((automation: Automation | null) => {
    setState((prev) => ({
      ...prev,
      selectedAutomation: automation || undefined,
    }));
  }, []);

  // ============================================================================
  // FETCH TEMPLATES
  // ============================================================================

  const fetchTemplates = useCallback(async () => {
    try {
      const fetchedTemplates = await automationService.getTemplates();
      setTemplates(fetchedTemplates);
    } catch (err: any) {
      console.error('Failed to fetch templates:', err);
    }
  }, []);

  // ============================================================================
  // CREATE FROM TEMPLATE
  // ============================================================================

  const createFromTemplate = useCallback(
    async (templateId: string, userId: string): Promise<Automation> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const automation = await automationService.createFromTemplate(templateId, userId);
        setState((prev) => ({
          ...prev,
          automations: [automation, ...prev.automations],
          loading: false,
        }));
        return automation;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to create automation from template',
        }));
        throw err;
      }
    },
    []
  );

  // ============================================================================
  // CLEAR ERROR
  // ============================================================================

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // ============================================================================
  // REFRESH
  // ============================================================================

  const refresh = useCallback(async () => {
    if (userId) {
      await fetchAutomations({ userId });
    }
  }, [userId, fetchAutomations]);

  // ============================================================================
  // AUTO-FETCH ON MOUNT
  // ============================================================================

  useEffect(() => {
    if (userId) {
      fetchAutomations({ userId });
      fetchTemplates();
    }
  }, [userId, fetchAutomations, fetchTemplates]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    automations: state.automations,
    loading: state.loading,
    error: state.error,
    selectedAutomation: state.selectedAutomation || null,
    testResults,
    validationResult,
    templates,
    fetchAutomations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    testAutomation,
    triggerAutomation,
    duplicateAutomation,
    validateAutomation,
    selectAutomation,
    fetchTemplates,
    createFromTemplate,
    clearError,
    refresh,
  };
}

// ============================================================================
// AUTOMATION HISTORY HOOK
// ============================================================================

interface UseAutomationHistoryReturn {
  executions: AutomationExecution[];
  loading: boolean;
  error: string | null;
  fetchHistory: (automationId: string, limit?: number, offset?: number) => Promise<void>;
}

export function useAutomationHistory(): UseAutomationHistoryReturn {
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (automationId: string, limit: number = 20, offset: number = 0) => {
      setLoading(true);
      setError(null);

      try {
        const response = await automationService.getHistory({
          automationId,
          limit,
          offset,
        });
        setExecutions(response.executions);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch automation history');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    executions,
    loading,
    error,
    fetchHistory,
  };
}

export default useAutomation;
