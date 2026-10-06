import {
  User,
  Project,
  ProblemStatement,
  ProjectCharter,
  Milestone,
  Task,
  Experiment,
  ExperimentRun,
  AIProvenance,
  Contribution,
  Review,
  ContributionLedgerEntry,
  AuditEvent,
  Dispute,
  Notification,
  UserRole,
} from '@/types';

// Initial Mock Seed Users matching production platform personas
export const SEED_USERS: User[] = [
  {
    id: 'user_student_1',
    name: 'Sharath Swaroop',
    email: 'sharath.swaroop@research.edu',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    institution: 'Center for Computational Intelligence',
    bio: 'Junior ML researcher working on computer vision for medical diagnostics and graph representation learning.',
    reputationScore: 540,
    credits: 420,
    skills: ['Python', 'Machine Learning', 'Computer Vision', 'Research Writing', 'PyTorch'],
    verifiedContributionsCount: 6,
  },
  {
    id: 'user_researcher_1',
    name: 'Dr. Ananya Rao',
    email: 'ananya.rao@medscanlabs.ai',
    role: 'RESEARCHER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    institution: 'National Medical AI Institute & MedScan Labs',
    bio: 'Lead Principal Investigator in clinical imaging networks, tumor segmentation, and explainable AI.',
    reputationScore: 2840,
    credits: 8200,
    skills: ['Medical Imaging', 'Deep Learning', 'PyTorch', 'Grant Leadership', 'Clinical Trial Design'],
    verifiedContributionsCount: 28,
  },
  {
    id: 'user_mentor_1',
    name: 'Prof. R. Sharma',
    email: 'r.sharma@iisc.ac.in',
    role: 'MENTOR',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    institution: 'IISc Center for Scientific Integrity & Audit',
    bio: 'Senior Research Mentor evaluating methodology rigor, peer replication studies, and reproducibility benchmarks.',
    reputationScore: 4950,
    credits: 12500,
    skills: ['Methodology Audit', 'Statistical Rigor', 'Reproducibility', 'Academic Integrity', 'Model Verification'],
    verifiedContributionsCount: 64,
  },
  {
    id: 'user_sponsor_1',
    name: 'MedScan Labs',
    email: 'research@medscanlabs.com',
    role: 'SPONSOR',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    institution: 'MedScan Labs Clinical Diagnostics',
    bio: 'Underwriting advanced imaging algorithms, brain tumor detection benchmarks, and clinical translation charters.',
    reputationScore: 1950,
    credits: 200000,
    skills: ['Clinical RFP Roadmapping', 'Escrow Underwriting', 'Regulatory Compliance', 'Charter Governance'],
    verifiedContributionsCount: 14,
  },
  {
    id: 'user_admin_1',
    name: 'Admin System',
    email: 'governance@gardenia.org',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    institution: 'GARDENIA Research Protocol Foundation',
    bio: 'Platform Governor auditing organization verifications, security gateways, and distributed ledger integrity.',
    reputationScore: 9999,
    credits: 250000,
    skills: ['Organization Verification', 'Gateway Security', 'Ledger Cryptography', 'Dispute Resolution'],
    verifiedContributionsCount: 150,
  },
];

