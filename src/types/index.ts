export type UserRole = 'STUDENT' | 'RESEARCHER' | 'MENTOR' | 'SPONSOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  institution: string;
  bio: string;
  reputationScore: number;
  credits: number;
  skills: string[];
  verifiedContributionsCount: number;
}

export type AgentType = 
  | 'RESEARCH_AGENT'
  | 'CODING_AGENT'
  | 'DATA_AGENT'
  | 'EXPERIMENT_AGENT'
  | 'DOC_AGENT'
  | 'INTEGRITY_AGENT';

export interface CharterHumanPermissions {
  allowedRoles: UserRole[];
  maxContributors: number;
  requiredReviewers: number;
  peerReviewRequired: boolean;
}

export interface CharterAIPermissions {
  aiAssistanceAllowed: boolean;
  computeBudgetHours: number;
  maxTokensPerSession: number;
  allowedModelTiers: ('TIER_1_STANDARD' | 'TIER_2_ADVANCED' | 'TIER_3_REASONING')[];
}

export interface CharterAgentPermissions {
  allowedAgents: AgentType[];
  restrictedAgents: AgentType[];
}

export interface CharterToolPermissions {
  allowedTools: string[];
  bannedTools: string[];
}

export interface CharterDataPermissions {
  sensitivityLevel: 'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL';
  piiAllowed: boolean;
  externalExportAllowed: boolean;
}

export interface CharterContributionRules {
  minEvidenceRequired: ('METRIC_LOG' | 'EXPERIMENT_RUN' | 'PROVENANCE_HASH' | 'REPRODUCIBILITY_NOTEBOOK')[];
  codeCoverageRequiredPct: number;
  reproducibilityThresholdPct: number;
}

export interface CharterVerificationRules {
  mentorSignOffRequired: boolean;
  quorumCount: number;
  autoIntegrityPassRequired: boolean;
}

export interface CharterIPAndRewards {
  license: string;
  studentCreditSharePct: number;
  leadResearcherCreditSharePct: number;
  totalPoolCredits: number;
}

export interface ProjectCharter {
  id: string;
  projectId: string;
  version: number;
  title: string;
  humanPermissions: CharterHumanPermissions;
  aiPermissions: CharterAIPermissions;
  agentPermissions: CharterAgentPermissions;
  toolPermissions: CharterToolPermissions;
  dataPermissions: CharterDataPermissions;
  contributionRules: CharterContributionRules;
  verificationRules: CharterVerificationRules;
  ipAndRewards: CharterIPAndRewards;
  updatedAt: string;
}

export interface ProblemStatement {
  id: string;
  sponsorId: string;
  sponsorName: string;
  sponsorOrg: string;
  title: string;
  domain: 'BIOTECH' | 'AUTONOMOUS_SYSTEMS' | 'QUANTUM_SECURITY' | 'CLIMATE_AI' | 'MED_IMAGING';
  summary: string;
  background: string;
  objective: string;
  rawProblemText: string;
  acceptanceCriteria: string[];
  targetDeliverables: string[];
  budgetCredits: number;
  bountyRewardsUSD: number;
  status: 'OPEN_FOR_PROPOSALS' | 'ASSIGNED' | 'IN_ACTIVE_RESEARCH' | 'COMPLETED';
  createdAt: string;
}

export interface ProjectMember {
  userId: string;
  name: string;
  role: UserRole;
  joinedAt: string;
  activeTasksCount: number;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  deadline: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'VERIFIED';
  rewardCredits: number;
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId: string;
  title: string;
  description: string;
  assignedToUserId?: string;
  assignedToName?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredEvidenceType: 'METRIC_LOG' | 'EXPERIMENT_RUN' | 'PROVENANCE_HASH' | 'REPRODUCIBILITY_NOTEBOOK';
  dueDate: string;
}

