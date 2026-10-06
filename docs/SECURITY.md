# VERO — Security Architecture & Threat Model

## 1. Zero-Trust Security Model
VERO implements a defense-in-depth architecture. Security rules are enforced strictly server-side; client-side persona views and button states are treated as untrusted UI conveniences.

---

## 2. Threat Vectors & Mitigations

### Threat 1: Unauthorized Model Invocations & Resource Starvation
- **Vector**: Malicious or runaway student script spamming LLM execution tools.
- **Mitigation**:
  - `AgentGateway` enforces `charter.agentPermissions.maxQueriesPerHour`.
  - Rate budget consumption is checked atomically before any model dispatch.
  - Per-user and per-project sliding window rate buckets in memory.

### Threat 2: Command Injection & Sandbox Escape
- **Vector**: Code generation prompts requesting arbitrary shell execution (`os.system`, `subprocess`, raw network calls).
- **Mitigation**:
  - Strict tool whitelisting (`charter.toolPermissions.allowedTools`).
  - Prohibited tool evaluation rejects requests containing `bannedTools` (e.g. `raw_shell_exec`, `unfiltered_web_scraper`).
  - All scientific benchmark runs execute within mocked/sandboxed deterministic routines.

### Threat 3: Data Leakage & Confidentiality Breach
- **Vector**: Feeding proprietary commercial project data into public third-party APIs.
- **Mitigation**:
  - Projects marked `COMMERCIAL_CONFIDENTIAL` reject tools with `allowExternalAPIEgress: false`.
  - Agent Gateway verifies caller's cleared role against project membership before granting data read scopes.

### Threat 4: Fake Contribution Claims & Sybil Minting
- **Vector**: Contributors asserting milestone completion without working code or reproducible evidence to farm reputation.
- **Mitigation**:
  - Ledger minting cannot be triggered by contributors.
  - Only authorized roles (`MENTOR`, `RESEARCHER`, `ADMIN`) can sign `APPROVE` on `/api/reviews`.
  - Requires attached `evidenceItems` (metric logs, experiment runs, notebook artifacts) and SHA-256 provenance hashes.

### Threat 5: Audit Tampering
- **Vector**: Attempting to erase gateway denials or unauthorized attempts.
- **Mitigation**:
  - Append-only `AuditEvent` log with microsecond timestamps, actor IDs, actions, and evaluation outcomes.