// Initial Problem Statements
export const SEED_PROBLEM_STATEMENTS: ProblemStatement[] = [
  {
    id: 'ps_1',
    sponsorId: 'user_sponsor_1',
    sponsorName: 'MedScan Labs Clinical Diagnostics',
    sponsorOrg: 'MedScan Labs',
    title: 'AI for Medical Image Analysis',
    domain: 'MED_IMAGING',
    summary: 'Develop robust AI models to detect and classify brain tumors from MRI scans, with a focus on early-stage detection and explainable results.',
    background: 'Early brain tumor diagnosis requires sub-millimeter axial MRI segmentation. Current deep models lack calibrated confidence intervals and fail on multi-scanner contrast variations. We need self-calibrating vision transformer models capable of multi-sequence T1/T2/FLAIR segmentation with verified Grad-CAM saliency explainability.',
    objective: 'Implement 3D Swin-UNETR architecture achieving Dice Similarity Coefficient >= 0.88 on BraTS2024 validation dataset under strict clinical privacy charters.',
    rawProblemText: 'TARGET: 3D MRI brain tumor segmentation. METRICS: Dice Coefficient >= 0.88, HD95 < 4.2mm. SENSITIVITY: Confidential Clinical MRI Data.',
    acceptanceCriteria: [
      'Model achieves Dice >= 0.88 across whole tumor, tumor core, and enhancing tumor',
      'Reproducible inference pipeline running in HIPAA-compliant container sandbox',
      'Saliency/attention heatmap verification by clinical mentor',
      'Zero training data exfiltration through Agent Gateway'
    ],
    targetDeliverables: [
      'Pretrained 3D Swin-UNETR weights and ONNX runtime bundle',
      'Interactive Grad-CAM explainability verification notebook',
      'Clinical validation report and DICOM inference benchmark'
    ],
    budgetCredits: 25000,
    bountyRewardsUSD: 35000,
    status: 'IN_ACTIVE_RESEARCH',
    createdAt: '2026-09-10T10:00:00Z',
  },
  {
    id: 'ps_2',
    sponsorId: 'user_sponsor_1',
    sponsorName: 'GreenFuture Energy Technologies',
    sponsorOrg: 'GreenFuture Inc.',
    title: 'Sustainable Battery Material Discovery',
    domain: 'CLIMATE_AI',
    summary: 'Accelerate novel solid-state battery electrolyte screening with generative molecular graph models and electrochemical stability prediction.',
    background: 'Next-generation lithium metal batteries require solid inorganic electrolytes with ionic conductivity > 10^-3 S/cm and broad electrochemical stability windows. High-throughput DFT is computationally prohibitive. Generative GNNs can explore the chemical space of thiophosphate crystal structures in minutes.',
    objective: 'Synthesize generative diffusion pipeline screening 100,000 candidate solid-state ionic conductors with DFT stability validation.',
    rawProblemText: 'TARGET: Solid-state electrolyte discovery. METRIC: Ionic conductivity > 10^-3 S/cm, bandgap > 4.5eV.',
    acceptanceCriteria: [
      'Prediction of 5 novel crystal candidates with verified Phase Stability (Ehull < 30 meV/atom)',
      'Deterministic crystal structure graph representation test',
      'Independent mentor rerun of ionic transport simulation'
    ],
    targetDeliverables: [
      'Crystal graph diffusion neural model',
      'Screened candidate chemical catalog with CIF structure files',
      'Electrochemical stability benchmark notebook'
    ],
    budgetCredits: 20000,
    bountyRewardsUSD: 28000,
    status: 'IN_ACTIVE_RESEARCH',
    createdAt: '2026-09-18T14:30:00Z',
  },
  {
    id: 'ps_3',
    sponsorId: 'user_sponsor_1',
    sponsorName: 'Global Climate Analytics',
    sponsorOrg: 'ClimateData Consortium',
    title: 'Climate Change Data Analysis & Microclimate Forecasting',
    domain: 'CLIMATE_AI',
    summary: 'High-resolution spatio-temporal neural operators for sub-kilometer microclimate weather extreme prediction under climate warming scenarios.',
    background: 'Coarse GCM models miss localized heat island spikes and precipitation anomalies. We deploy Fourier Neural Operators (FNO) to downscale ERA5 reanalysis to 500m spatial grids.',
    objective: 'Train FNO architecture achieving 4x resolution downscaling with zero drift across 30-day continuous climate forecasting.',
    rawProblemText: 'TARGET: Microclimate extreme forecasting. METRIC: RMSE < 0.65C on 2m temperature.',
    acceptanceCriteria: [
      'Downscaling evaluation on 10 global climatic sub-regions',
      'Adherence to open climate data licensing charter'
    ],
    targetDeliverables: [
      'FNO spatial downscaler checkpoint',
      'Interactive climate risk visualization dashboard'
    ],
    budgetCredits: 18000,
    bountyRewardsUSD: 22000,
    status: 'IN_ACTIVE_RESEARCH',
    createdAt: '2026-09-22T08:00:00Z',
  },
  {
    id: 'ps_4',
    sponsorId: 'user_sponsor_1',
    sponsorName: 'Quantum Dynamics Foundation',
    sponsorOrg: 'QuantumForge Labs',
    title: 'Quantum Materials Simulation with Tensor Networks',
    domain: 'QUANTUM_SECURITY',
    summary: 'Simulate strongly correlated fermionic systems using matrix product states (MPS) to identify topological superconducting phases.',
    background: 'Topological quantum computing demands reliable simulation of Majorana zero modes in semiconductor-superconductor nanowires.',
    objective: 'Implement 2D PEPS tensor network contraction algorithm scalable to 64-site quantum lattice models.',
    rawProblemText: 'TARGET: 2D PEPS contraction for Hubbard model. METRIC: Ground state energy error < 1e-4.',
    acceptanceCriteria: [
      'Convergence verification against exact diagonalization benchmarks',
      'Mentor audit of MPS truncation error'
    ],
    targetDeliverables: [
      'High-performance Julia/C++ tensor contraction engine',
      'Majorana zero mode state density verification report'
    ],
    budgetCredits: 22000,
    bountyRewardsUSD: 30000,
    status: 'OPEN_FOR_PROPOSALS',
    createdAt: '2026-09-28T09:15:00Z',
  }
];

