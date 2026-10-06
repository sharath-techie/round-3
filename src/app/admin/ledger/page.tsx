'use client';

import React from 'react';
import { db } from '@/lib/db';
import { History, ShieldCheck, CheckCircle2, Lock, ArrowDown, Award, Fingerprint } from 'lucide-react';

export default function AdminLedgerPage() {
  const blocks = db.ledger;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <History className="h-6 w-6 text-emerald-400" />
          Contribution Ledger Explorer (Tamper-Evident Chain)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cryptographically linked blocks minted upon mentor verification. Immutable record of peer-reviewed scientific contributions.
        </p>
      </div>

      <div className="space-y-6">
        {blocks.map((block, index) => (
          <div key={block.id} className="relative">
            <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6 space-y-4 hover:border-emerald-500/50 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-obsidian-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-700 text-xs font-mono font-bold text-emerald-300">
                    #{block.blockIndex}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Block ID: {block.id}</h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      Minted: {new Date(block.timestamp).toUTCString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    CONSENSUS SIGNED
                  </span>
                  <span className="font-mono text-cyan-300 text-xs font-bold">
                    +{block.creditsAwarded} Credits
                  </span>
                </div>
              </div>

              {/* Hashes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-obsidian-950 rounded-lg border border-obsidian-800">
                  <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Current Block Hash:</span>
                  <span className="text-cyan-400 break-all">{block.blockHash}</span>
                </div>

                <div className="p-3 bg-obsidian-950 rounded-lg border border-obsidian-800">
                  <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Previous Block Hash:</span>
                  <span className="text-slate-400 break-all">{block.previousBlockHash}</span>
                </div>
              </div>

              {/* Block Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Author / Contributor:</span>
                  <span className="font-semibold text-white">{block.authorName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Verifying Mentor Signer:</span>
                  <span className="font-semibold text-emerald-400">{block.mentorName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Associated Contribution:</span>
                  <span className="font-mono text-slate-300 text-[11px]">{block.contributionId}</span>
                </div>
              </div>
            </div>

            {index < blocks.length - 1 && (
              <div className="flex justify-center my-2">
                <ArrowDown className="h-5 w-5 text-emerald-500/60 animate-bounce" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
