# VERO — Data Architecture & Schema Reference

## Overview
VERO's domain entities represent real-world academic and industrial research interactions.
State is maintained via an in-memory transactional persistence engine (`VeroDatabase`) with full relational integrity, foreign key references, and cryptographic block chaining.

---

## Entity Relationship Model

```
+------------------+         +------------------+         +------------------+
| ProblemStatement |<--------|  ProjectCharter  |<--------|     Project      |
+------------------+         +------------------+         +------------------+
         |                                                         |
         |                                            +------------+------------+
         |                                            |                         |
         v                                            v                         v
+------------------+                           +--------------+          +--------------+
|     Sponsor      |                           |  Milestone   |          |  Membership  |
+------------------+                           +--------------+          +--------------+
                                                      |                         |
                                                      v                         v
                                               +--------------+          +--------------+
                                               |     Task     |          |     User     |
                                               +--------------+          +--------------+
                                                      |                         |
                                                      v                         |
                                               +--------------+                 |
                                               | Contribution |<----------------+
                                               +--------------+
                                                      |
                                          +-----------+-----------+
                                          |                       |
                                          v                       v
                                   +--------------+        +--------------+
                                   | AIProvenance |        |    Review    |
                                   +--------------+        +--------------+
                                                                  |
                                                                  v
                                                      +------------------------+
                                                      | ContributionLedger     |
                                                      | (Cryptographic Blocks) |
                                                      +------------------------+
```

---

## Key Schemas

### 1. `ProjectCharter`
Defines operational boundaries, human and agent permissions, data tiers, and reward allocations:
- `humanPermissions`: Role-based rights for task creation, experiment running, code commits, reviews, and ledger minting.
- `agentPermissions`: Authorized agent types, maximum queries/hr, autonomous tool execution flags, and external API egress rules.
- `toolPermissions`: Whitelisted tools, banned tools, and network boundary rules.
- `dataPermissions`: Confidentiality tier (`PUBLIC_OPEN_SOURCE`, `ACADEMIC_RESTRICTED`, `COMMERCIAL_CONFIDENTIAL`), license, and export rules.
- `rewardRules`: Escrow funds, credit allocation per milestone, and reputation bonuses.

### 2. `AIProvenance`
Maintains immutable transparency of AI contributions:
- `promptHash`: SHA-256 hash of user prompt.
- `outputHash`: SHA-256 hash of generated content.
- `toolsUsed`: Array of tool identifiers invoked during execution.
- `charterVersion`: Version integer of the charter at execution time.
- `verifiedByIntegrityAgent`: Boolean confirmation of provenance check.

### 3. `ContributionLedgerEntry`
Cryptographic blocks representing verified research work:
- `blockIndex`: Sequential block height.
- `previousBlockHash`: Hash pointer to parent block (Genesis block = `0000000000000000000000000000000000000000000000000000000000000000`).
- `blockHash`: Computed SHA-256 over `(blockIndex + previousBlockHash + contributionId + authorUserId + mentorId + creditsAwarded + timestamp)`.
- `merkleRoot`: Combined hash of git commit, artifact payload, and evidence.
