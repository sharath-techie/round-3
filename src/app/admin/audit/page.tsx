'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { FileCode2, Search, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminAuditPage() {
  const [filterOutcome, setFilterOutcome] = useState<'ALL' | 'SUCCESS' | 'DENIED' | 'ERROR'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const audits = db.auditEvents.filter((a) => {
    if (filterOutcome !== 'ALL' && a.outcome !== filterOutcome) return false;
    if (searchTerm) {
      const match =
        a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.details.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <FileCode2 className="h-6 w-6 text-cyan-400" />
          Protocol Security & Audit Event Logs
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cryptographically signed, append-only security log of all human interactions, agent gateway decisions, and ledger minting.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-obsidian-900/60 p-4 rounded-xl border border-obsidian-700">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, actor, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-obsidian-950 border border-obsidian-800 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'SUCCESS', 'DENIED', 'ERROR'] as const).map((outcome) => (
            <button
              key={outcome}
              onClick={() => setFilterOutcome(outcome)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                filterOutcome === outcome
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-obsidian-950 text-slate-400 border border-obsidian-800'
              }`}
            >
              {outcome}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="space-y-3">
        {audits.map((event) => (
          <div
            key={event.id}
            className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-4 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white font-mono">{event.action}</span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-mono ${
                  event.outcome === 'SUCCESS'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {event.outcome}
              </span>
            </div>

            <p className="text-slate-300">{event.details}</p>

            <div className="flex items-center justify-between pt-2 border-t border-obsidian-800 text-[11px] font-mono text-slate-500">
              <span>
                Actor: <strong className="text-slate-300">{event.actorName}</strong> ({event.actorRole}) • Resource: {event.resource}
              </span>
              <span>{new Date(event.timestamp).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
