# VERO Architecture Specification

## 1. Executive Overview
VERO is a real-world research collaboration and verification platform connecting Sponsors, Lead Researchers, Student Contributors, and Mentors within an auditable, charter-governed ecosystem.

```
SPONSOR ──> REAL-WORLD PROBLEM ──> PROJECT CHARTER ──> RESEARCH PROJECT
                                                               │
                                       ┌───────────────────────┴───────────────────────┐
                                       ▼                                               ▼
                              RESEARCHER / LEAD                               STUDENT / CONTRIBUTOR
                                       │                                               │
                                       └───────────────────────┬───────────────────────┘
                                                               ▼
                                                         RESEARCH WORK
                                                               │
                                                               ▼
                                                         AI WORKSPACE
                                                               │
                                                               ▼
                                                         AGENT GATEWAY
                                                               │
                                                               ▼
                                                            AI MESH
                                   ┌───────────────────────────┼───────────────────────────┐
                                   ▼                           ▼                           ▼
                              RESEARCH AGENT              CODING AGENT                DATA AGENT
                                   │                           │                           │
                                   ├───────────────────────────┼───────────────────────────┤
                                   ▼                           ▼                           ▼
                            EXPERIMENT AGENT          DOCUMENTATION AGENT          INTEGRITY AGENT
                                                               │
                                                               ▼
                                                          EXPERIMENTS
                                                               │
                                                               ▼
                                                            RESULTS
                                                               │
                                                               ▼
                                                         CONTRIBUTION
                                                               │
                                                               ▼
                                                           EVIDENCE
                                                               │
                                                               ▼
                                                         MENTOR REVIEW
                                                               │
                                                               ▼
                                                          VERIFICATION
                                                               │
                                                               ▼
                                                      CONTRIBUTION LEDGER
                                                           /         \
                                                          ▼           ▼
                                                       CREDITS     REPUTATION
                                                          \           /
                                                           ▼         ▼
                                                            REWARDS
                                                               │
                                                               ▼
                                                        SPONSOR OUTCOME
```

---

## 2. Core Architectural Pillars

### 2.1 Project Charter (`Charter`)
The Charter is a first-class, immutable/versioned policy contract governing every research project. It explicitly specifies:
- **Human Permissions**: Allowed roles, team member quotas, minimum qualifications.
- **AI Permissions**: Whether AI agents are authorized, compute budget, model restrictions.
- **Agent Permissions**: Allowed agents (`ResearchAgent`, `CodingAgent`, `DataAgent`, `ExperimentAgent`, `DocAgent`, `IntegrityAgent`).
- **Tool Permissions**: Permitted tool executions (e.g., Python REPL, Data Sandbox, Literature Search, Git Diff analysis).
- **Data Permissions**: Sensitivity classifications, export constraints, dataset privacy rules.
- **Contribution & Evidence Rules**: Mandatory proof requirements (Git commit hash, notebook snapshot, metric logs, provenance chain).
- **Review & Verification Thresholds**: Mentor sign-off requirements, peer reviews, consensus rules.
- **IP & Reward Distribution**: Contributor equity/credit share, sponsor deliverables.

### 2.2 Agent Gateway (`AgentGateway`)
The enforcement boundary that intercepts every AI action before it reaches execution:
`User` -> `Authentication` -> `Project Context` -> `Role` -> `Charter Policy Check` -> `Agent Permission` -> `Tool Permission` -> `Data Boundary Check` -> `Rate / Quota Check` -> `AI Mesh Execution`.

Requests violating the project charter or user role are rejected with detailed audit events.

### 2.3 AI Mesh (`AIMesh`)
A decoupled, asynchronous, worker-pool ready orchestration mesh hosting specialized agents:
- **Research Agent**: Literature synthesis, hypothesis generation, problem decomposition.
- **Coding Agent**: Algorithm implementation, refactoring, test suite synthesis, benchmark scripts.
- **Data Agent**: Dataset ingestion, statistical profiling, distribution validation, ETL.
- **Experiment Agent**: Parameter grid execution, trial telemetry tracking, metric serialization.
- **Documentation Agent**: Method papers, reproducibility guides, experiment summaries.
- **Integrity & Provenance Agent**: AI watermarking, cryptographic hash linkage of prompts, tools, and outputs.

### 2.4 Research Workspace
A modern, dense, split-pane environment designed for rigorous investigation:
- Left pane: Research outline, hypotheses, tasks, dataset schema, and charter restrictions.
- Center pane: Interactive experiment runner, code notebook/sandbox, prompt orchestrator, and result charts.
- Right pane: Real-time AI provenance trail, mentor feedback feed, and submission packaging.

### 2.5 Contribution Ledger & Verification
A tamper-evident ledger logging verified contributions:
- Each submission requires: `Artifact` + `Evidence (Logs/Metrics/Code)` + `AI Provenance Trail`.
- Mentor reviews with 4 explicit actions: **Approve**, **Request Changes**, **Reject**, or **Escalate Dispute**.
- Approved work commits to the ledger, automatically distributing non-fungible reputation scores and project credits.

---

## 3. The 5 Distinct Role Paradigms

| Role | Primary Objectives | Key Workflows & Information Density |
| :--- | :--- | :--- |
| **Student / Junior Contributor** | Assigned task execution, experiment replication, evidence generation | Task board, experiment tracker, AI assistant with sandbox limits, mentor feedback loop, submission builder |
| **Researcher / Lead Contributor** | Project formulation, hypothesis steering, team delegation, synthesis | Problem statements, workspace orchestration, milestone tracking, agent permissions config, portfolio analytics |
| **Mentor** | Quality auditing, charter compliance, evidence verification | Review queue, multi-factor verification diffs, provenance inspector, dispute escalation, ledger approval |
| **Sponsor** | Problem statement underwriting, milestone funding, outcome inspection | Project charter creation, funding escrows, talent discovery, deliverables review, ROI analytics |
| **Admin** | System reliability, policy oversight, agent health, security audit | Gateway throughput, mesh worker health, user RBAC, audit log explorer, dispute arbitration, ledger integrity |

---

## 4. Technology Stack & Topology
- **Framework**: Next.js 15+ (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript (Strict typing across DB, API, and UI layers)
- **Styling**: Tailwind CSS with custom Dark Mode design system (Linear/Vercel/Google Research aesthetics)
- **State Management & Data Access**: Unified Repository Pattern with transactional persistence and in-memory fallback
- **Observability**: Structured audit logs, request tracing, and provenance chaining