// Project Charters (First-Class Objects)
export const SEED_CHARTERS: ProjectCharter[] = [
  {
    id: 'charter_proj_1',
    projectId: 'proj_1',
    version: 2,
    title: 'Project Alpha Charter: BioSynth Equivariant GNN Protocol',
    humanPermissions: {
      allowedRoles: ['STUDENT', 'RESEARCHER', 'MENTOR', 'SPONSOR', 'ADMIN'],
      maxContributors: 6,
      requiredReviewers: 1,
      peerReviewRequired: true,
    },
    aiPermissions: {
      aiAssistanceAllowed: true,
      computeBudgetHours: 120,
      maxTokensPerSession: 80000,
      allowedModelTiers: ['TIER_1_STANDARD', 'TIER_2_ADVANCED', 'TIER_3_REASONING'],
    },
    agentPermissions: {
      allowedAgents: ['RESEARCH_AGENT', 'CODING_AGENT', 'EXPERIMENT_AGENT', 'DOC_AGENT', 'INTEGRITY_AGENT'],
      restrictedAgents: ['DATA_AGENT'], // Restrict direct unmoderated raw data transforms
    },
    toolPermissions: {
      allowedTools: ['python_repl', 'pdbbind_loader', 'geometric_benchmark_eval', 'arxiv_search', 'hash_verification'],
      bannedTools: ['external_cloud_upload', 'raw_shell_exec', 'unfiltered_web_scraper'],
    },
    dataPermissions: {
      sensitivityLevel: 'RESTRICTED',
      piiAllowed: false,
      externalExportAllowed: false,
    },
    contributionRules: {
      minEvidenceRequired: ['METRIC_LOG', 'EXPERIMENT_RUN', 'PROVENANCE_HASH'],
      codeCoverageRequiredPct: 85,
      reproducibilityThresholdPct: 95,
    },
    verificationRules: {
      mentorSignOffRequired: true,
      quorumCount: 1,
      autoIntegrityPassRequired: true,
    },
    ipAndRewards: {
      license: 'Apache-2.0 with Contributor Commercial Attribution',
      studentCreditSharePct: 45,
      leadResearcherCreditSharePct: 40,
      totalPoolCredits: 18500,
    },
    updatedAt: '2026-09-14T11:00:00Z',
  },
  {
    id: 'charter_proj_2',
    projectId: 'proj_2',
    version: 1,
    title: 'Apex Mobility Sensor Fusion Charter',
    humanPermissions: {
      allowedRoles: ['STUDENT', 'RESEARCHER', 'MENTOR', 'SPONSOR', 'ADMIN'],
      maxContributors: 8,
      requiredReviewers: 1,
      peerReviewRequired: false,
    },
    aiPermissions: {
      aiAssistanceAllowed: true,
      computeBudgetHours: 200,
      maxTokensPerSession: 60000,
      allowedModelTiers: ['TIER_1_STANDARD', 'TIER_2_ADVANCED'],
    },
    agentPermissions: {
      allowedAgents: ['RESEARCH_AGENT', 'CODING_AGENT', 'DATA_AGENT', 'EXPERIMENT_AGENT', 'INTEGRITY_AGENT'],
      restrictedAgents: ['DOC_AGENT'],
    },
    toolPermissions: {
      allowedTools: ['nuscenes_toolkit', 'torch_cuda_benchmark', 'bayesian_eval'],
      bannedTools: ['raw_shell_exec', 'external_cloud_upload'],
    },
    dataPermissions: {
      sensitivityLevel: 'CONFIDENTIAL',
      piiAllowed: false,
      externalExportAllowed: false,
    },
    contributionRules: {
      minEvidenceRequired: ['METRIC_LOG', 'EXPERIMENT_RUN'],
      codeCoverageRequiredPct: 80,
      reproducibilityThresholdPct: 90,
    },
    verificationRules: {
      mentorSignOffRequired: true,
      quorumCount: 1,
      autoIntegrityPassRequired: true,
    },
    ipAndRewards: {
      license: 'Proprietary Sponsor Grant License',
      studentCreditSharePct: 50,
      leadResearcherCreditSharePct: 35,
      totalPoolCredits: 22000,
    },
    updatedAt: '2026-09-20T16:00:00Z',
  }
];

