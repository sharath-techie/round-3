'use client';

import React from 'react';
import { db } from '@/lib/db';
import { Coins, TrendingUp, CheckCircle2, History, ShieldCheck } from 'lucide-react';

export default function SponsorFundingPage() {
  const ledger = db.ledger;
  const totalBounty = 150000;
  const disbursed = ledger.reduce((acc, b) => acc + b.creditsAwarded, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Coins className="h-6 w-6 text-purple-400" />
          Funding & Escrow Management Treasury
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Escrow allocations, smart contract credit pools, and automated releases upon mentor block minting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Escrow Deposited</span>
          <span className="text-3xl font-mono font-bold text-purple-300">{totalBounty.toLocaleString()} Credits</span>
          <p className="text-xs text-slate-500">Secured across active charters.</p>
        </div>

        <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Released on Verification</span>
          <span className="text-3xl font-mono font-bold text-emerald-400">{disbursed.toLocaleString()} Credits</span>
          <p className="text-xs text-slate-500">Paid out to verified contributors.</p>
        </div>

        <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Remaining In Escrow</span>
          <span className="text-3xl font-mono font-bold text-cyan-300">{(totalBounty - disbursed).toLocaleString()} Credits</span>
          <p className="text-xs text-slate-500">Reserved for upcoming milestones.</p>
        </div>
      </div>

      {/* Disbursed Ledger */}
      <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <History className="h-4 w-4 text-emerald-400" />
          Escrow Disbursement Proofs
        </h2>

        <div className="space-y-3">
          {ledger.map((block) => (
            <div key={block.id} className="p-4 bg-obsidian-950 rounded-lg border border-obsidian-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">
                  Block #{block.blockIndex} • Verified by {block.mentorName}
                </span>
                <span className="font-mono text-[11px] text-cyan-400 mt-0.5 block">{block.blockHash}</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-400 text-sm">+{block.creditsAwarded} Credits</span>
                <span className="text-[10px] text-slate-500 block">{new Date(block.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
