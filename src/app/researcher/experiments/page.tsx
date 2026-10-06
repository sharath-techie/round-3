'use client';

import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useRole } from '@/context/RoleContext';
import { TestTube2, Fingerprint, ArrowRight, CheckCircle2, FlaskConical } from 'lucide-react';

export default function ResearcherExperimentsPage() {
  const { currentUser } = useRole();
  const experiments = db.getExperiments();
  const runs = db.experimentRuns;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-obsidian-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <TestTube2 className="h-5 w-5 text-blue-400" />
            Experiment Registry
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            All reproducible benchmark trials across supervised projects.
          </p>
        </div>
        <Link
          href="/researcher/workspace"
          className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-2 text-xs font-bold text-white transition"
        >
          <FlaskConical className="h-3.5 w-3.5" />
          Run New Experiment
        </Link>
      </div>

      <div className="space-y-4">
        {experiments.map((exp) => {
          const expRuns = runs.filter((r) => r.experimentId === exp.id);
          const latestRun = expRuns[0];
          return (
            <div key={exp.id} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 font-mono text-[10px] text-blue-300">
                      {exp.id.toUpperCase()}
                    </span>
                    <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${
                      exp.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}>{exp.status}</span>
                  </div>
                  <h2 className="text-sm font-semibold text-white">{exp.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{exp.hypothesis}</p>
                </div>
                <div className="text-xs text-right flex-shrink-0">
                  <span className="text-slate-500 block">{expRuns.length} run{expRuns.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {latestRun && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-obsidian-800">
                  <div className="rounded bg-obsidian-950 border border-obsidian-800 p-2.5 text-xs">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Pearson r</span>
                    <span className="font-mono font-semibold text-cyan-300">{latestRun.metrics.f1Score}</span>
                  </div>
                  <div className="rounded bg-obsidian-950 border border-obsidian-800 p-2.5 text-xs">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Epochs</span>
                    <span className="font-mono font-semibold text-white">{latestRun.metrics.epochs}</span>
                  </div>
                  <div className="rounded bg-obsidian-950 border border-obsidian-800 p-2.5 text-xs">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Latency</span>
                    <span className="font-mono font-semibold text-white">{latestRun.metrics.latencyMs}ms</span>
                  </div>
                  <div className="rounded bg-obsidian-950 border border-obsidian-800 p-2.5 text-xs">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Artifact Hash</span>
                    <span className="font-mono text-cyan-400 text-[10px] truncate block">{latestRun.outputArtifactHash.substring(0, 12)}…</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-obsidian-800">
                <div className="flex items-center gap-1.5">
                  <Fingerprint className="h-3.5 w-3.5 text-purple-400" />
                  <span className="font-mono text-[10px]">Dataset: {String(exp.parameters?.dataset || 'PDBbind v2020 Benchmark')}</span>
                </div>
                <span>{new Date(exp.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
