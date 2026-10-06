'use client';

import React from 'react';
import { db } from '@/lib/db';
import { TestTube2, CheckCircle2, Flame, Clock, Award, Fingerprint } from 'lucide-react';

export default function StudentExperimentsPage() {
  const experiments = db.getExperiments();
  const runs = db.experimentRuns;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <TestTube2 className="h-6 w-6 text-cyan-400" />
          Reproducible Experiments & Telemetry
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Historical benchmark sweeps, loss telemetry curves, and cryptographic output hashes for Project Alpha.
        </p>
      </div>

      <div className="space-y-6">
        {experiments.map((exp) => {
          const expRuns = runs.filter((r) => r.experimentId === exp.id);
          return (
            <div key={exp.id} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                      EXPERIMENT {exp.id.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500">• {new Date(exp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-base font-bold text-white">{exp.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{exp.hypothesis}</p>
                </div>
                <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-mono text-emerald-400">
                  {exp.status}
                </span>
              </div>

              {/* Runs */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Executed Runs & Benchmarks:
                </span>
                {expRuns.map((run) => (
                  <div key={run.id} className="rounded-lg bg-obsidian-950 p-4 border border-obsidian-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Run ID: {run.id} ({run.status})
                      </span>
                      <span className="font-mono text-cyan-400 font-bold">
                        Pearson r = {run.metrics.f1Score} • {run.metrics.latencyMs}ms
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-obsidian-900 p-2.5 rounded border border-obsidian-800">
                        <span className="text-slate-400 block text-[10px]">Epochs</span>
                        <span className="font-mono text-white font-bold">{run.metrics.epochs}</span>
                      </div>
                      <div className="bg-obsidian-900 p-2.5 rounded border border-obsidian-800">
                        <span className="text-slate-400 block text-[10px]">Peak GPU VRAM</span>
                        <span className="font-mono text-white font-bold">{run.metrics.memoryMb} MB</span>
                      </div>
                      <div className="bg-obsidian-900 p-2.5 rounded border border-obsidian-800">
                        <span className="text-slate-400 block text-[10px]">Execution Latency</span>
                        <span className="font-mono text-white font-bold">{run.metrics.latencyMs} ms</span>
                      </div>
                      <div className="bg-obsidian-900 p-2.5 rounded border border-obsidian-800">
                        <span className="text-slate-400 block text-[10px]">Duration</span>
                        <span className="font-mono text-white font-bold">{(run.executionTimeMs / 1000).toFixed(1)}s</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-obsidian-900">
                      <span className="flex items-center gap-1.5 text-cyan-400">
                        <Fingerprint className="h-3.5 w-3.5" />
                        Artifact Hash: {run.outputArtifactHash}
                      </span>
                      <span>Executed by {run.executedByName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
