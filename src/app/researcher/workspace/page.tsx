'use client';

import React from 'react';
import { db } from '@/lib/db';
import { ResearchWorkspace } from '@/components/research/ResearchWorkspace';

export default function ResearcherWorkspacePage() {
  const project = db.getProjectById('proj_1') || db.projects[0];
  const charter = db.getCharterByProjectId(project.id) || db.charters[0];

  return <ResearchWorkspace project={project} charter={charter} />;
}
