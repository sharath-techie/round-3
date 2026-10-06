# VERO Master Implementation Plan

## Architectural Principles
1. **Charter is King**: All AI actions, human roles, and submissions are strictly validated against project-specific Charter policies.
2. **Server-Side Truth**: Client-side states never bypass permission checks; Gateway and DB enforce authorization.
3. **No LMS Paradigms**: Real problems, real hypotheses, real code, real experiments, verified evidence.
4. **Distinct Experiences**: 5 specialized dashboards with tailored navigation, information density, and workflows.
5. **Traceable Provenance**: Every AI output is linked with session ID, prompt hashes, agent identities, and tool permissions.

## Milestones & Execution Roadmap

### Milestone 1: App Shell, Design System & Multi-Role Auth
- Scaffold Next.js 15+ App Router TypeScript base with Tailwind CSS and Lucide icons.
- Design tokens: Deep obsidian dark mode (`#0B0F17`, `#111827`, `#1F2937`), accent cyan (`#06B6D4`), emerald verification green (`#10B981`), amber charter warning (`#F59E0B`), purple AI mesh glow (`#8B5CF6`).
- Session store supporting 5 distinct actor personas with one-click seamless persona switcher for real-time evaluation.
- Layout shells with distinct navigation for each role:
  - **Student**: Problem Statements, My Research, AI Workspace, Experiments, Contributions, Profile.
  - **Researcher**: Problem Statements, My Projects, Research Workspace, Team, Experiments, Contributions, Reputation.
  - **Mentor**: Projects, Review Queue, Contribution Audits, AI Activity, Disputes.
  - **Sponsor**: New Research Project Wizard, My Projects, Talent Discovery, Analytics, Escrows.
  - **Admin**: Gateway Telemetry, AI Mesh Health, Charter Rules, User RBAC, Contribution Ledger, Audit Logs.

### Milestone 2: Domain Database & Repository Layer
- Implement type-safe storage and memory/JSON persistence:
  - `User`, `Project`, `Charter`, `ProblemStatement`, `Task`, `Milestone`
  - `Experiment`, `ExperimentRun`, `Artifact`, `Evidence`
  - `Review`, `ContributionLedgerEntry`, `Credit`, `Reward`
  - `AIAgentSession`, `AITask`, `AIProvenance`
  - `AuditEvent`, `Notification`, `Dispute`
- Seed real-world research projects:
  - *Project A: "Zero-Shot Protein Binding Affinity Optimization with Geometric Graph Neural Networks" (Sponsor: BioSynth Labs)*
  - *Project B: "Formally Verified Autonomous Driving Sensor Fusion under Adverse Weather" (Sponsor: Apex Mobility)*
  - *Project C: "Quantum-Resilient Lattice Cryptography for High-Throughput Edge Nodes" (Sponsor: CyberFort Security)*

### Milestone 3: Project Charter & Agent Gateway Enforcement Boundary
- Charter model with explicit JSON policy matrix:
  - Allowed agents, tool whitelist (`python_sandbox`, `data_profiler`, `arxiv_search`), maximum tokens/run, privacy classifications.
- Server-side Agent Gateway:
  - Intercepts requests, validates user role + project charter, enforces tool permissions, logs audit trail.

### Milestone 4: AI Mesh Engine & 6 Specialized Agents
- Agent Registry with modular implementations:
  1. `ResearchAgent`: Literature synthesis, hypothesis framing.
  2. `CodingAgent`: Test-driven implementation, algorithm refactoring.
  3. `DataAgent`: Dataset profiling, outlier detection, statistical validation.
  4. `ExperimentAgent`: Hyperparameter sweeps, telemetry logs, metric extraction.
  5. `DocumentationAgent`: Academic papers, reproducibility specs.
  6. `IntegrityAgent`: AI provenance verification, watermark generation, plagiarism check.

### Milestone 5: Research Workspace & Experiment Runner
- Split-pane workspace:
  - Left: Problem charter & constraints, task backlog, datasets.
  - Center: Interactive code runner / experiment simulation with real-time metric streams (loss curves, ROC-AUC, latency).
  - Right: AI Mesh assistant & provenance trail viewer.

### Milestone 6: Contribution Lifecycle & Mentor Verification Queue
- Contributor submission: Code artifact + benchmark run telemetry + AI provenance declaration.
- Mentor Review Room: Side-by-side artifact inspection, automated integrity audit badge, review scorecard (Approve / Reject / Changes / Dispute).
- Immutable Contribution Ledger: On approval, cryptographic ledger block minted, non-fungible reputation incremented, sponsor credits allocated.

### Milestone 7: Sponsor & Admin Consoles
- Sponsor Project Creation Wizard with Charter Builder.
- Sponsor Outcome & Talent analytics.
- Admin Gateway Live Monitor (requests/sec, rejection rate, mesh health, audit log stream).

### Milestone 8: Hardening, Automated E2E Verification & Walkthrough
- Unit & integration verification.
- Cross-browser responsive audit.
