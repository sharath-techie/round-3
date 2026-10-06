# Current-to-Target Architecture Migration Map

## Audit baseline

The repository is a Next.js 15 App Router prototype with TypeScript and Tailwind. The production build and `npx tsc --noEmit` both pass. The application currently has no authentication provider, database driver/schema, storage integration, worker queue, or external AI runtime configured.

The runtime data source is `src/lib/db.ts`: a process-local singleton initialized with named fictional seed users, projects, contributions, rewards, audit events, and activity. Client pages import this store directly. API routes accept caller identity and role from request headers, and the role context persists a selectable persona in local storage. These are prototype mechanisms, not authentication or authorization boundaries.

The existing architecture documents describe several capabilities as production-ready (including verified auth, persistent storage, live AI workers, cryptographic ledger proofs, and sandboxed experiment runs) that are not implemented by the source. Treat source behavior—not those status claims—as authoritative.

## Current routes and migration

| Current route(s) | Target route / module | Migration action |
|---|---|---|
| `/` | Public entry point and `/auth/*` | Replace the separate GARDENIA dashboard mock with a concise product entry/sign-in route. Remove its hard-coded dashboard arrays and inert navigation. |
| `/student`, `/researcher`, `/mentor`, `/sponsor`, `/admin` | `/{role}/dashboard` | Rebuild each as a small role overview using authenticated, authorized service data. Keep legacy roots as redirects while links migrate. |
| `/student/problems`, `/student/problems/[id]`, `/researcher/discover` | `/student/projects`, `/researcher/projects`, `/sponsor/research-problems` | Reuse the problem-discovery layout where useful; replace embedded seeded problem records with service-backed results and access-aware detail views. |
| `/student/research`, `/student/research/[id]`, `/researcher/workspace`, `/researcher/workspace/[id]`, `/sponsor/projects/[id]` | `/projects/[projectId]/*` | Consolidate role-specific wrappers into one canonical project workspace. Role and resource permissions determine each view; never fall back to an unrelated first project. |
| `/student/experiments`, `/researcher/experiments` | `/projects/[projectId]/experiments` | Consolidate experiment UI and route all reads/writes through the project-scoped research/experiment service. |
| `/student/team`, `/researcher/team`, `/mentor/students`, `/mentor/researchers` | `/projects/[projectId]/team` and role-specific team queues | Reuse presentation elements where useful; source membership and visibility from team-membership/access-control services. |
| `/student/contributions`, `/student/contributions/[id]`, `/researcher/contributions`, `/researcher/credits`, `/mentor/review`, `/mentor/queue`, `/mentor/disputes`, `/sponsor/reviews`, `/sponsor/funding` | `/projects/[projectId]/contributions`, role-specific reviews, `/mentor/credits`, `/sponsor/rewards`, and admin governance | Preserve contribution/evidence/review concepts. Replace inline credit mutations and synthetic ledger records with contribution, credit, ledger, review, and audit services. |
| `/student/profile` | `/student/skills` | Reuse profile presentation only where it represents real profile data; move skill claims and verification into skills/skill-verification services. |
| `/researcher/my-research`, `/researcher/portfolio` | `/researcher/projects` and `/researcher/contributions` | Migrate active project management and verifiable outputs. Do not retain fabricated publication/portfolio entries. |
| `/sponsor/create`, `/sponsor/projects`, `/sponsor/find-researchers`, `/sponsor/find-students`, `/sponsor/analytics` | `/sponsor/research-problems`, `/sponsor/projects`, `/sponsor/access-requests`, `/sponsor/rewards`, `/sponsor/reports` | Keep the charter form as a starting point; connect project creation to organization verification, project, charter, access, reward, and reporting services. Remove hard-coded talent and analytics results. |
| `/mentor/projects`, `/mentor/review`, `/mentor/queue`, `/mentor/disputes` | `/mentor/projects`, `/mentor/reviews`, `/mentor/credits`, and project workspace routes | Preserve review workflow concepts; enforce assigned-project access and auditable human decisions on the server. |
| `/admin/users`, `/admin/projects`, `/admin/charters`, `/admin/audit`, `/admin/disputes`, `/admin/gateway`, `/admin/mesh`, `/admin/health`, `/admin/ledger` | `/admin/users`, `/admin/verification`, `/admin/projects`, `/admin/governance`, `/admin/audit`, `/admin/security` | Consolidate admin views by governance purpose. Retain only operational telemetry backed by actual configured infrastructure; remove simulated health, mesh, and ledger claims. |
| `/api/projects` | Project and charter services | Keep a thin route handler; validate input, authenticate with Supabase, authorize against membership/organization state, and persist through Postgres. |
| `/api/contributions/submit`, `/api/reviews` | Evidence, contribution, credit, ledger, audit services | Keep the API boundary but move lifecycle rules out of route handlers. Make human review explicit and ensure ledger/credit updates are transactional. |
| `/api/experiments/run` | Research/experiment service and configured worker boundary | Remove random simulated metrics. Do not claim execution unless a real worker is configured and has run the requested experiment. |
| `/api/mesh/invoke`, `src/services/gateway/*`, `src/services/mesh/*` | `ai/gateway`, `ai/mesh-orchestrator`, scoped agents | Preserve the gateway/orchestration concepts. Replace canned agent output, pseudo-hashes, and constant quotas with configured providers, project-scoped authorization, durable provenance, and explicit unconfigured/error states. |

