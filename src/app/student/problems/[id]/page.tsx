'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { db } from '@/lib/db';
import {
  FileQuestion,
  Coins,
  CheckCircle2,
  ArrowRight,
  Target,
  Package,
  Building2,
  Calendar,
  ChevronLeft,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

export default function ProblemDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const problem = db.problemStatements.find((p) => p.id === id);

  if (!problem) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-slate-400">Problem statement not found.</p>
        <Link href="/student/problems" className="mt-4 inline-block text-xs text-cyan-400 hover:underline">
          ← Back to Problems
        </Link>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    IN_ACTIVE_RESEARCH: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    OPEN_FOR_PROPOSALS: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    COMPLETED: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/student/problems" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition">
          <ChevronLeft className="h-3.5 w-3.5" />
          Problem Statements
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded border px-2 py-0.5 font-mono text-[10px]" style={{backgroundColor: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.2)', color: 'rgb(103,232,249)'}}>
                {problem.domain}
              </span>
              <span className={`rounded border px-2 py-0.5 font-mono text-[10px] ${statusColor[problem.status] || 'bg-slate-500/10 text-slate-300'}`}>
                {problem.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white leading-snug">{problem.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Building2 className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs text-slate-400">{problem.sponsorOrg}</span>
              <span className="text-slate-600">•</span>
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs text-slate-400">Posted {new Date(problem.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Overview</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{problem.summary}</p>
          </div>

          {/* Background */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technical Background</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{problem.background}</p>
          </div>

          {/* Objective */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Objective</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{problem.objective}</p>
          </div>

          {/* Raw Problem */}
          <div className="rounded-lg bg-obsidian-950 border border-obsidian-800 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              Technical Specification
            </h2>
            <pre className="text-xs font-mono text-cyan-200 whitespace-pre-wrap leading-relaxed">{problem.rawProblemText}</pre>
          </div>

          {/* Acceptance Criteria */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Acceptance Criteria
            </h2>
            <div className="space-y-2">
              {problem.acceptanceCriteria.map((crit, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{crit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-purple-400" />
              Required Deliverables
            </h2>
            <div className="space-y-2">
              {problem.targetDeliverables.map((d, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="font-mono text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded px-1.5 py-0.5 mt-0.5 flex-shrink-0">{i + 1}</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Reward Card */}
          <div className="rounded-xl border border-amber-800/40 bg-amber-950/10 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Research Reward</h3>
            <div>
              <div className="flex items-baseline gap-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <span className="text-2xl font-bold font-mono text-white">{problem.budgetCredits.toLocaleString()}</span>
                <span className="text-sm text-slate-400">Credits</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">≈ ${problem.bountyRewardsUSD?.toLocaleString()} USD cash equivalent</p>
            </div>
            <div className="border-t border-amber-800/30 pt-3 text-xs text-slate-400">
              Distributed upon Mentor verification and ledger block minting.
            </div>
          </div>

          {/* Sponsor Card */}
          <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sponsored by</h3>
            <p className="text-sm font-semibold text-white">{problem.sponsorOrg}</p>
            <p className="text-xs text-slate-400">{problem.sponsorName}</p>
          </div>

          {/* Action */}
          <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Get Started</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This problem is currently {problem.status === 'IN_ACTIVE_RESEARCH' ? 'in active research. You can join the project through an existing team.' : 'open for new proposals. Submit your approach to begin.'}
            </p>
            <Link
              href={`/student/research/${db.getProjects().find((p) => p.problemStatementId === problem.id)?.id || 'proj_1'}`}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition"
            >
              <span>Enter Research Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
