'use client';

import React from 'react';
import { db } from '@/lib/db';
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';

export default function AdminChartersPage() {
  const charters = db.charters;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-obsidian-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <ShieldCheck className="h-6 w-6 text-amber-400" />
          Project Charter Governance Registry
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          First-class project governance contracts that act as primary policy boundary for all human and AI actions.
        </p>
      </div>

      <div className="space-y-6">
        {charters.map((charter) => (
          <div key={charter.id} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                    CHARTER v{charter.version}
                  </span>
                  <span className="text-xs text-slate-400">Project ID: {charter.projectId}</span>
                </div>
                <h2 className="text-lg font-bold text-white">{charter.title}</h2>
              </div>
              <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-mono text-emerald-400">
                ACTIVE CONTRACT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-obsidian-950 p-4 rounded-lg border border-obsidian-800 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Human Permissions</span>
                <div className="text-slate-300">Roles: [{charter.humanPermissions.allowedRoles.join(', ')}]</div>
                <div className="text-slate-300">Max Contributors: {charter.humanPermissions.maxContributors}</div>
                <div className="text-slate-300">Required Reviewers: {charter.humanPermissions.requiredReviewers}</div>
              </div>

              <div className="bg-obsidian-950 p-4 rounded-lg border border-obsidian-800 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">AI & Tool Permissions</span>
                <div className="text-slate-300">Compute Budget: {charter.aiPermissions.computeBudgetHours} hrs</div>
                <div className="text-slate-300">Allowed Agents: {charter.agentPermissions.allowedAgents.length}</div>
                <div className="text-rose-400">Banned Tools: [{charter.toolPermissions.bannedTools.join(', ')}]</div>
              </div>

              <div className="bg-obsidian-950 p-4 rounded-lg border border-obsidian-800 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Data & Verification</span>
                <div className="text-amber-400 font-mono">Sensitivity: {charter.dataPermissions.sensitivityLevel}</div>
                <div className="text-slate-300">Min Evidence: {charter.contributionRules.minEvidenceRequired.join(', ')}</div>
                <div className="text-slate-300">License: {charter.ipAndRewards.license}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