// Seed Projects
export const SEED_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    problemStatementId: 'ps_1',
    sponsorId: 'user_sponsor_1',
    leadResearcherId: 'user_researcher_1',
    leadResearcherName: 'Dr. Elena Rostova',
    title: 'Zero-Shot Protein Binding Affinity Optimization with Geometric GNNs',
    slug: 'zero-shot-gnn-binding',
    domain: 'BIOTECH',
    status: 'ACTIVE',
    charterId: 'charter_proj_1',
    teamMembers: [
      { userId: 'user_researcher_1', name: 'Dr. Elena Rostova', role: 'RESEARCHER', joinedAt: '2026-09-13T10:00:00Z', activeTasksCount: 2 },
      { userId: 'user_student_1', name: 'Alex Rivera', role: 'STUDENT', joinedAt: '2026-09-14T09:00:00Z', activeTasksCount: 3 },
      { userId: 'user_mentor_1', name: 'Prof. Marcus Vance', role: 'MENTOR', joinedAt: '2026-09-14T11:00:00Z', activeTasksCount: 1 },
    ],
    milestones: [
      {
        id: 'ms_1_1',
        projectId: 'proj_1',
        title: 'M1: Geometric Data Pipeline & PDBbind Feature Graph Construction',
        description: 'Construct SE(3)-invariant atomic graph representations including radial distance kernels and dihedral torsion angles.',
        deadline: '2026-10-15',
        status: 'VERIFIED',
        rewardCredits: 4500,
      },
      {
        id: 'ms_1_2',
        projectId: 'proj_1',
        title: 'M2: Equivariant Transformer Architecture Implementation & Training',
        description: 'Implement EGNN / Schnet message passing blocks with cross-attention between receptor pocket and small-molecule ligand.',
        deadline: '2026-10-30',
        status: 'IN_PROGRESS',
        rewardCredits: 7000,
      },
      {
        id: 'ms_1_3',
        projectId: 'proj_1',
        title: 'M3: Zero-Shot Mutation Benchmark & Mentor Reproducibility Verification',
        description: 'Demonstrate affinity drop predictions on experimental SARS-CoV-2 spike mutations verified by independent mentor rerun.',
        deadline: '2026-11-20',
        status: 'PENDING',
        rewardCredits: 7000,
      },
    ],
    tasks: [
      {
        id: 'task_1',
        projectId: 'proj_1',
        milestoneId: 'ms_1_2',
        title: 'Implement Radial Basis Distance Embedding Block with Cutoff Function',
        description: 'Encode atomic pairwise distances up to 8.0 Angstroms using cosine cutoffs and 32 Gaussian radial basis kernels.',
        assignedToUserId: 'user_student_1',
        assignedToName: 'Alex Rivera',
        status: 'IN_REVIEW',
        priority: 'HIGH',
        requiredEvidenceType: 'EXPERIMENT_RUN',
        dueDate: '2026-10-10',
      },
      {
        id: 'task_2',
        projectId: 'proj_1',
        milestoneId: 'ms_1_2',
        title: 'Tune Coordinate Update Damping Parameter in Equivariant Layer',
        description: 'Prevent coordinate explosion during backpropagation by constraining layer velocity updates with tanh bounds.',
        assignedToUserId: 'user_student_1',
        assignedToName: 'Alex Rivera',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        requiredEvidenceType: 'METRIC_LOG',
        dueDate: '2026-10-18',
      },
      {
        id: 'task_3',
        projectId: 'proj_1',
        milestoneId: 'ms_1_1',
        title: 'Audit Coordinate Invariance Unit Tests across Random SO(3) Rotations',
        description: 'Verify that arbitrary rotations and translations of atomic coordinates produce zero delta in output affinity scalar.',
        assignedToUserId: 'user_researcher_1',
        assignedToName: 'Dr. Elena Rostova',
        status: 'DONE',
        priority: 'MEDIUM',
        requiredEvidenceType: 'PROVENANCE_HASH',
        dueDate: '2026-10-02',
      }
    ],
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-10-05T18:00:00Z',
  },
  {
    id: 'proj_2',
    problemStatementId: 'ps_2',
    sponsorId: 'user_sponsor_1',
    leadResearcherId: 'user_researcher_1',
    leadResearcherName: 'Dr. Elena Rostova',
    title: 'Adverse-Weather LiDAR-Radar Sensor Fusion with Uncertainty Bounds',
    slug: 'radar-lidar-sensor-fusion',
    domain: 'AUTONOMOUS_SYSTEMS',
    status: 'ACTIVE',
    charterId: 'charter_proj_2',
    teamMembers: [
      { userId: 'user_researcher_1', name: 'Dr. Elena Rostova', role: 'RESEARCHER', joinedAt: '2026-09-19T08:00:00Z', activeTasksCount: 1 },
      { userId: 'user_student_1', name: 'Alex Rivera', role: 'STUDENT', joinedAt: '2026-09-20T10:00:00Z', activeTasksCount: 2 },
      { userId: 'user_mentor_1', name: 'Prof. Marcus Vance', role: 'MENTOR', joinedAt: '2026-09-20T12:00:00Z', activeTasksCount: 1 },
    ],
    milestones: [
      {
        id: 'ms_2_1',
        projectId: 'proj_2',
        title: 'M1: NuScenes Adverse Weather Augmentation & Radar Point Cloud Pipeline',
        description: 'Preprocess raw 4D imaging radar Doppler point clouds and synchronize with degraded LiDAR scans.',
        deadline: '2026-10-25',
        status: 'IN_PROGRESS',
        rewardCredits: 8000,
      }
    ],
    tasks: [
      {
        id: 'task_4',
        projectId: 'proj_2',
        milestoneId: 'ms_2_1',
        title: 'Build Doppler Velocity Filter for Dense Rain Backscatter Removal',
        description: 'Filter noise points where velocity variance contradicts vehicle ego-motion by > 3 sigma.',
        assignedToUserId: 'user_student_1',
        assignedToName: 'Alex Rivera',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        requiredEvidenceType: 'EXPERIMENT_RUN',
        dueDate: '2026-10-14',
      }
    ],
    createdAt: '2026-09-19T08:00:00Z',
    updatedAt: '2026-10-05T14:00:00Z',
  }
];

