'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  FileQuestion,
  Coins,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Search,
  Filter,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function StudentProblemsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const problems = db.problemStatements;

  const domains = ['ALL', 'BIOTECH', 'QUANTUM_SECURITY', 'AUTONOMOUS_SYSTEMS', 'CLIMATE_AI', 'MED_IMAGING'];

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sponsorOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDomain = selectedDomain === 'ALL' || p.domain === selectedDomain;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesDomain && matchesStatus;
  });

  const domainColors: Record<string, { badge: string; text: string }> = {
    BIOTECH: { badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300', text: 'Biotechnology' },
    QUANTUM_SECURITY: { badge: 'bg-purple-500/10 border-purple-500/20 text-purple-300', text: 'Quantum Cryptography' },
    AUTONOMOUS_SYSTEMS: { badge: 'bg-blue-500/10 border-blue-500/20 text-blue-300', text: 'Autonomous Systems' },
    CLIMATE_AI: { badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300', text: 'Climate AI' },
    MED_IMAGING: { badge: 'bg-rose-500/10 border-rose-500/20 text-rose-300', text: 'Medical Imaging' },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-obsidian-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-mono text-cyan-400 font-semibold mb-2">
            RESEARCH OPPORTUNITIES
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileQuestion className="h-7 w-7 text-cyan-400" />
            <span>Industrial & Academic Problem Statements</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Underwritten by industrial sponsors, governed by Project Charters, with guaranteed milestone escrow disbursement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-hairline bg-obsidian-900/80 px-4 py-2 text-right">
            <span className="text-[10px] text-slate-500 block font-mono uppercase">Total Available Bounties</span>
            <span className="text-lg font-bold font-mono text-amber-400">150,000 Credits</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by keywords, algorithms, or sponsor organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-hairline bg-obsidian-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-hairline bg-obsidian-900/90 px-3.5 py-2.5 text-xs text-slate-300 outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_ACTIVE_RESEARCH">In Active Research</option>
            <option value="OPEN_FOR_PROPOSALS">Open for Proposals</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-slate-500 mr-2 flex items-center gap-1 flex-shrink-0">
            <Filter className="h-3 w-3" />
            <span>Domain:</span>
          </span>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-150 border ${
                selectedDomain === dom
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold'
                  : 'bg-obsidian-900/70 border-hairline text-slate-400 hover:text-white hover:bg-obsidian-850'
              }`}
            >
              {dom === 'ALL' ? 'All Domains' : dom.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Cards Grid */}
      {filteredProblems.length === 0 ? (
        <div className="rounded-2xl border border-obsidian-800 bg-obsidian-900/40 p-12 text-center space-y-3">
          <FileQuestion className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-medium">No problem statements match your criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDomain('ALL');
              setStatusFilter('ALL');
            }}
            className="text-xs text-cyan-400 hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProblems.map((problem) => {
            const domainMeta = domainColors[problem.domain] || {
              badge: 'bg-slate-500/10 border-slate-500/20 text-slate-300',
              text: problem.domain,
            };

            return (
              <div
                key={problem.id}
                className="group flex flex-col justify-between rounded-2xl border border-hairline bg-obsidian-900/70 p-6 hover:border-slate-600/80 hover:bg-obsidian-850 transition-all duration-200 shadow-lg space-y-5"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-bold ${domainMeta.badge}`}>
                        {problem.domain}
                      </span>
                      <span className="rounded bg-obsidian-950 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-obsidian-800">
                        {problem.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      <Coins className="h-3.5 w-3.5" />
                      <span>{problem.budgetCredits.toLocaleString()} Credits</span>
                    </div>
                  </div>

                  {/* Title & Sponsor */}
                  <div>
                    <Link href={`/student/problems/${problem.id}`} className="group-hover:text-cyan-300 transition-colors">
                      <h2 className="text-lg font-bold text-white leading-snug">
                        {problem.title}
                      </h2>
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                      <Building2 className="h-3.5 w-3.5 text-slate-500" />
                      <span className="font-medium text-slate-300">{problem.sponsorOrg}</span>
                      <span className="text-slate-600">•</span>
                      <span>Bounty: ${problem.bountyRewardsUSD?.toLocaleString()} USD</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {problem.summary}
                  </p>

                  {/* Acceptance Criteria Snapshot */}
                  <div className="rounded-xl bg-obsidian-950/80 p-3.5 border border-obsidian-800/80 text-[11px] space-y-2">
                    <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] font-mono">
                      Target Acceptance Criteria:
                    </span>
                    <div className="space-y-1.5">
                      {problem.acceptanceCriteria.slice(0, 2).map((crit, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{crit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-obsidian-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-500">
                    Deliverables: {problem.targetDeliverables.length} Items
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/student/problems/${problem.id}`}
                      className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-obsidian-950 transition shadow-md shadow-cyan-950"
                    >
                      <span>Inspect Problem</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
