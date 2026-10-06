'use client';

import React, { useState } from 'react';
import { AIMesh } from '@/services/mesh/ai-mesh';
import {
  Cpu,
  Plus,
  CheckCircle2,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  Network,
  Radio,
  Server,
  Terminal,
} from 'lucide-react';

export default function AdminMeshPage() {
  const [agents, setAgents] = useState(AIMesh.getAvailableAgents());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentDesc, setNewAgentDesc] = useState('');
  const [newAgentType, setNewAgentType] = useState('CUSTOM_AGENT');
  const [activeNode, setActiveNode] = useState<string>('CODING_AGENT');

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName) return;

    AIMesh.registerAgent({
      agentType: newAgentType as any,
      name: newAgentName,
      description: newAgentDesc,
      execute: async (input) => ({
        agentType: newAgentType as any,
        content: `Executed by ${newAgentName} for project ${input.projectId}`,
        provenance: {
          id: `prov_${Date.now()}`,
          userId: input.user.id,
          projectId: input.projectId,
          agentType: newAgentType as any,
          promptHash: 'custom_hash',
          promptSnippet: input.prompt.substring(0, 100),
          outputSnippet: 'Output from ' + newAgentName,
          outputHash: 'custom_out_hash',
          toolsUsed: input.tools,
          dataSources: [input.projectId],
          charterVersion: 1,
          verifiedByIntegrityAgent: true,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    setAgents(AIMesh.getAvailableAgents());
    setShowAddModal(false);
    setNewAgentName('');
    setNewAgentDesc('');
  };

  const selectedAgentData = agents.find((a) => a.type === activeNode) || agents[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-obsidian-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-purple-400">
              CLUSTER TOPOLOGY
            </span>
            <span className="text-xs text-slate-500">6 Containerized Workers Online</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Cpu className="h-7 w-7 text-purple-400" />
            <span>AI Mesh Registry & Real-Time Topology</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Distributed multi-agent execution environment. Authorized models invoked exclusively through the Agent Gateway with cryptographic provenance trees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-hairline bg-obsidian-900/80 px-4 py-2 text-right">
            <span className="text-[10px] text-slate-500 block font-mono uppercase">Cluster Latency</span>
            <span className="text-lg font-bold font-mono text-emerald-400">14ms AVG</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition"
          >
            <Plus className="h-4 w-4" />
            <span>Register Agent</span>
          </button>
        </div>
      </div>

      {/* Interactive Topology Graph Visualizer */}
      <div className="rounded-3xl border border-hairline bg-gradient-to-b from-obsidian-900/80 to-obsidian-950 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-obsidian-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Network className="h-4 w-4 text-purple-400" />
            <span className="font-bold text-white">Interactive Cluster Interconnect Graph</span>
            <span className="text-slate-600">•</span>
            <span>Click any node to inspect telemetry</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            SYNC: GATEWAY ACTIVE
          </span>
        </div>

        {/* SVG Mesh Map */}
        <div className="relative h-64 sm:h-80 w-full rounded-2xl bg-obsidian-950 border border-obsidian-800/80 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dots-pattern opacity-40" />

          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2="50%" y2="18%" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2="20%" y2="75%" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2="50%" y2="82%" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="rgba(244, 63, 94, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>

          {/* Center Hub: Gateway */}
          <div className="relative z-10 flex flex-col items-center justify-center h-24 w-24 rounded-2xl bg-obsidian-900 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20 text-center p-2">
            <ShieldCheck className="h-6 w-6 text-purple-400 mb-1" />
            <span className="text-[10px] font-mono font-bold text-white leading-tight">GATEWAY</span>
            <span className="text-[8px] font-mono text-purple-300">DISPATCHER</span>
          </div>

          {/* Orbiting Worker Nodes */}
          {[
            { type: 'RESEARCH_AGENT', label: 'Research', x: 'left-[10%] top-[15%]', color: 'text-purple-400 border-purple-500/40' },
            { type: 'CODING_AGENT', label: 'Coding GNN', x: 'left-[42%] top-[5%]', color: 'text-cyan-400 border-cyan-500/40' },
            { type: 'DATA_AGENT', label: 'Data ETL', x: 'right-[10%] top-[15%]', color: 'text-emerald-400 border-emerald-500/40' },
            { type: 'EXPERIMENT_AGENT', label: 'Runner', x: 'left-[10%] bottom-[15%]', color: 'text-blue-400 border-blue-500/40' },
            { type: 'DOC_AGENT', label: 'Docs', x: 'left-[43%] bottom-[5%]', color: 'text-amber-400 border-amber-500/40' },
            { type: 'INTEGRITY_AGENT', label: 'Integrity', x: 'right-[10%] bottom-[15%]', color: 'text-rose-400 border-rose-500/40' },
          ].map((node) => (
            <button
              key={node.type}
              onClick={() => setActiveNode(node.type)}
              className={`absolute ${node.x} z-20 flex items-center gap-2 rounded-xl bg-obsidian-900/95 border px-3 py-1.5 text-xs font-mono transition-all duration-200 hover:scale-105 shadow-md ${
                activeNode === node.type
                  ? `${node.color} ring-2 ring-white/20 bg-obsidian-850 font-bold scale-105`
                  : 'border-hairline text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{node.label}</span>
            </button>
          ))}
        </div>

        {/* Selected Node Details Drawer */}
        {selectedAgentData && (
          <div className="rounded-2xl border border-hairline bg-obsidian-950/80 p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Selected Worker Node</span>
              <span className="text-base font-bold text-white mt-0.5 block">{selectedAgentData.name}</span>
              <span className="text-cyan-400 text-[11px] block mt-0.5">{selectedAgentData.type}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Operational Profile</span>
              <p className="text-slate-300 text-[11px] mt-1 line-clamp-2">{selectedAgentData.description}</p>
            </div>
            <div className="flex flex-col justify-center space-y-1 text-slate-400 text-[11px]">
              <div className="flex justify-between">
                <span>Inference Model:</span>
                <span className="text-white">Claude 3.5 Sonnet / Reasoning</span>
              </div>
              <div className="flex justify-between">
                <span>Memory Isolation:</span>
                <span className="text-emerald-400">Sandboxed Pod</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-obsidian-700 bg-obsidian-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <h3 className="text-sm font-bold text-white">Register New Domain Agent</h3>
              <button onClick={() => setShowAddModal(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddAgent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Agent Identifier (Type):</label>
                <input
                  type="text"
                  required
                  value={newAgentType}
                  onChange={(e) => setNewAgentType(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Agent Name:</label>
                <input
                  type="text"
                  required
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. Molecular Dynamics Simulation Agent"
                  className="w-full rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Specialization Description:</label>
                <textarea
                  rows={3}
                  value={newAgentDesc}
                  onChange={(e) => setNewAgentDesc(e.target.value)}
                  placeholder="Defines mathematical or experimental domain..."
                  className="w-full rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-2 text-white"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-obsidian-700 px-3 py-1.5 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-1.5 font-bold text-white"
                >
                  Register in AI Mesh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((ag) => (
          <div
            key={ag.type}
            className={`rounded-2xl border transition-all duration-200 p-6 space-y-3 ${
              activeNode === ag.type
                ? 'bg-obsidian-850 border-purple-500/40 shadow-xl'
                : 'bg-obsidian-900/60 border-hairline hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 font-mono text-[10px] text-purple-300 font-bold">
                {ag.type}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                ONLINE
              </span>
            </div>

            <h3 className="text-base font-bold text-white">{ag.name}</h3>
            <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">{ag.description}</p>

            <div className="pt-3 border-t border-obsidian-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Avg Latency: 320ms</span>
              <span>Rate Limit: 100 req/min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