// Seed Experiments & Runs
export const SEED_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp_1',
    projectId: 'proj_1',
    authorUserId: 'user_student_1',
    title: 'Trial 104: Equivariant Graph Attention with 32 Radial Basis Features',
    hypothesis: 'Increasing RBF resolution from 16 to 32 kernels between 0.5A and 6.0A will resolve hydrogen bond micro-geometries and decrease validation RMSE below 1.25 kcal/mol.',
    methodology: 'Train 50 epochs on PDBbind refined set (3,840 complexes) using AdamW (lr=3e-4, weight_decay=1e-4) with coordinate updates enabled after epoch 5.',
    codeSnippet: `import torch
import torch.nn as nn
from torch_geometric.nn import MessagePassing

class EquivariantEGNNBlock(MessagePassing):
    def __init__(self, in_features, hidden_dim, num_rbf=32):
        super().__init__(aggr='add')
        self.rbf_fn = GaussianRBF(0.5, 6.0, num_rbf)
        self.edge_mlp = nn.Sequential(
            nn.Linear(in_features * 2 + num_rbf, hidden_dim),
            nn.SiLU(),
            nn.Linear(hidden_dim, hidden_dim)
        )
        self.coord_mlp = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.SiLU(),
            nn.Linear(hidden_dim, 1, bias=False)
        )
    
    def forward(self, h, pos, edge_index):
        dist = torch.norm(pos[edge_index[0]] - pos[edge_index[1]], dim=-1, keepdim=True)
        rbf_emb = self.rbf_fn(dist)
        return self.propagate(edge_index, h=h, pos=pos, rbf=rbf_emb, dist=dist)`,
    parameters: {
      num_rbf: 32,
      hidden_dim: 128,
      learning_rate: 0.0003,
      batch_size: 16,
      cutoff_radius: 6.0,
      damping_factor: 0.15,
    },
    status: 'COMPLETED',
    createdAt: '2026-10-04T12:00:00Z',
  },
  {
    id: 'exp_2',
    projectId: 'proj_1',
    authorUserId: 'user_student_1',
    title: 'Trial 105: Coordinate Velocity Clamping Ablation',
    hypothesis: 'Constraining maximum coordinate displacement per layer to <= 0.08 Angstroms prevents divergence on dense pocket configurations.',
    methodology: 'Ablate velocity clamp values [0.02, 0.05, 0.08, 0.15, None] across 20 validation batches.',
    codeSnippet: `# Coordinate update with velocity damping
vel = self.coord_mlp(edge_attr)
vel = torch.clamp(vel, -0.08, 0.08)
pos_out = pos + torch.sum((pos[i] - pos[j]) * vel, dim=1)`,
    parameters: {
      velocity_clamp: 0.08,
      num_rbf: 32,
      hidden_dim: 128,
    },
    status: 'RUNNING',
    createdAt: '2026-10-05T09:30:00Z',
  }
];

