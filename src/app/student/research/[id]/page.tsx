'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { db } from '@/lib/db';
import { ResearchWorkspace } from '@/components/research/ResearchWorkspace';
import { ChevronLeft } from 'lucide-react';

export default function StudentResearchProjectWorkspacePage() {
  const params = useParams();
  const id = params?.id as string;

  // Find project by ID, or check if id matches a problemStatementId
  let project = db.getProjectById(id);
  if (!project) {
    project = db.projects.find((p) => p.problemStatementId === id);
  }

  // Fallback to first project if not found
  if (!project) {
    project = db.projects[0];
  }

  const charter = db.getCharterByProjectId(project.id) || db.charters[0];

  return (
    <div>
      <div className="border-b border-obsidian-800 bg-obsidian-950/70 px-4 py-2 text-xs">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link
            href="/student/problems"
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Back to Problem Statements</span>
          </Link>
          <span className="font-mono text-[11px] text-slate-400">
            Active Workspace: <strong className="text-white">{project.title}</strong>
          </span>
        </div>
      </div>
      <ResearchWorkspace project={project} charter={charter} />
    </div>
  );
}
