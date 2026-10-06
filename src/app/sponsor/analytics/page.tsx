'use client';

import React from 'react';
import { db } from '@/lib/db';
import { TrendingUp, Award, Clock, CheckCircle2, Cpu } from 'lucide-react';

export default function SponsorAnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <TrendingUp className="h-6 w-6 text-purple-400" />
          Research ROI & Impact Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Quantitative benchmarking metrics, accelerated time-to-solution, and charter compliance rates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-4 space-y-1">
          <span className="text-slate-400 text-xs block">Benchmark Accuracy Lift</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">+14.2%</span>
          <span className="text-[10px] text-slate-500">Above prior SOTA baselines</span>
        </div>
        <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-4 space-y-1">
          <span className="text-slate-400 text-xs block">Time-to-Solution</span>
          <span className="text-2xl font-bold font-mono text-cyan-400">18 Days</span>
          <span className="text-[10px] text-slate-500">Down from 90 days traditional</span>
        </div>
        <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-4 space-y-1">
          <span className="text-slate-400 text-xs block">Cost Per Verified Proof</span>
          <span className="text-2xl font-bold font-mono text-purple-400">4,200 Credits</span>
          <span className="text-[10px] text-slate-500">72% cost efficiency</span>
        </div>
        <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-4 space-y-1">
          <span className="text-slate-400 text-xs block">Charter Violations</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">0</span>
          <span className="text-[10px] text-slate-500">100% gateway enforcement</span>
        </div>
      </div>
    </div>
  );
}
