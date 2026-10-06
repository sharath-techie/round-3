'use client';

import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { UserCheck, Award, FlaskConical, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

export default function MentorStudentsPage() {
  const students = db.users.filter((u) => u.role === 'STUDENT');
  const allContributions = db.getContributions();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          <UserCheck className="h-5 w-5 text-emerald-400" />
          Junior Contributors
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Students participating in projects you are verifying.
        </p>
      </div>

      <div className="space-y-3">
        {students.map((student) => {
          const contribs = allContributions.filter((c) => c.authorUserId === student.id);
          const approved = contribs.filter((c) => c.status === 'APPROVED');

          return (
            <div key={student.id} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5">
              <div className="flex items-start gap-4">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-white">{student.name}</h2>
                      <p className="text-xs text-slate-400">{student.institution}</p>
                    </div>
                    <Link
                      href="/mentor/review"
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-700/50 bg-emerald-950/30 hover:bg-emerald-900/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 whitespace-nowrap transition"
                    >
                      Review Work
                    </Link>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Reputation</span>
                      <span className="font-mono font-semibold text-amber-400">{student.reputationScore.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Submissions</span>
                      <span className="font-mono font-semibold text-white">{contribs.length}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Verified</span>
                      <span className="font-mono font-semibold text-emerald-400">{approved.length}</span>
                    </div>
                  </div>

                  {student.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {student.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="rounded bg-obsidian-800 border border-obsidian-700 px-2 py-0.5 text-[10px] text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
