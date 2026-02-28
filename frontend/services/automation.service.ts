/**
 * Automation Service
 * Enhanced API client methods for automation management
 */

import apiClient from './api';
import {
  Automation,
  CreateAutomationRequest,
  UpdateAutomationRequest,
  ListAutomationsRequest,
  ListAutomationsResponse,
  DeleteAutomationResponse,
  TestAutomationRequest,
  TestAutomationResponse,
  ToggleAutomationRequest,
  ToggleAutomationResponse,
  GetAutomationHistoryRequest,
  GetAutomationHistoryResponse,
  AutomationTemplate,
  ValidationResult,
  AutomationTrigger,
  AutomationAction,
  AutomationCondition,
} from '@/types/automation';

// ============================================================================
// AUTOMATION API CLIENT
// ============================================================================

class AutomationService {
  /**
   * Create a new automation
   */
  async create(data: CreateAutomationRequest): Promise<Automation> {
    return apiClient.request<Automation>('/api/automation/create', {
      method: 'POST',
      body: data,
    });
  }

  /**
   * List automations with filtering and pagination
   */
  async list(params: ListAutomationsRequest): Promise<ListAutomationsResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('userId', params.userId);
    
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return apiClient.request<ListAutomationsResponse>(
      `/api/automation/list?${queryParams}`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * Get a single automation by ID
   */
  async get(automationId: string): Promise<Automation> {
    return apiClient.request<Automation>(`/api/automation/${automationId}`, {
      method: 'GET',
    });
  }

  /**
   * Update an existing automation
   */
  async update(
    automationId: string,
    data: UpdateAutomationRequest
  ): Promise<Automation> {
    return apiClient.request<Automation>(`/api/automation/${automationId}`, {
      method: 'PUT',
      body: data,
    });
  }

  /**
   * Delete an automation
   */
  async delete(automationId: string): Promise<DeleteAutomationResponse> {
    return apiClient.request<DeleteAutomationResponse>(
      `/api/automation/${automationId}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * Toggle automation enabled/disabled state
   */
  async toggle(data: ToggleAutomationRequest): Promise<ToggleAutomationResponse> {
    return apiClient.request<ToggleAutomationResponse>(
      `/api/automation/${data.automationId}/toggle`,
      {
        method: 'PATCH',
        body: { enabled: data.enabled },
      }
    );
  }

  /**
   * Test an automation without actually executing it
   */
  async test(data: TestAutomationRequest): Promise<TestAutomationResponse> {
    return apiClient.request<TestAutomationResponse>(
      `/api/automation/${data.automationId}/test`,
      {
        method: 'POST',
        body: {
          dryRun: data.dryRun ?? true,
          mockData: data.mockData,
        },
        timeout: 60000, // 60 seconds for testing
      }
    );
  }

  /**
   * Manually trigger an automation
   */
  async trigger(automationId: string): Promise<{ executionId: string }> {
    return apiClient.request<{ executionId: string }>(
      `/api/automation/${automationId}/trigger`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Get automation execution history
   */
  async getHistory(
    params: GetAutomationHistoryRequest
  ): Promise<GetAutomationHistoryResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.status) queryParams.append('status', params.status);

    return apiClient.request<GetAutomationHistoryResponse>(
      `/api/automation/${params.automationId}/history?${queryParams}`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * Get available automation templates
   */
  async getTemplates(): Promise<AutomationTemplate[]> {
    return apiClient.request<AutomationTemplate[]>('/api/automation/templates', {
      method: 'GET',
    });
  }

  /**
   * Create automation from template
   */
  async createFromTemplate(
    templateId: string,
    userId: string,
    customizations?: Partial<CreateAutomationRequest>
  ): Promise<Automation> {
    return apiClient.request<Automation>(
      `/api/automation/templates/${templateId}/create`,
      {
        method: 'POST',
        body: {
          userId,
          ...customizations,
        },
      }
    );
  }

  /**
   * Validate automation configuration
   */
  async validate(automation: Partial<Automation>): Promise<ValidationResult> {
    return apiClient.request<ValidationResult>('/api/automation/validate', {
      method: 'POST',
      body: automation,
    });
  }

  /**
   * Duplicate an existing automation
   */
  async duplicate(automationId: string, newName?: string): Promise<Automation> {
    return apiClient.request<Automation>(
      `/api/automation/${automationId}/duplicate`,
      {
        method: 'POST',
        body: { name: newName },
      }
    );
  }

  /**
   * Get automation statistics
   */
  async getStats(userId: string): Promise<{
    totalAutomations: number;
    activeAutomations: number;
    totalExecutions: number;
    successRate: number;
    lastExecution?: string;
  }> {
    return apiClient.request(`/api/automation/stats?userId=${userId}`, {
      method: 'GET',
    });
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export class AutomationValidator {
  /**
   * Validate trigger configuration
   */
  static validateTrigger(trigger: AutomationTrigger): ValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    if (!trigger.type) {
      errors.push({
        field: 'trigger.type',
        message: 'Trigger type is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (trigger.type === 'schedule') {
      const scheduleTrigger = trigger as any;
      if (!scheduleTrigger.cron) {
        errors.push({
          field: 'trigger.cron',
          message: 'Cron expression is required for schedule triggers',
          code: 'REQUIRED_FIELD',
        });
      } else if (!this.isValidCron(scheduleTrigger.cron)) {
        errors.push({
          field: 'trigger.cron',
          message: 'Invalid cron expression',
          code: 'INVALID_FORMAT',
        });
      }
    }

    if (trigger.type === 'webhook') {
      const webhookTrigger = trigger as any;
      if (!webhookTrigger.webhookUrl) {
        errors.push({
          field: 'trigger.webhookUrl',
          message: 'Webhook URL is required',
          code: 'REQUIRED_FIELD',
        });
      } else if (!this.isValidUrl(webhookTrigger.webhookUrl)) {
        errors.push({
          field: 'trigger.webhookUrl',
          message: 'Invalid webhook URL',
          code: 'INVALID_FORMAT',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate action configuration
   */
  static validateAction(action: AutomationAction): ValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    if (!action.type) {
      errors.push({
        field: 'action.type',
        message: 'Action type is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!action.id) {
      errors.push({
        field: 'action.id',
        message: 'Action ID is required',
        code: 'REQUIRED_FIELD',
      });
    }

    // Type-specific validation
    switch (action.type) {
      case 'post':
        const postAction = action as any;
        if (!postAction.platform) {
          errors.push({
            field: 'action.platform',
            message: 'Platform is required for post actions',
            code: 'REQUIRED_FIELD',
          });
        }
        if (!postAction.content) {
          errors.push({
            field: 'action.content',
            message: 'Content is required for post actions',
            code: 'REQUIRED_FIELD',
          });
        }
        break;

      case 'webhook':
        const webhookAction = action as any;
        if (!webhookAction.url) {
          errors.push({
            field: 'action.url',
            message: 'URL is required for webhook actions',
            code: 'REQUIRED_FIELD',
          });
        } else if (!this.isValidUrl(webhookAction.url)) {
          errors.push({
            field: 'action.url',
            message: 'Invalid webhook URL',
            code: 'INVALID_FORMAT',
          });
        }
        break;

      case 'email':
        const emailAction = action as any;
        if (!emailAction.to || emailAction.to.length === 0) {
          errors.push({
            field: 'action.to',
            message: 'At least one recipient is required',
            code: 'REQUIRED_FIELD',
          });
        }
        if (!emailAction.subject) {
          errors.push({
            field: 'action.subject',
            message: 'Email subject is required',
            code: 'REQUIRED_FIELD',
          });
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate condition configuration
   */
  static validateCondition(condition: AutomationCondition): ValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    if (!condition.field) {
      errors.push({
        field: 'condition.field',
        message: 'Condition field is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!condition.operator) {
      errors.push({
        field: 'condition.operator',
        message: 'Condition operator is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (condition.value === undefined || condition.value === null) {
      warnings.push({
        field: 'condition.value',
        message: 'Condition value is empty',
        suggestion: 'Consider providing a value for better filtering',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate complete automation
   */
  static validateAutomation(automation: Partial<Automation>): ValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Basic fields
    if (!automation.name || automation.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Automation name is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!automation.trigger) {
      errors.push({
        field: 'trigger',
        message: 'Trigger configuration is required',
        code: 'REQUIRED_FIELD',
      });
    } else {
      const triggerValidation = this.validateTrigger(automation.trigger);
      errors.push(...triggerValidation.errors);
      warnings.push(...triggerValidation.warnings);
    }

    if (!automation.actions || automation.actions.length === 0) {
      errors.push({
        field: 'actions',
        message: 'At least one action is required',
        code: 'REQUIRED_FIELD',
      });
    } else {
      automation.actions.forEach((action, index) => {
        const actionValidation = this.validateAction(action);
        errors.push(
          ...actionValidation.errors.map((e) => ({
            ...e,
            field: `actions[${index}].${e.field}`,
          }))
        );
        warnings.push(
          ...actionValidation.warnings.map((w) => ({
            ...w,
            field: `actions[${index}].${w.field}`,
          }))
        );
      });
    }

    if (automation.conditions && automation.conditions.length > 0) {
      automation.conditions.forEach((condition, index) => {
        const conditionValidation = this.validateCondition(condition);
        errors.push(
          ...conditionValidation.errors.map((e) => ({
            ...e,
            field: `conditions[${index}].${e.field}`,
          }))
        );
        warnings.push(
          ...conditionValidation.warnings.map((w) => ({
            ...w,
            field: `conditions[${index}].${w.field}`,
          }))
        );
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Helper methods
  private static isValidCron(cron: string): boolean {
    // Basic cron validation (5 parts: minute hour day month weekday)
    const parts = cron.trim().split(/\s+/);
    return parts.length === 5;
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const automationService = new AutomationService();

export default automationService;
export { AutomationService };
