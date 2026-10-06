'use client';

import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { UserCheck, Award, FlaskConical, ArrowRight } from 'lucide-react';

export default function SponsorFindStudentsPage() {
  const students = db.users.filter((u) => u.role === 'STUDENT');
  const allContributions = db.getContributions();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          <UserCheck className="h-5 w-5 text-purple-400" />
          Find Student Contributors
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Junior contributors available for project participation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {students.map((student) => {
          const contribs = allContributions.filter((c) => c.authorUserId === student.id);
          const approved = contribs.filter((c) => c.status === 'APPROVED');

          return (
            <div key={student.id} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5 flex gap-4">
              <img
                src={student.avatar}
                alt={student.name}
                className="h-12 w-12 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">{student.name}</h2>
                    <p className="text-xs text-slate-400">{student.institution}</p>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded px-2 py-0.5">
                    {student.reputationScore} rep
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{student.bio}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {student.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="rounded bg-obsidian-800 border border-obsidian-700 px-2 py-0.5 text-[10px] text-slate-300">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{approved.length} verified contributions</span>
                  <Link
                    href="/sponsor/create"
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition"
                  >
                    Invite <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
