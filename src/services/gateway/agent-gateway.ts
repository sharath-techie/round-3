import { AgentType, AgentGatewayCheck, ProjectCharter, User } from '@/types';
import { db } from '@/lib/db';

export interface AIInvocationRequest {
  user: User;
  projectId: string;
  agentType: AgentType;
  requestedTools: string[];
  prompt: string;
  dataClassificationRequested?: 'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL';
}

export class AgentGateway {
  /**
   * The Gateway is the enforcement boundary.
   * Every AI request must pass through:
   * User -> Auth -> Project Context -> Role -> Charter -> Agent -> Tool -> Data -> Rate -> Mesh
   */
  static evaluate(request: AIInvocationRequest): AgentGatewayCheck {
    const { user, projectId, agentType, requestedTools, prompt, dataClassificationRequested } = request;
    const charter = db.getCharterByProjectId(projectId);

    // 1. Project Context & Charter Existence Check
    if (!charter) {
      const auditId = this.recordAudit(
        user,
        'AGENT_GATEWAY_DENIAL',
        agentType,
        'DENIED',
        `No valid Charter found for Project ${projectId}`
      );
      return {
        allowed: false,
        reason: 'Project Charter Missing or Invalid.',
        charterViolations: ['Missing Project Charter'],
        permittedTools: [],
        auditEventId: auditId,
        rateLimitRemaining: 0,
      };
    }

    const violations: string[] = [];

    // 2. Human Role Authorization in Charter
    if (!charter.humanPermissions.allowedRoles.includes(user.role)) {
      violations.push(`Role ${user.role} is not permitted to initiate AI actions under Charter v${charter.version}`);
    }

    // 3. AI Permissions Global Check
    if (!charter.aiPermissions.aiAssistanceAllowed) {
      violations.push(`AI assistance is strictly disabled for project ${projectId} by sponsor charter.`);
    }

    // 4. Agent Whitelist / Restriction Check
    if (!charter.agentPermissions.allowedAgents.includes(agentType)) {
      violations.push(`Agent '${agentType}' is NOT permitted in project charter. Allowed: [${charter.agentPermissions.allowedAgents.join(', ')}]`);
    }
    if (charter.agentPermissions.restrictedAgents.includes(agentType)) {
      violations.push(`Agent '${agentType}' is explicitly marked as RESTRICTED in Charter.`);
    }

    // 5. Tool Permission Checks (Whitelist and Banned)
    const permittedTools: string[] = [];
    for (const tool of requestedTools) {
      if (charter.toolPermissions.bannedTools.includes(tool)) {
        violations.push(`Tool '${tool}' is in the Charter BANNED tools list.`);
      } else if (!charter.toolPermissions.allowedTools.includes(tool)) {
        violations.push(`Tool '${tool}' is not in the Charter ALLOWED tools list.`);
      } else {
        permittedTools.push(tool);
      }
    }

    // 6. Data Classification & Privacy Boundary Check
    if (dataClassificationRequested) {
      const levels = { PUBLIC: 1, RESTRICTED: 2, CONFIDENTIAL: 3 };
      const charterLevel = levels[charter.dataPermissions.sensitivityLevel] || 1;
      const requestedLevel = levels[dataClassificationRequested] || 1;

      if (requestedLevel > charterLevel) {
        violations.push(`Data classification '${dataClassificationRequested}' exceeds Charter sensitivity limit '${charter.dataPermissions.sensitivityLevel}'.`);
      }
    }

    // 7. Rate / Token Budget Check
    const tokenEstimate = Math.ceil(prompt.length / 3) + 2000;
    if (tokenEstimate > charter.aiPermissions.maxTokensPerSession) {
      violations.push(`Prompt size token estimate (${tokenEstimate}) exceeds Charter per-session cap (${charter.aiPermissions.maxTokensPerSession}).`);
    }

    // Determine Outcome
    const isAllowed = violations.length === 0;
    const auditId = this.recordAudit(
      user,
      isAllowed ? 'AGENT_GATEWAY_APPROVED' : 'AGENT_GATEWAY_DENIED',
      agentType,
      isAllowed ? 'SUCCESS' : 'DENIED',
      isAllowed
        ? `Request approved for ${agentType} with ${permittedTools.length} tools.`
        : `Request denied due to ${violations.length} charter violations: ${violations[0]}`,
      { violations, requestedTools, permittedTools, projectId }
    );

    return {
      allowed: isAllowed,
      reason: isAllowed ? 'Charter policy validation passed.' : violations[0],
      charterViolations: violations,
      permittedTools,
      auditEventId: auditId,
      rateLimitRemaining: 95,
    };
  }

  private static recordAudit(
    user: User,
    action: string,
    resource: string,
    outcome: 'SUCCESS' | 'DENIED' | 'ERROR',
    details: string,
    metadata?: Record<string, any>
  ): string {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    db.addAuditEvent({
      id,
      timestamp: new Date().toISOString(),
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action,
      resource,
      outcome,
      details,
      metadata,
    });
    return id;
  }
}
