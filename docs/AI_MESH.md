# VERO AI Mesh Architecture & Agent Specification

## 1. Overview
The AI Mesh in VERO coordinates specialized AI agents under the strict oversight of the Agent Gateway and Project Charters. AI agents do not interface directly with raw infrastructure or client requests; all operations flow through the gateway policy pipeline.

```
       +---------------------------------------------+
       |               Agent Gateway                 |
       |  (Charter enforcement, Auth, Rate-limiting) |
       +---------------------------------------------+
                              |
                              v
       +---------------------------------------------+
       |                  AI Mesh                    |
       |  (Task Orchestration, Agent Routing, Tools) |
       +---------------------------------------------+
                              |
       +---------+---------+--+------+---------+---------+
       |         |         |         |         |         |
       v         v         v         v         v         v
   [Research] [Coding]   [Data]  [Experiment] [Doc]  [Integrity]
     Agent     Agent     Agent     Agent      Agent    Agent
```

---

## 2. Specialized Agents

### 1. Research Agent (`RESEARCH_AGENT`)
- **Primary Domain**: Literature synthesis, hypothesis decomposition, prior-art citation analysis.
- **Allowed Tools**: `arxiv_search`, `semantic_scholar_api`, `uniprot_database`.
- **System Objective**: Formulate falsifiable experimental hypotheses grounded in peer-reviewed scientific literature.

### 2. Coding Agent (`CODING_AGENT`)
- **Primary Domain**: Mathematical layer implementation, numerical optimization, PyTorch / CUDA kernel scaffolding.
- **Allowed Tools**: `python_repl`, `pytorch_geometric_sandbox`, `code_ast_validator`.
- **System Objective**: Generate verified scientific code adhering to mathematical invariants (e.g. SE(3) equivariance in geometric deep learning).

### 3. Data Agent (`DATA_AGENT`)
- **Primary Domain**: Structural biology datasets, tabular cleaning, leakage detection, cross-validation split verification.
- **Allowed Tools**: `pandas_profiler`, `split_leakage_detector`, `structure_pdb_parser`.
- **System Objective**: Ensure training/validation/test partitions are strictly disjoint and free from structural homology contamination.

### 4. Experiment Agent (`EXPERIMENT_AGENT`)
- **Primary Domain**: Hyperparameter search orchestration, loss curve monitoring, metric convergence verification.
- **Allowed Tools**: `wandb_logger`, `cuda_cluster_runner`, `loss_convergence_tracker`.
- **System Objective**: Run reproducible benchmark trials and compute statistical significance metrics ($p$-values, Pearson $r$, MSE).

### 5. Documentation Agent (`DOC_AGENT`)
- **Primary Domain**: LaTeX manuscript generation, docstring standardization, README and benchmark protocol writing.
- **Allowed Tools**: `latex_compiler`, `markdown_generator`, `bibtex_validator`.
- **System Objective**: Produce high-rigor scientific write-ups with full citation hygiene and artifact reproduction steps.

### 6. Integrity & Provenance Agent (`INTEGRITY_AGENT`)
- **Primary Domain**: Cryptographic hashing of prompts and outputs, model hallucination checks, Charter compliance auditing.
- **Allowed Tools**: `sha256_hasher`, `provenance_graph_builder`, `charter_validator`.
- **System Objective**: Guarantee transparent, tamper-evident audit trails for every AI interaction.

---

## 3. Extensibility Model
New agents are registered into `AIMesh` via the `registerAgent(spec: AgentSpec)` API.
Every agent specification declares:
- `type`: Unique identifier string.
- `supportedTools`: List of required tool interfaces.
- `minCharterConfidentiality`: Maximum data sensitivity tier permitted.
- `execute(task: MeshTask)`: Async handler returning execution telemetry and provenance metadata.
