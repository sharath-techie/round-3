'use client';

import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Compass, Coins, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ResearcherDiscoverPage() {
  const problems = db.problemStatements;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Compass className="h-6 w-6 text-blue-400" />
          Discover Research Problem Statements & Sponsor Grants
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Open RFPs funded by biotechnology sponsors, climate foundations, and AI laboratories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {problems.map((prob) => (
          <div key={prob.id} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 font-mono text-[10px] text-blue-300">
                {prob.domain}
              </span>
              <span className="font-mono text-xs text-amber-400 flex items-center gap-1 font-bold">
                <Coins className="h-3.5 w-3.5" />
                {prob.budgetCredits.toLocaleString()} Credits
              </span>
            </div>

            <h2 className="text-base font-bold text-white">{prob.title}</h2>
            <p className="text-xs text-slate-400">Sponsor: <strong className="text-slate-200">{prob.sponsorOrg}</strong></p>
            <p className="text-xs text-slate-300 leading-relaxed">{prob.summary}</p>

            <div className="rounded-lg bg-obsidian-950 p-3 border border-obsidian-800 text-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Deliverables:</span>
              {prob.acceptanceCriteria.map((crit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{crit}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/researcher/workspace"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-bold text-white transition"
              >
                <span>Initialize Research Initiative</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
