'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

interface TaskOption {
  id: string;
  title: string;
}

export function ContributionSubmissionForm({
  projectId,
  tasks,
  isStudent,
}: {
  projectId: string;
  tasks: TaskOption[];
  isStudent: boolean;
}) {
  const router = useRouter();
  const [taskId, setTaskId] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [evidenceType, setEvidenceType] = useState('RESEARCH_FINDING');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [creditsRequested, setCreditsRequested] = useState('0');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch('/api/contributions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          taskId: taskId || null,
          title,
          summary,
          creditsRequested: Number(creditsRequested),
          evidenceItems: [{
            type: evidenceType,
            title: evidenceTitle,
            description: evidenceDescription,
          }],
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Contribution could not be submitted.');
      setMessage('Contribution and evidence metadata were submitted for human review.');
      setTitle('');
      setSummary('');
      setEvidenceTitle('');
      setEvidenceDescription('');
      setCreditsRequested('0');
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Contribution could not be submitted.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submit}>
      <div>
        <h2 className="text-base font-semibold text-slate-950">Submit a contribution</h2>
        <p className="text-pretty mt-1 text-sm leading-5 text-slate-600">Submission records are immutable. File uploads are not configured; provide reviewable evidence metadata and a human reviewer will assess it.</p>
      </div>
      {isStudent && (
        <label className="block text-sm font-medium text-slate-700">Assigned task
          <select className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" required value={taskId} onChange={(event) => setTaskId(event.target.value)}>
            <option value="">Select your assigned task</option>
            {tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
          </select>
        </label>
      )}
      <label className="block text-sm font-medium text-slate-700">Contribution title
        <input className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="block text-sm font-medium text-slate-700">Summary
        <textarea className="mt-1.5 min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" required maxLength={8000} value={summary} onChange={(event) => setSummary(event.target.value)} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">Evidence type
          <select className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value={evidenceType} onChange={(event) => setEvidenceType(event.target.value)}>
            {['RESEARCH_FINDING', 'EXPERIMENT', 'IMPLEMENTATION', 'DOCUMENTATION', 'DATASET', 'ANALYSIS', 'OTHER'].map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">Credits requested (not guaranteed)
          <input className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" type="number" min="0" step="1" required value={creditsRequested} onChange={(event) => setCreditsRequested(event.target.value)} />
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-700">Evidence title
        <input className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" required maxLength={200} value={evidenceTitle} onChange={(event) => setEvidenceTitle(event.target.value)} />
      </label>
      <label className="block text-sm font-medium text-slate-700">Evidence description
        <textarea className="mt-1.5 min-h-20 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" maxLength={4000} value={evidenceDescription} onChange={(event) => setEvidenceDescription(event.target.value)} />
      </label>
      {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
      {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
      <button className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50" disabled={busy || (isStudent && tasks.length === 0)} type="submit">
        {busy ? 'Submitting…' : 'Submit for review'}
      </button>
    </form>
  );
}
