'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { UserRole } from '@/types';

interface Opportunity {
  task_id: string;
  task_title: string;
  task_description: string;
  required_skills: string[];
}

const resources = [
  { key: 'overview', label: 'Project overview' },
  { key: 'charter', label: 'Charter' },
  { key: 'research', label: 'Research materials' },
  { key: 'team', label: 'Team' },
  { key: 'ai-workspace', label: 'AI workspace' },
  { key: 'contributions', label: 'Contributions' },
  { key: 'activity', label: 'Activity' },
];

export function AccessRequestForm({ projectId, role }: { projectId: string; role: UserRole }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [taskId, setTaskId] = useState('');
  const [resourceKey, setResourceKey] = useState(role === 'RESEARCHER' ? 'research' : 'overview');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isStudent = role === 'STUDENT';

  useEffect(() => {
    if (!isStudent) return;
    const loadOpportunities = async () => {
      try {
        const response = await fetch(`/api/open-task-opportunities?projectId=${encodeURIComponent(projectId)}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? 'Unable to load open tasks.');
        setOpportunities(result.opportunities ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load open tasks.');
      }
    };
    void loadOpportunities();
  }, [isStudent, projectId]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (isStudent && !taskId) throw new Error('Select an open task before applying.');
      const response = await fetch(`/api/projects/${projectId}/access-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceKey: isStudent ? `application:${taskId}` : resourceKey,
          reason,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Access request failed.');
      setMessage('Your request was recorded for human review.');
      setReason('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Access request failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submit}>
      <h2 className="text-base font-semibold text-slate-950">{isStudent ? 'Apply for an open task' : 'Request project access'}</h2>
      {isStudent ? (
        <label className="block text-sm font-medium text-slate-700">
          Open project task
          <select className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" required value={taskId} onChange={(event) => setTaskId(event.target.value)}>
            <option value="">Select a task</option>
            {opportunities.map((opportunity) => (
              <option key={opportunity.task_id} value={opportunity.task_id}>
                {opportunity.task_title}
              </option>
            ))}
          </select>
          {opportunities.length === 0 && <span className="mt-1 block text-slate-500">No open tasks are available for this project.</span>}
        </label>
      ) : (
        <label className="block text-sm font-medium text-slate-700">
          Requested resource
          <select className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value={resourceKey} onChange={(event) => setResourceKey(event.target.value)}>
            {resources
              .filter((resource) => role !== 'RESEARCHER' || resource.key === 'research')
              .map((resource) => <option key={resource.key} value={resource.key}>{resource.label}</option>)}
          </select>
        </label>
      )}
      <label className="block text-sm font-medium text-slate-700">
        Reason
        <textarea className="mt-1.5 min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" required maxLength={4000} value={reason} onChange={(event) => setReason(event.target.value)} />
      </label>
      {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
      {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
      <button className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50" type="submit" disabled={busy || (isStudent && opportunities.length === 0)}>
        {busy ? 'Submitting…' : 'Submit request'}
      </button>
    </form>
  );
}
