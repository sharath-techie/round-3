# VERO — AI Provenance & Cryptographic Traceability

## 1. Philosophical Grounding
AI detection heuristics (e.g. watermarking or statistical perplexity scoring) are notoriously susceptible to false positives and circumvention.
VERO rejects probabilistic AI detection in favor of **Deterministic Cryptographic Provenance**.

Every AI-assisted insight, code generation, data transformation, or benchmark synthesis produced inside the platform is cryptographically fingerprinted at the execution boundary.

---

## 2. Provenance Architecture

```
User Prompt + Context
         |
         v
+------------------+
|  Agent Gateway   | ---> SHA-256(Canonicalized Prompt) = promptHash
+------------------+
         |
         v
+------------------+
|     AI Mesh      | ---> Dispatches to specialized agent (e.g. CODING_AGENT)
+------------------+
         |
         v
+------------------+
| Model / Tool Run | ---> Records toolsUsed, dataSources, execution latency
+------------------+
         |
         v
+------------------+
| Output Synthesis | ---> SHA-256(Artifact Payload) = outputHash
+------------------+
         |
         v
+------------------+
| Integrity Agent  | ---> Verifies compliance with active Charter Version
+------------------+
         |
         v
+---------------------------------------------------------+
|                    AIProvenance Record                  |
|  - id: "prov_1728148901"                                |
|  - promptHash: "9b1c70e..."                             |
|  - outputHash: "f4e3a91..."                             |
|  - toolsUsed: ["python_repl", "pytorch_sandbox"]        |
|  - charterVersion: 1                                    |
|  - verifiedByIntegrityAgent: true                       |
+---------------------------------------------------------+
```

---

## 3. Provenance in the Contribution Lifecycle
When a contributor submits an artifact for peer verification:
1. The author selects the associated `AIProvenance` record from their session history.
2. The submission attaches the `aiProvenanceId` and output snippet.
3. During **Mentor Review**, the mentor inspects:
   - Full prompt and response transparency.
   - Exact tools and datasets utilized.
   - Integrity Agent verification badge.
4. When the mentor approves, the provenance hash is committed into the Merkle root of the new Contribution Ledger block.
