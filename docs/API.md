# VERO Research Platform — API Reference

## Architectural Foundation
All VERO endpoints operate on a zero-trust model. State changes require valid authorization and project context. The Agent Gateway acts as an mandatory intermediate boundary for all AI operations.

---

### 1. AI Mesh & Agent Gateway
#### `POST /api/mesh/invoke`
Enforces the Project Charter before dispatching requests to the AI Mesh.

- **Headers**:
  - `x-vero-user-id`: Caller user ID (e.g. `user_student_1`)
  - `x-vero-role`: Active persona (`STUDENT`, `RESEARCHER`, `MENTOR`, `SPONSOR`, `ADMIN`)
- **Payload**:
  ```json
  {
    "projectId": "proj_1",
    "agentType": "RESEARCH_AGENT | CODING_AGENT | DATA_AGENT | EXPERIMENT_AGENT | DOC_AGENT | INTEGRITY_AGENT",
    "prompt": "Evaluate radial basis distance embedding for protein docking",
    "requestedTools": ["python_repl", "pytorch_geometric_sandbox"],
    "dataSources": ["PDBBind-v2020-Core"]
  }
  ```
- **Gateway Enforcement Logic**:
  1. Authenticates user & resolves project charter.
  2. Assesses if `agentType` is listed in `charter.agentPermissions.allowedAgents`.
  3. Verifies requested tools against `charter.toolPermissions.allowedTools` and rejects if in `bannedTools`.
  4. Inspects data classification against `charter.dataPermissions.confidentialityLevel`.
  5. Verifies caller rate limit quota (`charter.agentPermissions.maxQueriesPerHour`).
- **Response**:
  ```json
  {
    "success": true,
    "gatewayCheck": {
      "allowed": true,
      "permittedTools": ["python_repl", "pytorch_geometric_sandbox"],
      "auditEventId": "audit_1728148900",
      "rateLimitRemaining": 98
    },
    "result": {
      "agent": "CODING_AGENT",
      "model": "claude-3-5-sonnet-20241022",
      "executionTimeMs": 284,
      "content": "...",
      "codeBlocks": ["def rbf_distance_expansion(...) -> torch.Tensor:"],
      "provenance": {
        "id": "prov_1728148901",
        "promptHash": "9b1c7...",
        "outputHash": "f4e3a...",
        "verifiedByIntegrityAgent": true,
        "charterVersion": 1
      }
    }
  }
  ```

---

### 2. Experiments
#### `POST /api/experiments/run`
Executes reproducible benchmark trials with simulated real-world convergence mathematics.

- **Payload**:
  ```json
  {
    "experimentId": "exp_1",
    "projectId": "proj_1",
    "hypothesis": "RBF radial basis expansion decreases docking MSE",
    "dataset": "PDBBind-v2020-Core (3,842 complexes)",
    "hyperparameters": {
      "learningRate": 0.0005,
      "batchSize": 32,
      "numRbfKernels": 64,
      "cutoffDistance": 10.0
    }
  }
  ```
- **Response**: Returns completed run with training loss curve array, Pearson correlation $r$, execution latency, git commit hash, and artifact output.

---

### 3. Contributions & Evidence
#### `POST /api/contributions/submit`
Packages an artifact, attached reproducible evidence items, and cryptographic AI provenance into the Mentor Review Queue.

- **Payload**:
  ```json
  {
    "projectId": "proj_1",
    "taskId": "task_1_1",
    "title": "Radial Basis Distance Expansion Layer (PyTorch)",
    "summary": "Implemented coordinate embedding layer preserving SE(3) invariance",
    "gitCommitHash": "e8f192b0c14",
    "artifactType": "CODE",
    "artifactPayload": "class RadialBasisExpansion(nn.Module): ...",
    "evidenceItems": [
      {
        "type": "METRIC_LOG",
        "title": "Benchmark Trial Run #14",
        "payload": "MSE: 0.142, Pearson r: 0.884"
      }
    ],
    "aiProvenanceId": "prov_1",
    "creditsRequested": 4500
  }
  ```
- **Response**: `{ "success": true, "contribution": { "id": "contrib_...", "status": "SUBMITTED" } }`

---

### 4. Mentor Review & Ledger Minting
#### `POST /api/reviews`
Verifies or requests changes on submissions. If approved, atomically mints a new block on the Contribution Ledger and releases protocol credits.

- **Headers**:
  - `x-vero-user-id`: Mentor ID
  - `x-vero-role`: `MENTOR` | `RESEARCHER` | `ADMIN`
- **Payload**:
  ```json
  {
    "contributionId": "contrib_1",
    "decision": "APPROVE | REQUEST_CHANGES | REJECT | ESCALATE_DISPUTE",
    "methodologyScore": 9,
    "reproducibilityScore": 10,
    "charterCompliance": true,
    "comments": "Rigorous mathematical proof and isolated seed benchmarks verified."
  }
  ```
- **Response**: `{ "success": true, "ledgerBlockIndex": 2, "creditsReleased": 4500 }`

---

### 5. Projects & Charters
#### `GET /api/projects`
Retrieves all active research initiatives with nested milestones, tasks, and binding charters.

#### `POST /api/projects`
Creates a new research project along with its legally binding Project Charter.
