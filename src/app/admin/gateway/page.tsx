'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { AgentGateway } from '@/services/gateway/agent-gateway';
import { AgentType, UserRole } from '@/types';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
} from 'lucide-react';

export default function AdminGatewayPage() {
  const users = db.users;
  const projects = db.projects;

  // Simulator State
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || 'user_student_1');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || 'proj_1');
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('CODING_AGENT');
  const [selectedTools, setSelectedTools] = useState<string[]>(['python_repl', 'pytorch_geometric_sandbox']);
  const [dataSensitivity, setDataSensitivity] = useState<'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL'>('RESTRICTED');
  const [prompt, setPrompt] = useState('Train SE(3) graph convolution layer.');

  const [simResult, setSimResult] = useState<any>(null);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.getUserById(selectedUserId) || users[0];
    const result = AgentGateway.evaluate({
      user,
      projectId: selectedProjectId,
      agentType: selectedAgent,
      requestedTools: selectedTools,
      prompt,
      dataClassificationRequested: dataSensitivity,
    });
    setSimResult(result);
  };

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <ShieldCheck className="h-6 w-6 text-amber-400" />
          Agent Gateway Enforcement Console & Policy Simulator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Strict policy boundary intercepting all human-to-AI and agent-to-agent transactions against Charter constraints.
        </p>
      </div>

      {/* Gateway Architecture Diagram */}
      <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Enforcement Boundary Pipeline
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="rounded bg-obsidian-950 px-2.5 py-1 text-slate-300 border border-obsidian-800">User</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="rounded bg-obsidian-950 px-2.5 py-1 text-slate-300 border border-obsidian-800">Auth</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="rounded bg-obsidian-950 px-2.5 py-1 text-slate-300 border border-obsidian-800">Project Context</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="rounded bg-obsidian-950 px-2.5 py-1 text-slate-300 border border-obsidian-800">Role Check</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="rounded bg-amber-950/60 text-amber-300 border border-amber-600/40 font-bold">Charter Boundary</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="rounded bg-obsidian-950 px-2.5 py-1 text-slate-300 border border-obsidian-800">Agent Whitelist</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="rounded bg-obsidian-950 px-2.5 py-1 text-slate-300 border border-obsidian-800">Tool Whitelist</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="rounded bg-obsidian-950 px-2.5 py-1 text-slate-300 border border-obsidian-800">Data Boundary</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="rounded bg-purple-950/60 text-purple-300 border border-purple-600/40 font-bold">AI Mesh</span>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Form (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <form onSubmit={handleSimulate} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Interactive Boundary Simulator
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Actor Identity & Role:</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-2 text-white"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Project:</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-2 text-white"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Requested Agent:</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value as AgentType)}
                  className="w-full rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-2 text-white"
                >
                  <option value="CODING_AGENT">Coding Agent</option>
                  <option value="RESEARCH_AGENT">Research Agent</option>
                  <option value="DATA_AGENT">Data Agent</option>
                  <option value="EXPERIMENT_AGENT">Experiment Agent</option>
                  <option value="DOC_AGENT">Documentation Agent</option>
                  <option value="INTEGRITY_AGENT">Integrity Agent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Data Sensitivity Requested:</label>
                <select
                  value={dataSensitivity}
                  onChange={(e) => setDataSensitivity(e.target.value as any)}
                  className="w-full rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-2 text-white"
                >
                  <option value="PUBLIC">PUBLIC</option>
                  <option value="RESTRICTED">RESTRICTED</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                </select>
              </div>
            </div>

            {/* Tool Selection (Permitted and Banned) */}
            <div className="text-xs">
              <label className="block text-slate-400 mb-2">Requested Execution Tools:</label>
              <div className="flex flex-wrap gap-2">
                {[
                  'python_repl',
                  'pytorch_geometric_sandbox',
                  'arxiv_search',
                  'hash_verification',
                  'raw_shell_exec',
                  'external_cloud_upload',
                ].map((tool) => {
                  const isSelected = selectedTools.includes(tool);
                  const isBanned = tool === 'raw_shell_exec' || tool === 'external_cloud_upload';
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition border ${
                        isSelected
                          ? isBanned
                            ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                            : 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                          : 'bg-obsidian-950 border-obsidian-800 text-slate-500'
                      }`}
                    >
                      {tool} {isBanned && '(Charter Banned)'}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 py-2.5 text-xs font-bold text-black transition"
            >
              <Play className="h-3.5 w-3.5 fill-black" />
              <span>Evaluate Gateway Policy Decision</span>
            </button>
          </form>
        </div>

        {/* Right: Simulation Output (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Gateway Enforcement Verdict
            </h3>

            {simResult ? (
              <div className="space-y-4">
                <div
                  className={`rounded-xl border p-4 flex items-center gap-3 ${
                    simResult.allowed
                      ? 'bg-emerald-950/30 border-emerald-700 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-700 text-rose-300'
                  }`}
                >
                  {simResult.allowed ? (
                    <ShieldCheck className="h-8 w-8 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <ShieldAlert className="h-8 w-8 text-rose-400 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold">
                      {simResult.allowed ? 'VERDICT: REQUEST APPROVED' : 'VERDICT: ENFORCEMENT INTERCEPTION (DENIED)'}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">{simResult.reason}</p>
                  </div>
                </div>

                {simResult.charterViolations && simResult.charterViolations.length > 0 && (
                  <div className="rounded-lg bg-rose-950/20 border border-rose-800/40 p-3 space-y-1.5 text-xs">
                    <span className="font-bold text-rose-400 uppercase text-[10px] block">
                      Violations Identified ({simResult.charterViolations.length}):
                    </span>
                    {simResult.charterViolations.map((v: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5 text-rose-200 text-[11px]">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3 bg-obsidian-950 rounded-lg border border-obsidian-800 text-xs font-mono space-y-1 text-slate-300">
                  <div>Permitted Tools: [{simResult.permittedTools?.join(', ') || 'None'}]</div>
                  <div>Audit Event ID: <span className="text-cyan-400">{simResult.auditEventId}</span></div>
                  <div>Rate Limit Remaining: {simResult.rateLimitRemaining}%</div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                Click "Evaluate Gateway Policy Decision" to simulate live boundary checks.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
