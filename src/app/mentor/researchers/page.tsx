'use client';

import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Users, Award, FlaskConical, ArrowRight, Globe } from 'lucide-react';

export default function MentorResearchersPage() {
  const researchers = db.users.filter((u) => u.role === 'RESEARCHER');
  const projects = db.getProjects();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Users className="h-5 w-5 text-emerald-400" />
          Principal Investigators
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Lead researchers whose projects you are verifying.
        </p>
      </div>

      <div className="space-y-3">
        {researchers.map((researcher) => {
          const researcherProjects = projects.filter((p) =>
            p.leadResearcherId === researcher.id || p.teamMembers.some((m) => m.userId === researcher.id)
          );

          return (
            <div key={researcher.id} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5">
              <div className="flex items-start gap-4">
                <img
                  src={researcher.avatar}
                  alt={researcher.name}
                  className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-white">{researcher.name}</h2>
                      <p className="text-xs text-slate-400">{researcher.institution}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5">
                        Rep: {researcher.reputationScore.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-2">{researcher.bio}</p>

                  {researcherProjects.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Projects</span>
                      <div className="mt-1 space-y-1">
                        {researcherProjects.slice(0, 2).map((proj) => (
                          <Link
                            key={proj.id}
                            href="/mentor/queue"
                            className="block text-xs text-slate-300 hover:text-white truncate transition"
                          >
                            → {proj.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {researcher.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="rounded bg-obsidian-800 border border-obsidian-700 px-2 py-0.5 text-[10px] text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
