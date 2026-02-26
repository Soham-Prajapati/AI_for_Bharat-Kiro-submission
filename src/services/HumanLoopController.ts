/**
 * Human Loop Controller Service
 * Manages human-in-the-loop approval workflows
 */

import { ApprovalRequest, GeneratedContent } from '../types/core';

export class HumanLoopController {
  private approvalRequests: Map<string, ApprovalRequest>;

  constructor() {
    this.approvalRequests = new Map();
  }

  /**
   * Create approval request for generated content
   */
  async createApprovalRequest(
    contentId: string,
    generatedContent: GeneratedContent
  ): Promise<ApprovalRequest> {
    const request: ApprovalRequest = {
      id: this.generateRequestId(),
      contentId,
      generatedContent,
      status: 'pending',
      createdAt: new Date()
    };

    this.approvalRequests.set(request.id, request);
    return request;
  }

  /**
   * Process creator decision
   */
  async processDecision(
    requestId: string,
    decision: 'approved' | 'modified' | 'rejected',
    feedback?: string
  ): Promise<ApprovalRequest> {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    request.status = decision;
    request.creatorFeedback = feedback;
    request.resolvedAt = new Date();

    return request;
  }

  private generateRequestId(): string {
    return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