export const SEED_EXPERIMENT_RUNS: ExperimentRun[] = [
  {
    id: 'run_104_1',
    experimentId: 'exp_1',
    executedByUserId: 'user_student_1',
    executedByName: 'Alex Rivera',
    executionTimeMs: 48200,
    status: 'SUCCESS',
    metrics: {
      epochs: 50,
      lossCurve: [2.84, 2.12, 1.76, 1.45, 1.31, 1.22, 1.15, 1.09, 1.04, 0.98],
      accuracyCurve: [0.52, 0.61, 0.69, 0.74, 0.77, 0.81, 0.82, 0.83, 0.835, 0.841],
      f1Score: 0.841,
      latencyMs: 382,
      memoryMb: 4120,
    },
    logs: [
      '[00:00:01] Initializing PDBbind 2024 loader with 3,840 complexes...',
      '[00:00:04] Generated 32 Gaussian RBF kernels in range [0.5, 6.0] Angstroms.',
      '[00:00:12] Epoch 10/50: Loss=1.76, Pearson_r=0.69, Val_RMSE=1.42 kcal/mol',
      '[00:00:25] Epoch 25/50: Loss=1.31, Pearson_r=0.77, Val_RMSE=1.28 kcal/mol',
      '[00:00:38] Epoch 40/50: Loss=1.04, Pearson_r=0.83, Val_RMSE=1.19 kcal/mol',
      '[00:00:48] Epoch 50/50: Loss=0.98, Pearson_r=0.841, Val_RMSE=1.14 kcal/mol. Benchmark passed!',
      '[00:00:48] Output artifact SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    ],
    outputArtifactHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    timestamp: '2026-10-04T12:48:20Z',
  }
];

// Seed AI Provenance Records
export const SEED_PROVENANCE: AIProvenance[] = [
  {
    id: 'prov_104',
    userId: 'user_student_1',
    projectId: 'proj_1',
    agentType: 'CODING_AGENT',
    promptHash: '8b72e12fa09c8e1194dd8970',
    promptSnippet: 'Implement an SE(3)-equivariant EGNN layer in PyTorch Geometric with 32 Gaussian radial basis functions and coordinate velocity damping.',
    outputSnippet: 'class EquivariantEGNNBlock(MessagePassing): ... # Implemented radial basis expansion and clamped updates',
    outputHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    toolsUsed: ['python_repl', 'pytorch_geometric_sandbox', 'hash_verification'],
    dataSources: ['PDBbind_v2024_refined', 'charter_proj_1_policy'],
    charterVersion: 2,
    verifiedByIntegrityAgent: true,
    timestamp: '2026-10-04T11:45:00Z',
  }
];

// Seed Contributions
export const SEED_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'contrib_1',
    projectId: 'proj_1',
    projectTitle: 'Zero-Shot Protein Binding Affinity Optimization with Geometric GNNs',
    taskId: 'task_1',
    taskTitle: 'Implement Radial Basis Distance Embedding Block with Cutoff Function',
    milestoneId: 'ms_1_2',
    authorUserId: 'user_student_1',
    authorName: 'Alex Rivera',
    authorRole: 'STUDENT',
    title: 'SE(3)-Equivariant Message Passing Block with 32 Gaussian RBF Distance Embeddings',
    summary: 'Constructed and benchmarked a radial distance embedding module achieving Pearson r=0.841 on PDBbind validation complexes with 382ms inference time, exceeding the charter target.',
    gitCommitHash: '9a4c81b21c43f9a7e02b28c8914d334584e03f41',
    artifactType: 'CODE',
    artifactPayload: `// Equivariant EGNN Implementation with RBF & Velocity Damping
// Commit: 9a4c81b21c43f9a7e02b28c8914d334584e03f41
// Verified against Charter proj_1 rules

import torch
import torch.nn as nn
from torch_geometric.nn import MessagePassing

class GaussianRBF(nn.Module):
    def __init__(self, start=0.5, stop=6.0, num_kernels=32):
        super().__init__()
        offset = torch.linspace(start, stop, num_kernels)
        self.coeff = -0.5 / ((stop - start) / num_kernels) ** 2
        self.register_buffer('offset', offset)

    def forward(self, dist):
        dist = dist.view(-1, 1) - self.offset.view(1, -1)
        return torch.exp(self.coeff * torch.pow(dist, 2))`,
    evidenceItems: [
      {
        id: 'ev_1',
        type: 'EXPERIMENT_RUN',
        title: 'Run 104 Telemetry (Pearson r=0.841, Loss=0.98)',
        payload: 'run_104_1',
        verified: true,
      },
      {
        id: 'ev_2',
        type: 'PROVENANCE_HASH',
        title: 'AI Mesh Provenance Record (Integrity Agent Signed)',
        payload: 'prov_104',
        verified: true,
      },
      {
        id: 'ev_3',
        type: 'METRIC_LOG',
        title: 'SO(3) Rotation Invariance Verification Test Suite (0.000000 ΔG variation)',
        payload: '1000/1000 randomized test cases passed with maximum coordinate delta < 1e-7',
        verified: true,
      }
    ],
    aiProvenanceId: 'prov_104',
    aiProvenanceSnippet: 'Prompted Coding Agent for Gaussian RBF kernel with cosine envelope. Integrity audit confirmed zero data leakage from test split.',
    status: 'UNDER_REVIEW',
    creditsRequested: 3500,
    submittedAt: '2026-10-04T14:10:00Z',
    reviews: [],
  },
  {
    id: 'contrib_2',
    projectId: 'proj_1',
    projectTitle: 'Zero-Shot Protein Binding Affinity Optimization with Geometric GNNs',
    taskId: 'task_3',
    taskTitle: 'Audit Coordinate Invariance Unit Tests across Random SO(3) Rotations',
    milestoneId: 'ms_1_1',
    authorUserId: 'user_researcher_1',
    authorName: 'Dr. Elena Rostova',
    authorRole: 'RESEARCHER',
    title: 'Formal SO(3) & SE(3) Symmetry Proofs & Automated Test Harness',
    summary: 'Mathematically established invariance guarantees for pocket-ligand distance matrix inputs under Euclidean transformations.',
    gitCommitHash: '4f29a081ec9b33a5d8987114b09e871239aa812f',
    artifactType: 'BENCHMARK',
    artifactPayload: 'pytest tests/test_equivariance.py --exhaustive-rotations 10000 -> 100% PASS',
    evidenceItems: [
      {
        id: 'ev_4',
        type: 'REPRODUCIBILITY_NOTEBOOK',
        title: 'Jupyter Verification Notebook: rotation_proof.ipynb',
        payload: 's3://vero-evidence-vault/proj_1/notebooks/rotation_proof_hash_4f29a08.ipynb',
        verified: true,
      }
    ],
    status: 'APPROVED',
    creditsRequested: 4500,
    submittedAt: '2026-10-02T16:00:00Z',
    reviews: [
      {
        id: 'rev_1',
        contributionId: 'contrib_2',
        mentorId: 'user_mentor_1',
        mentorName: 'Prof. Marcus Vance',
        decision: 'APPROVE',
        methodologyScore: 10,
        reproducibilityScore: 10,
        charterCompliance: true,
        comments: 'Outstanding formal rigor. Re-executed the 10,000 rotation matrix transforms locally in our MIT CSAIL audit sandbox. Zero numerical drift detected. Full approval granted.',
        reviewedAt: '2026-10-03T11:20:00Z',
      }
    ],
  }
];

// Seed Contribution Ledger (Immutable Blocks)
export const SEED_LEDGER: ContributionLedgerEntry[] = [
  {
    id: 'ledger_block_0',
    blockIndex: 0,
    previousBlockHash: '0000000000000000000000000000000000000000000000000000000000000000',
    blockHash: '000001a4e891cd90f92b74548e6583921b72e5c8e2390a18342cfde294028bc1',
    contributionId: 'genesis',
    projectId: 'genesis',
    authorUserId: 'system',
    authorName: 'VERO Protocol Genesis',
    mentorId: 'system',
    mentorName: 'VERO Protocol Genesis',
    creditsAwarded: 0,
    reputationAwarded: 0,
    timestamp: '2026-09-01T00:00:00Z',
    merkleRoot: 'genesis_merkle_root_0000',
  },
  {
    id: 'ledger_block_1',
    blockIndex: 1,
    previousBlockHash: '000001a4e891cd90f92b74548e6583921b72e5c8e2390a18342cfde294028bc1',
    blockHash: '0000029b3c48911f92e85a11c8d09f7a932e65b8214fa709320eec920b721e90',
    contributionId: 'contrib_2',
    projectId: 'proj_1',
    authorUserId: 'user_researcher_1',
    authorName: 'Dr. Elena Rostova',
    mentorId: 'user_mentor_1',
    mentorName: 'Prof. Marcus Vance',
    creditsAwarded: 4500,
    reputationAwarded: 150,
    timestamp: '2026-10-03T11:20:05Z',
    merkleRoot: '4f29a081ec9b33a5d8987114b09e871239aa812f_merkle_root',
  }
];

