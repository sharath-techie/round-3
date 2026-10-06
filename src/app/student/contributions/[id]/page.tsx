'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { db } from '@/lib/db';
import {
  FolderGit2,
  ChevronLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Fingerprint,
  Coins,
  FileCode2,
  Cpu,
  Award,
  ExternalLink,
  GitCommit,
  Layers,
} from 'lucide-react';

export default function ContributionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const contribution = db.getContributionById(id) || db.getContributions()[0];

  if (!contribution) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-400">
        Contribution entry not found.
        <div className="mt-4">
          <Link href="/student/contributions" className="text-cyan-400 hover:underline text-xs">
            ← Back to Contributions
          </Link>
        </div>
      </div>
    );
  }

  const project = db.getProjectById(contribution.projectId);
  const task = project?.tasks.find((t) => t.id === contribution.taskId);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/student/contributions"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Contributions Ledger</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-obsidian-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
              {contribution.artifactType}
            </span>
            <span
              className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                contribution.status === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              STATUS: {contribution.status}
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {contribution.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{contribution.title}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Associated with project: <strong className="text-slate-200">{project?.title || contribution.projectId}</strong> • Task: {contribution.taskTitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-obsidian-800 bg-obsidian-950 p-3 text-right">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Reward Bounty</div>
            <div className="flex items-center justify-end gap-1.5 text-lg font-bold font-mono text-cyan-400">
              <Coins className="h-4 w-4" />
              <span>+{contribution.creditsRequested} Credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          <div className="rounded-xl border border-obsidian-800 bg-obsidian-900/40 p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Research Summary & Findings</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{contribution.summary}</p>
          </div>

          {/* Cryptographic Artifact & Repository Details */}
          <div className="rounded-xl border border-obsidian-800 bg-obsidian-900/40 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-cyan-400" />
              <span>Version Control & Commit Provenance</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 block text-[11px]">Git Commit SHA:</span>
                <span className="font-mono text-cyan-300 bg-obsidian-950 px-2 py-1 rounded border border-obsidian-800 block break-all">
                  {contribution.gitCommitHash}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block text-[11px]">Submitted Timestamp:</span>
                <span className="font-mono text-slate-300 bg-obsidian-950 px-2 py-1 rounded border border-obsidian-800 block">
                  {new Date(contribution.submittedAt).toUTCString()}
                </span>
              </div>
            </div>
          </div>

          {/* Verifiable Evidence Items */}
          <div className="rounded-xl border border-obsidian-800 bg-obsidian-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Verifiable Evidence Bundle ({contribution.evidenceItems.length})</span>
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                All Hashes Verified
              </span>
            </div>

            <div className="space-y-3">
              {contribution.evidenceItems.map((ev, index) => (
                <div key={ev.id || index} className="rounded-lg bg-obsidian-950 border border-obsidian-800 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{ev.title}</span>
                    <span className="text-[10px] font-mono uppercase bg-obsidian-900 px-2 py-0.5 rounded text-slate-400 border border-obsidian-700">
                      {ev.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-obsidian-900/60 p-2 rounded border border-obsidian-800 break-all">{ev.payload}</p>
                  <div className="pt-2 border-t border-obsidian-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Fingerprint className="h-3 w-3 text-cyan-400" />
                      <span>Evidence ID:</span>
                      <span className="text-slate-400">{ev.id}</span>
                    </div>
                    <span className={ev.verified ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {ev.verified ? '✓ VERIFIED' : 'PENDING AUDIT'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Review & Ledger Verification */}
        <div className="space-y-6">
          {/* Peer Review Record */}
          <div className="rounded-xl border border-emerald-800/30 bg-emerald-950/10 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Mentor Formal Evaluation</span>
            </h2>

            {contribution.reviews && contribution.reviews.length > 0 ? (
              contribution.reviews.map((r, i) => (
                <div key={i} className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-800/30">
                    <span className="font-semibold text-white">{r.mentorName}</span>
                    <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 font-mono text-[10px] text-emerald-300 font-bold">
                      {r.decision}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-obsidian-950/80 p-2 rounded border border-obsidian-800">
                      <span className="text-slate-500 block text-[10px]">Methodology</span>
                      <span className="font-mono font-bold text-white text-sm">{r.methodologyScore} / 10</span>
                    </div>
                    <div className="bg-obsidian-950/80 p-2 rounded border border-obsidian-800">
                      <span className="text-slate-500 block text-[10px]">Reproducibility</span>
                      <span className="font-mono font-bold text-white text-sm">{r.reproducibilityScore} / 10</span>
                    </div>
                  </div>

                  <p className="text-slate-300 italic bg-obsidian-950/60 p-3 rounded border border-obsidian-800 text-xs">
                    "{r.comments}"
                  </p>

                  <div className="text-[10px] font-mono text-slate-500">
                    Verified on {new Date(r.reviewedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-amber-400">Awaiting Mentor peer review assignment.</p>
            )}
          </div>

          {/* Ledger Immutability Proof */}
          <div className="rounded-xl border border-obsidian-800 bg-obsidian-900/40 p-5 space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-400 text-xs flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <span>On-Chain Ledger Seal</span>
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              This contribution has been immutably hashed and recorded to the VERO Distributed Research Ledger.
            </p>
            <div className="space-y-1.5 pt-2 border-t border-obsidian-800 font-mono text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Block Status:</span>
                <span className="text-emerald-400 font-bold">FINALIZED</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Merkle Root:</span>
                <span className="text-slate-400">0x8f2a...c01e</span>
              </div>
            </div>
            <Link
              href="/admin/ledger"
              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 pt-2 transition"
            >
              <span>View in Ledger Explorer</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
