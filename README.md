<<<<<<< HEAD
# round-3
=======
# GARDENIA — Research Collaboration Platform

GARDENIA is a research collaboration and verification platform connecting sponsors, researchers, student contributors, and mentors in an auditable, charter-governed workspace.

---

## 🌟 Core Product Purpose
Unlike traditional course platforms or learning management systems (LMS), GARDENIA is built for **real-world research execution**. It coordinates:
- **Sponsors** who provide real-world problem statements, funding, and project charters.
- **Researchers (Leads)** who formulate hypotheses, lead research projects, and direct teams.
- **Students (Contributors)** who write code, run experiments, collect telemetry, and submit verified evidence.
- **Mentors** who review methodologies, verify experiments, and sign off on contributions.
- **AI Mesh & Gateway** that orchestrates authorized, charter-compliant AI agents with complete provenance.
- **Contribution Ledger** that commits approved research, minting non-fungible reputation and distributing project credits.

---

## 📐 Master Architecture
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

## 🎭 5 Specialized Role Experiences
1. **Student / Junior Contributor**: Task execution, experiment tracking, AI assistant with sandbox limits, mentor feedback, submission builder.
2. **Researcher / Lead Contributor**: Project formulation, hypothesis steering, team delegation, agent permissions config, research portfolio.
3. **Mentor**: Verification queue, multi-factor verification diffs, AI provenance inspector, dispute escalation, ledger approval.
4. **Sponsor**: Problem statement creation wizard, project charter builder, funding escrows, talent discovery, ROI analytics.
5. **Admin**: Gateway throughput telemetry, mesh worker health, user RBAC, audit log explorer, dispute arbitration, ledger integrity.

---

## 📚 Documentation
- [Architecture Specification](./docs/ARCHITECTURE.md)
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)
- [Project Status & Progress](./docs/PROJECT_STATUS.md)
- [Architectural Decisions (ADR)](./docs/DECISIONS.md)

---

## 🚀 Getting Started
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). Authentication and data access require a Supabase project.

### Supabase setup

This repository already contains ordered SQL migrations in `supabase/migrations`. Initialize the Supabase CLI only if `supabase/config.toml` does not exist, then link and apply the migrations:

```bash
# Only when supabase/config.toml does not exist:
npx supabase init
npx supabase login
npx supabase link --project-ref furlxgfcvpczjeakscgr
npx supabase db push
```

The CLI may prompt for the database password when linking. Enter it in the prompt; do not put it in a command, source file, or shell history. A database password shared in plaintext should be rotated in Supabase before use.

If the app reports that `public.profiles` is missing from the schema cache, the migrations have not been applied to the linked project yet. Run the link and `db push` commands above from this repository root. After a successful push, restart the development server and reload the app.

Create `.env.local` from `.env.example` and fill in the project URL and a publishable/anon key from the Supabase project settings. Never use a service-role key in a `NEXT_PUBLIC_` variable or commit `.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://furlxgfcvpczjeakscgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-publishable-or-anon-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Optional: server-only connection for /admin/sql-editor; use a newly rotated database password.
GARDENIA_SQL_EDITOR_DATABASE_URL=postgresql://postgres:<ROTATED_PASSWORD>@db.furlxgfcvpczjeakscgr.supabase.co:5432/postgres
```

The SQL editor connection string is a server secret and must never use a `NEXT_PUBLIC_` prefix. The editor is available only to `ADMIN` profiles and executes arbitrary PostgreSQL using the configured database role's privileges. Query history and saved-query support are installed by the latest migration.

In Supabase Auth URL Configuration, allow `http://localhost:3000/auth/callback` as a redirect URL (and add the production callback URL when deployed). New accounts are created as students by default; elevated roles cannot be selected at signup. To bootstrap the first administrator, create and confirm an account, then run this as the project owner in the Supabase SQL Editor, replacing the UUID with that account's `auth.users.id`:

```sql
update public.profiles
set role = 'ADMIN'
where id = 'YOUR_AUTH_USER_UUID'::uuid;
```

After that, use the admin user-management workflow to assign roles. Local SQL seeding is disabled: fake auth identities would undermine the real-auth and role-security model, so create demo users through signup and grant their roles from the administrator account.

Dashboards, project listings, organizations, contribution review, and the existing project/access/contribution APIs use authenticated Supabase data and RLS. Some legacy screens outside these flows are still preview-only; do not treat their sample values as persisted platform state.
>>>>>>> 302c63d (Initial commit)
#   H A C K  
 