'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, Scale } from 'lucide-react';

export default function MentorDisputesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <AlertTriangle className="h-6 w-6 text-amber-400" />
          Disputes & Escalation Arbitration
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Arbitration queue for contested verification decisions, charter rule ambiguities, or credit disputes.
        </p>
      </div>

      <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-8 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
        <h3 className="text-base font-bold text-white">No Active Disputes</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          All mentor verification sign-offs and credit allocations in the current epoch are uncontested and verified by protocol consensus.
        </p>
      </div>
    </div>
  );
}
