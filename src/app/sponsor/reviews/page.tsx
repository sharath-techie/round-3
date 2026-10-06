'use client';

import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Scale, CheckCircle2, Clock, ArrowRight, FileCode2 } from 'lucide-react';

export default function SponsorReviewsPage() {
  const projects = db.getProjects();
  const contributions = db.getContributions();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Scale className="h-5 w-5 text-purple-400" />
          Research Review Status
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Verification status of all research contributions on your sponsored projects.
        </p>
      </div>

      <div className="space-y-4">
        {projects.map((project) => {
          const projectContribs = contributions.filter((c) => c.projectId === project.id);
          if (projectContribs.length === 0) return null;

          return (
            <div key={project.id} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5 space-y-4">
              <h2 className="text-sm font-bold text-white">{project.title}</h2>

              <div className="space-y-2">
                {projectContribs.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-obsidian-950 border border-obsidian-800 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${
                        c.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : c.status === 'UNDER_REVIEW' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : c.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        : 'bg-slate-500/10 text-slate-300'
                      }`}>{c.status}</span>
                      <div>
                        <span className="font-semibold text-white block">{c.title}</span>
                        <span className="text-slate-500">by {c.authorName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-amber-400">+{c.creditsRequested.toLocaleString()} cr</span>
                      {c.reviews.length > 0 && (
                        <span className="text-slate-500">{new Date(c.reviews[c.reviews.length - 1].reviewedAt).toLocaleDateString()}</span>
                      )}
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
