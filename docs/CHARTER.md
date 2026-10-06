# VERO — Project Charter Specification & Policy Enforcement

## 1. Concept: Charter as an Executable Contract
In traditional research or LMS settings, guidelines exist as static PDF documents or advisory rubrics.
In **VERO**, the **Project Charter** is a first-class, machine-enforceable contract that governs:
1. What human members may do in the project.
2. Which AI agents may run, with what frequency and tool privileges.
3. What data may be accessed and under what license.
4. What reproducible evidence is required before any mentor can approve a contribution.
5. How credits, reputation, and escrow funds are disbursed.

---

## 2. Charter Schema Breakdown

```typescript
export interface ProjectCharter {
  id: string;
  projectId: string;
  version: number;
  title: string;
  scopeSummary: string;
  
  // 1. Human Rights
  humanPermissions: {
    canCreateTasks: UserRole[];
    canRunExperiments: UserRole[];
    canCommitCode: UserRole[];
    canReviewContributions: UserRole[];
    canApproveLedgerMint: UserRole[];
  };

  // 2. AI Capabilities & Gateways
  agentPermissions: {
    allowedAgents: AgentType[];
    maxQueriesPerHour: number;
    allowAutonomousExecution: boolean;
    requireMentorOversight: boolean;
    allowExternalAPIEgress: boolean;
  };

  // 3. Sandboxed Tooling
  toolPermissions: {
    allowedTools: string[];
    bannedTools: string[];
    requireSandboxing: boolean;
    networkAccess: 'NONE' | 'WHITELISTED_ONLY' | 'UNRESTRICTED';
  };

  // 4. Data Classification & Privacy
  dataPermissions: {
    confidentialityLevel: 'PUBLIC_OPEN_SOURCE' | 'ACADEMIC_RESTRICTED' | 'COMMERCIAL_CONFIDENTIAL';
    dataLicense: string;
    allowDerivativeWork: boolean;
  };

  // 5. Evidence & Review Standards
  evidenceRequirements: {
    requireCodeArtifact: boolean;
    requireExperimentRunLogs: boolean;
    requireProvenanceHash: boolean;
    minReproducibilityScore: number;
  };

  // 6. Reward & Escrow Distribution
  rewardRules: {
    totalEscrowBudget: number;
    currency: string;
    creditPerMilestone: number;
    reputationBonusMultiplier: number;
  };
}
```

---

## 3. Gateway Enforcement Pipeline
When an agent or tool is requested, the `AgentGateway.evaluate()` method executes an 8-stage gate:
1. **User Identity & Role Authentication**: Does the user hold a valid role?
2. **Project Membership**: Is the user an active contributor or lead on this project?
3. **Agent Whitelist Check**: Is `task.agentType` explicitly included in `charter.agentPermissions.allowedAgents`?
4. **Tool Whitelist & Ban Check**: Are all requested tools in `allowedTools` and absent from `bannedTools`?
5. **Network Boundary Check**: If a tool attempts external egress, is `charter.toolPermissions.networkAccess` permitted?
6. **Confidentiality Check**: Does the agent's privilege level match the data tier?
7. **Rate Limit Check**: Has the user exceeded `charter.agentPermissions.maxQueriesPerHour` in the current hourly window?
8. **Audit Trail Generation**: Appends a signed record to `db.auditEvents`.
