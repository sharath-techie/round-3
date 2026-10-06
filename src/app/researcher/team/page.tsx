'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Users, Plus, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { Task } from '@/types';

export default function ResearcherTeamPage() {
  const project = db.projects[0];
  const [tasks, setTasks] = useState<Task[]>(project.tasks);
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [assignedTo, setAssignedTo] = useState('user_student_1');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [evidenceType, setEvidenceType] = useState<'METRIC_LOG' | 'EXPERIMENT_RUN' | 'PROVENANCE_HASH' | 'REPRODUCIBILITY_NOTEBOOK'>('EXPERIMENT_RUN');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const task: Task = {
      id: `task_${Date.now()}`,
      projectId: project.id,
      milestoneId: project.milestones[0].id,
      title: newTaskTitle,
      description: newTaskDesc,
      assignedToUserId: assignedTo,
      assignedToName: db.getUserById(assignedTo)?.name,
      status: 'TODO',
      priority,
      requiredEvidenceType: evidenceType,
      dueDate: '2026-11-05',
    };

    project.tasks.unshift(task);
    setTasks([...project.tasks]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowModal(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-obsidian-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-blue-400" />
            Team Management & Task Delegation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Delegate sprint tasks under Charter Alpha to junior contributors and track required evidence.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
        >
          <Plus className="h-4 w-4" />
          <span>Delegate New Task</span>
        </button>
      </div>

      {/* Task Delegation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-obsidian-700 bg-obsidian-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <h3 className="text-sm font-bold text-white">Delegate Research Task</h3>
              <button onClick={() => setShowModal(false)} className="text-xs text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Task Title:</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement dihedral angle feature extraction"
                  className="w-full rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Methodological Instructions:</label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Specific requirements for the junior contributor..."
                  className="w-full rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Assign Contributor:</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-2 text-white"
                  >
                    <option value="user_student_1">Alex Rivera (Junior ML)</option>
                    <option value="user_researcher_1">Dr. Elena Rostova (PI)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Priority:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-2 text-white"
                  >
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mandatory Verifiable Evidence:</label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value as any)}
                  className="w-full rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-2 text-white"
                >
                  <option value="EXPERIMENT_RUN">EXPERIMENT_RUN (Telemetry & loss curves)</option>
                  <option value="METRIC_LOG">METRIC_LOG (Unit test invariance matrix)</option>
                  <option value="PROVENANCE_HASH">PROVENANCE_HASH (AI Mesh audit trace)</option>
                  <option value="REPRODUCIBILITY_NOTEBOOK">REPRODUCIBILITY_NOTEBOOK (Jupyter sandbox)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-obsidian-700 px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-1.5 font-bold text-white"
                >
                  Create & Delegate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-mono ${
                      task.priority === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {task.priority} PRIORITY
                  </span>
                  <span className="text-xs text-slate-400">Assigned: {task.assignedToName || 'Unassigned'}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{task.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{task.description}</p>
              </div>

              <span className="rounded bg-obsidian-950 border border-obsidian-800 px-2.5 py-1 text-xs font-mono text-cyan-300">
                {task.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-obsidian-800">
              <span>Required Evidence: <strong className="text-cyan-400 font-mono">{task.requiredEvidenceType}</strong></span>
              <span className="font-mono text-[11px] text-slate-500">Due: {task.dueDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
