'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { AlertTriangle, Search, CheckCircle2, Clock, XCircle, ShieldAlert } from 'lucide-react';

export default function AdminDisputesPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED'>('ALL');
  const disputes = db.disputes.filter((d) => {
    if (filterStatus !== 'ALL' && d.status !== filterStatus) return false;
    if (search && !d.reason.toLowerCase().includes(search.toLowerCase()) && !d.raisedByName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusIcon: Record<string, React.ReactNode> = {
    OPEN: <div className="h-2 w-2 rounded-full bg-rose-500" />,
    UNDER_INVESTIGATION: <div className="h-2 w-2 rounded-full bg-amber-500" />,
    RESOLVED: <div className="h-2 w-2 rounded-full bg-emerald-500" />,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-obsidian-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Dispute Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Escalated contribution disputes and integrity investigations.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-mono text-rose-400">
            {db.disputes.filter((d) => d.status === 'OPEN').length} Open
          </span>
          <span className="rounded bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-mono text-amber-400">
            {db.disputes.filter((d) => d.status === 'UNDER_INVESTIGATION').length} Investigating
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-obsidian-900/60 border border-obsidian-700 rounded-lg px-3 py-2 w-72">
          <Search className="h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search disputes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-500 flex-1 outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['ALL', 'OPEN', 'UNDER_INVESTIGATION', 'RESOLVED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                filterStatus === s
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-obsidian-900 text-slate-400 border border-obsidian-700 hover:border-slate-600'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {disputes.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            No disputes match the current filter.
          </div>
        )}
        {disputes.map((dispute) => (
          <div key={dispute.id} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">{statusIcon[dispute.status]}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">{dispute.projectTitle}</span>
                    <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${
                      dispute.status === 'OPEN' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      : dispute.status === 'UNDER_INVESTIGATION' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}>
                      {dispute.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{dispute.reason}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-obsidian-800 text-xs text-slate-500">
              <span>Raised by: <span className="text-slate-300">{dispute.raisedByName}</span> • Contribution: <span className="font-mono text-slate-400">{dispute.contributionId}</span></span>
              <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
            </div>

            {dispute.status !== 'RESOLVED' && (
              <div className="flex items-center gap-2 pt-1">
                <button className="rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-700/40 text-emerald-300 px-3 py-1.5 text-xs font-semibold transition">
                  Mark Resolved
                </button>
                <button className="rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-700/40 text-amber-300 px-3 py-1.5 text-xs font-semibold transition">
                  Escalate to Full Audit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
