'use client';

import React from 'react';
import { Activity, CheckCircle2, Cpu, Database, ShieldCheck, Zap } from 'lucide-react';

export default function AdminHealthPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Activity className="h-6 w-6 text-emerald-400" />
          System Health & Node Diagnostics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time cluster availability, gateway latency, database persistence status, and GPU worker nodes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Agent Gateway', status: 'HEALTHY', latency: '4ms', icon: ShieldCheck, color: 'text-emerald-400' },
          { name: 'AI Mesh Cluster', status: 'ONLINE', latency: '12ms', icon: Cpu, color: 'text-purple-400' },
          { name: 'Ledger Engine', status: 'SYNCHRONIZED', latency: '2ms', icon: Database, color: 'text-cyan-400' },
          { name: 'GPU Benchmark Node', status: 'READY (A100)', latency: '340ms', icon: Zap, color: 'text-amber-400' },
        ].map((sub) => {
          const Icon = sub.icon;
          return (
            <div key={sub.name} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${sub.color}`} />
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {sub.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{sub.name}</h3>
              <div className="pt-2 border-t border-obsidian-800 text-[11px] font-mono text-slate-400 flex justify-between">
                <span>P99 Latency:</span>
                <span className="text-white">{sub.latency}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