// Seed Audit Events
export const SEED_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'audit_1',
    timestamp: '2026-10-05T17:10:00Z',
    actorUserId: 'user_student_1',
    actorName: 'Alex Rivera',
    actorRole: 'STUDENT',
    action: 'AGENT_GATEWAY_REQUEST',
    resource: 'CODING_AGENT',
    outcome: 'SUCCESS',
    details: 'Requested Coding Agent for RBF radial function generation. Charter policy check PASSED.',
    metadata: { projectId: 'proj_1', requestedTools: ['python_repl', 'pytorch_geometric_sandbox'] },
  },
  {
    id: 'audit_2',
    timestamp: '2026-10-05T16:45:00Z',
    actorUserId: 'user_student_1',
    actorName: 'Alex Rivera',
    actorRole: 'STUDENT',
    action: 'GATEWAY_TOOL_EVALUATION',
    resource: 'unfiltered_web_scraper',
    outcome: 'DENIED',
    details: 'Tool execution blocked by Charter charter_proj_1: "unfiltered_web_scraper" is in bannedTools.',
    metadata: { projectId: 'proj_1', rule: 'CharterToolPermissions.bannedTools' },
  },
  {
    id: 'audit_3',
    timestamp: '2026-10-05T15:20:00Z',
    actorUserId: 'user_mentor_1',
    actorName: 'Prof. Marcus Vance',
    actorRole: 'MENTOR',
    action: 'CONTRIBUTION_REVIEW_SUBMITTED',
    resource: 'contrib_2',
    outcome: 'SUCCESS',
    details: 'Approved contribution contrib_2. Triggered Contribution Ledger block #1 minting.',
    metadata: { credits: 4500, reputation: 150 },
  }
];

// Seed Disputes
export const SEED_DISPUTES: Dispute[] = [
  {
    id: 'disp_1',
    contributionId: 'contrib_mock_disputed',
    projectTitle: 'Adverse-Weather LiDAR-Radar Sensor Fusion',
    raisedByUserId: 'user_student_1',
    raisedByName: 'Alex Rivera',
    reason: 'Reviewer rejected citing test split contamination, but test data was isolated under Docker build argument with isolated seed.',
    status: 'UNDER_INVESTIGATION',
    createdAt: '2026-10-01T14:00:00Z',
  }
];

// Seed Notifications
export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_student_1',
    title: 'Submission Ready for Mentor Review',
    message: 'Your contribution for Task "Implement Radial Basis Distance Embedding Block" is queued for Prof. Marcus Vance.',
    type: 'REVIEW',
    read: false,
    timestamp: '2026-10-04T14:15:00Z',
    linkUrl: '/contributions',
  },
  {
    id: 'notif_2',
    userId: 'user_mentor_1',
    title: 'New Contribution Awaiting Verification',
    message: 'Alex Rivera submitted code & evidence for Project Alpha (EGNN RBF Layer). Review required.',
    type: 'REVIEW',
    read: false,
    timestamp: '2026-10-04T14:10:05Z',
    linkUrl: '/reviews',
  },
  {
    id: 'notif_3',
    userId: 'user_sponsor_1',
    title: 'Milestone 1 Completed & Verified on Ledger',
    message: 'Milestone 1 on Protein Binding GNN project has been verified by Prof. Vance. Block #1 added to ledger.',
    type: 'CREDIT',
    read: true,
    timestamp: '2026-10-03T11:21:00Z',
    linkUrl: '/analytics',
  }
];

// In-Memory Database Store Singleton
class VeroDatabase {
  users: User[] = [...SEED_USERS];
  problemStatements: ProblemStatement[] = [...SEED_PROBLEM_STATEMENTS];
  charters: ProjectCharter[] = [...SEED_CHARTERS];
  projects: Project[] = [...SEED_PROJECTS];
  experiments: Experiment[] = [...SEED_EXPERIMENTS];
  experimentRuns: ExperimentRun[] = [...SEED_EXPERIMENT_RUNS];
  provenances: AIProvenance[] = [...SEED_PROVENANCE];
  get provenance(): AIProvenance[] {
    return this.provenances;
  }
  contributions: Contribution[] = [...SEED_CONTRIBUTIONS];
  ledger: ContributionLedgerEntry[] = [...SEED_LEDGER];
  auditEvents: AuditEvent[] = [...SEED_AUDIT_EVENTS];
  get auditLogs(): AuditEvent[] {
    return this.auditEvents;
  }
  disputes: Dispute[] = [...SEED_DISPUTES];
  notifications: Notification[] = [...SEED_NOTIFICATIONS];