Legacy role routes are compatibility entry points during migration, not separate implementations. The only canonical project implementation is `/projects/[projectId]/*`.

## Reusable source

| Existing source | Reuse |
|---|---|
| `src/types/index.ts` | Domain vocabulary for projects, charters, milestones, tasks, evidence, contributions, reviews, audit, access requests, and verification. Reconcile types with the persisted schema and eliminate unsafe `any` fields as modules are migrated. |
| `src/components/research/ResearchWorkspace.tsx` | UX/layout reference for the shared workspace and AI/evidence panels. Remove seeded prompt defaults, hard-coded experiment IDs, and forged identity headers before reuse. |
| `src/services/gateway/agent-gateway.ts`, `src/services/mesh/ai-mesh.ts` | Architectural concepts only. Current implementations contain incomplete policy checks and fixed demonstration responses; do not expose them as production services. |
| `src/components/layout/Header.tsx`, `RoleNavigation.tsx`, `CommandMenu.tsx` | Reuse visual/layout patterns selectively. Replace role-switching, sample account data, fictional telemetry, and links to duplicate routes with session-based navigation. |
| Role dashboards and detail pages | Reuse selected layout, tables, timelines, and evidence presentation after removing fabricated metrics, people, projects, activity, and fallback-to-first-record behavior. |
| `docs/CHARTER.md`, `docs/AI_MESH.md`, `docs/AI_PROVENANCE.md`, `docs/SECURITY.md` | Product intent and terminology only. Update statements to match enforceable code and configured infrastructure. |

## Removal or replacement candidates

No existing feature should be deleted solely because it is absent from the target navigation. Replace or remove only the following prototype behavior as its real counterpart is connected:

- All `SEED_*` records and the process-local `VeroDatabase` in `src/lib/db.ts`.
- Local-storage persona switching and identity derived from `x-vero-role` / `x-vero-userid`.
- Mock-only values and assertions in dashboards, demo talent pages, reports, notifications, experiments, AI agents, gateway telemetry, and ledger views.
- Duplicate project workspace pages after their behavior has moved to `/projects/[projectId]/*`; leave redirects for old URLs.
- Obsolete menu links and the separate home-page mini-dashboard once role navigation is available.
- Static “production” documentation claims that cannot be demonstrated or are not configured.

## Missing target modules

The repository currently lacks these implementation modules/routes:

- Authentication: login, signup, email verification, onboarding, session handling, and role/profile provisioning.
- Authorization and resource-level project access enforcement.
- Organization verification and document review.
- Canonical shared project workspace routes and charter version history.
- Research-problem lifecycle and sponsor/researcher access-request workflows.
- Team/membership, skill verification, and skill-based matching services.
- Evidence storage, contribution review/credit services, durable audit, and transactional ledger.
- Notification persistence/delivery and verified reporting.
- Configured AI provider gateway/orchestrator, durable project-scoped provenance, and worker-backed execution.
- PostgreSQL schema/migrations, Supabase Auth integration, and Row Level Security policies.

## Selected foundation and constraints

Supabase Postgres and Supabase Auth were selected for the migration. Credentials are not present in this repository, so local integration must read environment configuration and report missing configuration explicitly. Do not commit keys, introduce service-role access into browser code, or present unauthenticated/mock state as real platform data.

Object storage, vector search, cache, queue, and AI runtime remain optional until a concrete use case and provider are configured. Do not add those systems just to mirror the target diagram.
