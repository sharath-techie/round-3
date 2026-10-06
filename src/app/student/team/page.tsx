'use client';

import React from 'react';
import { db } from '@/lib/db';
import { Users, Award, ShieldCheck, Mail } from 'lucide-react';

export default function StudentTeamPage() {
  const project = db.projects[0];
  const members = project.teamMembers;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Users className="h-6 w-6 text-cyan-400" />
          Research Project Team & Mentors
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Principal Investigators, Student Contributors, and Verifying Mentors collaborating under Charter Alpha.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {members.map((member) => {
          const user = db.getUserById(member.userId);
          return (
            <div key={member.userId} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={member.name}
                  className="h-12 w-12 rounded-full object-cover border border-obsidian-700"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{member.name}</h3>
                  <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                    {member.role}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{user?.bio}</p>

              <div className="pt-3 border-t border-obsidian-800 flex items-center justify-between text-xs text-slate-400">
                <span>Reputation: <strong className="text-amber-300 font-mono">{user?.reputationScore}</strong></span>
                <span>Active Tasks: <strong className="text-white font-mono">{member.activeTasksCount}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
