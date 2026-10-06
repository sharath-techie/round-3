'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { db } from '@/lib/db';
import {
  Briefcase,
  ChevronLeft,
  Users,
  CheckCircle2,
  Clock,
  Coins,
  ShieldCheck,
  FlaskConical,
  ArrowRight,
  GitCommit,
} from 'lucide-react';

export default function SponsorProjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const project = db.getProjectById(id);
  const charter = project ? db.getCharterByProjectId(project.id) : null;
  const contributions = project ? db.getContributions().filter((c) => c.projectId === project.id) : [];
  const ledgerBlocks = db.ledger.filter((b) => b.projectId === id);
  const totalDisbursed = ledgerBlocks.reduce((sum, b) => sum + b.creditsAwarded, 0);

  if (!project) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-slate-400">Project not found.</p>
        <Link href="/sponsor/projects" className="mt-4 inline-block text-xs text-cyan-400 hover:underline">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const milestonesDone = project.milestones.filter((m) => m.status === 'VERIFIED').length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link href="/sponsor/projects" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition">
          <ChevronLeft className="h-3.5 w-3.5" />
          All Projects
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-obsidian-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 font-mono text-[10px] text-purple-300">
              {project.domain}
            </span>
            <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${
              project.status === 'ACTIVE'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                : 'bg-slate-500/10 text-slate-300'
            }`}>{project.status}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
          <p className="text-sm text-slate-400 mt-1">{project.milestones[0]?.description || 'Charter-governed research project'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sponsor/funding" className="flex items-center gap-2 rounded-lg border border-obsidian-600 bg-obsidian-800 hover:bg-obsidian-700 px-3 py-2 text-xs font-semibold text-slate-200 transition">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            Escrow
          </Link>
          <Link href="/sponsor/analytics" className="flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 px-3 py-2 text-xs font-bold text-white transition">
            Analytics
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Team Members', value: project.teamMembers.length, color: 'text-white' },
          { label: 'Milestones Complete', value: `${milestonesDone}/${project.milestones.length}`, color: milestonesDone === project.milestones.length ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'Contributions', value: contributions.filter((c) => c.status === 'APPROVED').length + ' verified', color: 'text-emerald-400' },
          { label: 'Credits Disbursed', value: totalDisbursed.toLocaleString(), color: 'text-amber-400' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-obsidian-700 bg-obsidian-900/60 p-4">
            <span className="text-xs text-slate-500 block mb-1">{stat.label}</span>
            <span className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Milestones */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Milestone Progress</h2>
            <div className="space-y-2">
              {project.milestones.map((ms) => (
                <div key={ms.id} className="flex items-center justify-between p-3.5 rounded-lg bg-obsidian-900/60 border border-obsidian-700">
                  <div className="flex items-center gap-3">
                    {ms.status === 'VERIFIED' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-slate-600 flex-shrink-0" />
                    )}
                    <div>
                      <span className="text-sm font-medium text-white block">{ms.title}</span>
                      <span className="text-xs text-slate-500">Due: {ms.deadline}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-amber-400">+{ms.rewardCredits.toLocaleString()} cr</span>
                    <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${
                      ms.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-300'
                        : ms.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-300'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {ms.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Contributions */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Recent Verified Work</h2>
            <div className="space-y-2">
              {contributions.filter((c) => c.status === 'APPROVED').slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-obsidian-900/60 border border-obsidian-700 text-xs">
                  <div>
                    <span className="font-semibold text-white block">{c.title}</span>
                    <span className="text-slate-400">{c.authorName} • {c.taskTitle}</span>
                  </div>
                  <span className="font-mono text-emerald-400 whitespace-nowrap">+{c.creditsRequested.toLocaleString()} cr</span>
                </div>
              ))}
              {contributions.filter((c) => c.status === 'APPROVED').length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No verified contributions yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Charter & Team */}
        <div className="space-y-5">
          {charter && (
            <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                Active Charter
              </h3>
              <p className="text-xs font-semibold text-white">{charter.title}</p>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Version: <span className="text-slate-200">v{charter.version}</span></div>
              </div>
              <Link href="/sponsor/create" className="block text-xs text-cyan-400 hover:underline">
                View Charter →
              </Link>
            </div>
          )}

          <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              Team
            </h3>
            <div className="space-y-2">
              {project.teamMembers.map((member) => {
                const user = db.getUserById(member.userId);
                return (
                  <div key={member.userId} className="flex items-center justify-between text-xs">
                    <span className="text-slate-200">{user?.name || member.userId}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{member.role.replace(/_/g, ' ')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
