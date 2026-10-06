'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Project, ProjectCharter } from '@/types';

export function ResearchWorkspace({ project: _project, charter: _charter }: { project: Project; charter: ProjectCharter }) {
  const router = useRouter();
  useEffect(() => {
    router.replace('/projects');
  }, [router]);
  return <p className="px-6 py-10 text-sm text-slate-400">Opening the canonical project workspace…</p>;
}
