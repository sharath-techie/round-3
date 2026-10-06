# VERO Architectural & Design Decisions (ADR)

## ADR-001: Next.js 15+ App Router Fullstack Architecture
- **Date**: 2026-10-05
- **Decision**: Adopt Next.js with React 19 / TypeScript and App Router as the unified frontend and backend framework.
- **Rationale**: Enables unified type sharing between the API / Server Actions, Agent Gateway, and UI components without microservice orchestration friction during fast iteration.
- **Consequences**: API routes (`/api/gateway`, `/api/mesh`, `/api/projects`, `/api/reviews`) serve as formal boundary contracts with strict validation schemas.

## ADR-002: Project Charter as First-Class Structured Policy Contract
- **Date**: 2026-10-05
- **Decision**: Represent Project Charters not as text or PDFs, but as strongly-typed JSON configuration schemas enforced by the Gateway.
- **Rationale**: Project sponsors and lead researchers require programmatic constraints over which AI agents can be invoked, which tools can run, and what evidence is mandatory for mentor verification.
- **Consequences**: Any invocation of the AI Mesh must pass through the `AgentGateway.evaluate(context, charter)` gatekeeper before execution.

## ADR-003: Transparent AI Provenance Instead of Black-box Detection
- **Date**: 2026-10-05
- **Decision**: Reject probabilistic "AI detector" scores in favor of transparent cryptographic provenance chains.
- **Rationale**: AI detection heuristics are notoriously prone to false positives and easily gamed. True research integrity demands an auditable trail connecting user prompt, agent ID, tool execution outputs, and generated artifact diffs.
- **Consequences**: Every agent generation registers an `AIProvenance` record linked to the session and project charter.

## ADR-004: Role Switching & Actor Context Architecture
- **Date**: 2026-10-05
- **Decision**: Build an in-app Persona/Role Switcher supporting real-time switching between Student (`alex_student`), Researcher (`dr_elena_lead`), Mentor (`prof_marcus_mentor`), Sponsor (`sarah_sponsor`), and Admin (`admin_system`).
- **Rationale**: Evaluators and developers need to test and experience the distinct navigation, permissions, and workflows across all 5 roles without friction or constant re-logging.
- **Consequences**: Role state is held in verified session cookies/headers and validated server-side on every API action.

## ADR-005: 6 Modular AI Mesh Agents with Extensible Registry
- **Date**: 2026-10-05
- **Decision**: Implement the AI Mesh as an extensible registry pattern (`BaseMeshAgent`) with initial agents: Research, Coding, Data, Experiment, Documentation, Integrity.
- **Rationale**: Allows new domain-specific agents (e.g., Quantum Simulation Agent, Wet-lab Robotics Agent) to be plugged in cleanly without refactoring the core engine.