export interface Project {
  id: string;
  problemStatementId: string;
  sponsorId: string;
  leadResearcherId: string;
  leadResearcherName: string;
  title: string;
  slug: string;
  domain: string;
  status: 'ACTIVE' | 'REVIEW' | 'COMPLETED' | 'SUSPENDED';
  charterId: string;
  teamMembers: ProjectMember[];
  milestones: Milestone[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Experiment {
  id: string;
  projectId: string;
  authorUserId: string;
  title: string;
  hypothesis: string;
  methodology: string;
  codeSnippet: string;
  parameters: Record<string, string | number | boolean>;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface ExperimentRun {
  id: string;
  experimentId: string;
  executedByUserId: string;
  executedByName: string;
  executionTimeMs: number;
  status: 'SUCCESS' | 'FAILED';
  metrics: {
    epochs?: number;
    lossCurve: number[];
    accuracyCurve: number[];
    f1Score: number;
    latencyMs: number;
    memoryMb: number;
  };
  logs: string[];
  outputArtifactHash: string;
  timestamp: string;
}

export interface AIProvenance {
  id: string;
  userId: string;
  projectId: string;
  agentType: AgentType;
  promptHash: string;
  promptSnippet: string;
  outputSnippet: string;
  outputHash: string;
  toolsUsed: string[];
  dataSources: string[];
  charterVersion: number;
  verifiedByIntegrityAgent: boolean;
  timestamp: string;
}

export interface EvidenceItem {
  id: string;
  type: 'METRIC_LOG' | 'EXPERIMENT_RUN' | 'PROVENANCE_HASH' | 'REPRODUCIBILITY_NOTEBOOK';
  title: string;
  payload: string;
  verified: boolean;
}

export interface Contribution {
  id: string;
  projectId: string;
  projectTitle: string;
  taskId: string;
  taskTitle: string;
  milestoneId: string;
  authorUserId: string;
  authorName: string;
  authorRole: UserRole;
  title: string;
  summary: string;
  gitCommitHash: string;
  artifactType: 'CODE' | 'DATASET' | 'PAPER' | 'BENCHMARK';
  artifactPayload: string;
  evidenceItems: EvidenceItem[];
  aiProvenanceId?: string;
  aiProvenanceSnippet?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISPUTED';
  creditsRequested: number;
  submittedAt: string;
  reviews: Review[];
}

export interface Review {
  id: string;
  contributionId: string;
  mentorId: string;
  mentorName: string;
  decision: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT' | 'ESCALATE_DISPUTE';
  methodologyScore: number; // 1-10
  reproducibilityScore: number; // 1-10
  charterCompliance: boolean;
  comments: string;
  reviewedAt: string;
}

export interface ContributionLedgerEntry {
  id: string;
  blockIndex: number;
  previousBlockHash: string;
  blockHash: string;
  contributionId: string;
  projectId: string;
  authorUserId: string;
  authorName: string;
  mentorId: string;
  mentorName: string;
  creditsAwarded: number;
  reputationAwarded: number;
  timestamp: string;
  merkleRoot: string;
}

export interface AgentGatewayCheck {
  allowed: boolean;
  reason?: string;
  charterViolations?: string[];
  permittedTools: string[];
  auditEventId: string;
  rateLimitRemaining: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resource: string;
  outcome: 'SUCCESS' | 'DENIED' | 'ERROR';
  details: string;
  metadata?: Record<string, any>;
}

export interface Dispute {
  id: string;
  contributionId: string;
  projectTitle: string;
  raisedByUserId: string;
  raisedByName: string;
  reason: string;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'TASK' | 'REVIEW' | 'CREDIT' | 'GATEWAY_ALERT' | 'MENTOR_FEEDBACK';
  read: boolean;
  timestamp: string;
  linkUrl?: string;
}

export interface SkillVerification {
  id: string;
  userId: string;
  skillName: string;
  status: 'VERIFIED' | 'PENDING_TEST' | 'PENDING_REVIEW' | 'FAILED';
  scorePct: number;
  testDate?: string;
  evidenceSummary?: string;
  verifiedBy?: string;
}

export interface AccessRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userAvatar?: string;
  resource: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  requestedAt: string;
  approvedBy?: string;
  grantedAt?: string;
  expiresAt?: string;
  charterVersion?: number;
}

export interface OrganizationVerification {
  id: string;
  name: string;
  type: 'COMPANY' | 'ACADEMIC' | 'FOUNDATION';
  registrationNumber: string;
  country: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  documents: { name: string; size: string; status: 'VALID' | 'PENDING' }[];
  submittedAt: string;
  reviewedBy?: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  fileName: string;
  fileSize: string;
  classification: 'PUBLIC' | 'TEAM' | 'RESTRICTED' | 'CONFIDENTIAL';
  uploadedAt: string;
}
