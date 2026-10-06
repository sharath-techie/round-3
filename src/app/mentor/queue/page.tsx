'use client';

import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Scale, ArrowRight, CheckCircle2, Clock, FileCode2, Fingerprint } from 'lucide-react';

export default function MentorQueuePage() {
  const contributions = db.getContributions();
  const pending = contributions.filter((c) => c.status === 'UNDER_REVIEW');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Scale className="h-6 w-6 text-emerald-400" />
            Active Verification Review Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Prioritized by task deadline and evidence completeness.
          </p>
        </div>
        <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-mono text-emerald-400">
          {pending.length} Submissions Pending
        </span>
      </div>

      <div className="space-y-4">
        {contributions.map((c) => (
          <div key={c.id} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                    {c.artifactType}
                  </span>
                  <span className="text-xs text-slate-400">Author: <strong className="text-white">{c.authorName}</strong></span>
                  <span className="text-xs text-slate-500">• {c.projectTitle}</span>
                </div>
                <h3 className="text-base font-bold text-white">{c.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{c.summary}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="font-mono text-cyan-400 text-xs">+{c.creditsRequested} Credits</span>
                <Link
                  href={`/mentor/review?id=${c.id}`}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition"
                >
                  <span>Launch Review Desk</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-obsidian-800">
              <span className="flex items-center gap-1.5 text-slate-300">
                <FileCode2 className="h-3.5 w-3.5 text-cyan-400" />
                {c.evidenceItems.length} Evidence Packages Attached
              </span>
              <span className="font-mono text-xs text-slate-500">Submitted: {new Date(c.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