  // User queries
  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  getUserByRole(role: UserRole): User | undefined {
    return this.users.find((u) => u.role === role);
  }

  updateUserCredits(userId: string, deltaCredits: number, deltaRep: number): void {
    const user = this.getUserById(userId);
    if (user) {
      user.credits += deltaCredits;
      user.reputationScore += deltaRep;
    }
  }

  // Project queries
  getProjects(): Project[] {
    return this.projects;
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  getProjectsForUser(userId: string): Project[] {
    return this.projects.filter((p) => p.teamMembers.some((m) => m.userId === userId));
  }

  getCharterByProjectId(projectId: string): ProjectCharter | undefined {
    return this.charters.find((c) => c.projectId === projectId);
  }

  updateCharter(charter: ProjectCharter): void {
    const idx = this.charters.findIndex((c) => c.id === charter.id);
    if (idx !== -1) {
      this.charters[idx] = charter;
    } else {
      this.charters.push(charter);
    }
  }

  createProject(project: Project, charter: ProjectCharter): void {
    this.projects.push(project);
    this.charters.push(charter);
  }

  // Experiments
  getExperiments(projectId?: string): Experiment[] {
    if (projectId) return this.experiments.filter((e) => e.projectId === projectId);
    return this.experiments;
  }

  getExperimentById(id: string): Experiment | undefined {
    return this.experiments.find((e) => e.id === id);
  }

  addExperiment(exp: Experiment): void {
    this.experiments.unshift(exp);
  }

  addExperimentRun(run: ExperimentRun): void {
    this.experimentRuns.unshift(run);
  }

  getRunsForExperiment(expId: string): ExperimentRun[] {
    return this.experimentRuns.filter((r) => r.experimentId === expId);
  }

  // AI Provenance
  addProvenance(record: AIProvenance): void {
    this.provenances.unshift(record);
  }

  getProvenance(id: string): AIProvenance | undefined {
    return this.provenances.find((p) => p.id === id);
  }

  getProvenanceById(id: string): AIProvenance | undefined {
    return this.getProvenance(id);
  }

  // Contributions & Reviews
  getContributions(projectId?: string): Contribution[] {
    if (projectId) return this.contributions.filter((c) => c.projectId === projectId);
    return this.contributions;
  }

  getContributionById(id: string): Contribution | undefined {
    return this.contributions.find((c) => c.id === id);
  }

  createContribution(contrib: Contribution): void {
    this.contributions.unshift(contrib);
  }

  addReview(review: Review): void {
    const contrib = this.getContributionById(review.contributionId);
    if (!contrib) return;

    contrib.reviews.push(review);
    if (review.decision === 'APPROVE') {
      contrib.status = 'APPROVED';
      // Mint block in ledger
      const lastBlock = this.ledger[this.ledger.length - 1];
      const newBlockIndex = lastBlock ? lastBlock.blockIndex + 1 : 0;
      const prevHash = lastBlock ? lastBlock.blockHash : '0'.repeat(64);
      const newBlockHash = `00000${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;

      const ledgerEntry: ContributionLedgerEntry = {
        id: `ledger_block_${newBlockIndex}`,
        blockIndex: newBlockIndex,
        previousBlockHash: prevHash,
        blockHash: newBlockHash,
        contributionId: contrib.id,
        projectId: contrib.projectId,
        authorUserId: contrib.authorUserId,
        authorName: contrib.authorName,
        mentorId: review.mentorId,
        mentorName: review.mentorName,
        creditsAwarded: contrib.creditsRequested,
        reputationAwarded: Math.round(contrib.creditsRequested * 0.05),
        timestamp: new Date().toISOString(),
        merkleRoot: `${contrib.gitCommitHash}_merkle_root`,
      };

      this.ledger.push(ledgerEntry);
      this.updateUserCredits(contrib.authorUserId, ledgerEntry.creditsAwarded, ledgerEntry.reputationAwarded);

      // Add Notification
      this.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: contrib.authorUserId,
        title: 'Contribution Verified & Awarded!',
        message: `Your contribution "${contrib.title}" was approved by ${review.mentorName}. Block #${newBlockIndex} minted. +${ledgerEntry.creditsAwarded} Credits, +${ledgerEntry.reputationAwarded} Rep.`,
        type: 'CREDIT',
        read: false,
        timestamp: new Date().toISOString(),
      });
    } else if (review.decision === 'REQUEST_CHANGES') {
      contrib.status = 'DRAFT';
    } else if (review.decision === 'REJECT') {
      contrib.status = 'REJECTED';
    } else if (review.decision === 'ESCALATE_DISPUTE') {
      contrib.status = 'DISPUTED';
      this.disputes.unshift({
        id: `disp_${Date.now()}`,
        contributionId: contrib.id,
        projectTitle: contrib.projectTitle,
        raisedByUserId: review.mentorId,
        raisedByName: review.mentorName,
        reason: review.comments,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Audits
  addAuditEvent(event: AuditEvent): void {
    this.auditEvents.unshift(event);
  }

  getAuditEvents(): AuditEvent[] {
    return this.auditEvents;
  }
}

// Global Singleton
const globalForDb = globalThis as unknown as { veroDb?: VeroDatabase };
export const db = globalForDb.veroDb ?? new VeroDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.veroDb = db;
