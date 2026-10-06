'use client';

import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Briefcase, ArrowRight, ShieldCheck, CheckCircle2, Users } from 'lucide-react';

export default function MyResearchPage() {
  const projects = db.projects;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Briefcase className="h-6 w-6 text-blue-400" />
          My Supervised Research Projects
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Active multi-institutional research cohorts governed by VERO Charters.
        </p>
      </div>

      <div className="space-y-6">
        {projects.map((proj) => {
          const charter = db.getCharterByProjectId(proj.id);
          return (
            <div key={proj.id} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 font-mono text-[10px] text-blue-300">
                      {proj.domain}
                    </span>
                    <span className="text-xs text-slate-400">• Charter v{charter?.version}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{proj.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Sponsor: <strong className="text-slate-300">BioSynth Discovery Institute</strong> • Team: {proj.teamMembers.length} Members
                  </p>
                </div>

                <Link
                  href={`/researcher/workspace/${proj.id}`}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition"
                >
                  <span>Launch PI Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Milestones list */}
              <div className="rounded-lg bg-obsidian-950 p-4 border border-obsidian-800 space-y-2 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                  Sprint Milestones & Escrow:
                </span>
                {proj.milestones.map((ms) => (
                  <div key={ms.id} className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>{ms.title}</span>
                    </div>
                    <span className="font-mono text-cyan-400">+{ms.rewardCredits} Credits</span>
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
