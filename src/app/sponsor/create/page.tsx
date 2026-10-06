'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const domains = ['AI_SYSTEMS', 'BIOTECH', 'CLIMATE_ENERGY', 'QUANTUM_MATERIALS'] as const;

export default function SponsorCreateProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [objective, setObjective] = useState('');
  const [domain, setDomain] = useState<(typeof domains)[number]>('AI_SYSTEMS');
  const [sensitivity, setSensitivity] = useState('PUBLIC');
  const [aiAllowed, setAiAllowed] = useState(false);
  const [license, setLicense] = useState('');
  const [creditCap, setCreditCap] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsorOrganizationId: organizationId,
          title,
          objective,
          charter: {
            version: 1,
            domain,
            dataGovernance: {
              sensitivity,
              piiPermitted: false,
              externalExportPermitted: false,
            },
            aiPolicy: {
              assistanceAllowed: aiAllowed,
              requiresHumanReview: true,
              externalToolsPermitted: false,
            },
            intellectualProperty: { license: license || 'To be agreed before project activation' },
            creditPolicy: {
              requestedMaximum: creditCap ? Number(creditCap) : null,
              requiresHumanApproval: true,
              note: 'This is a proposed cap, not funded escrow or an award guarantee.',
            },
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Project creation failed.');
      if (!result.project?.id) throw new Error('Project creation returned no project identifier.');
      router.push(`/projects/${result.project.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Project creation failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-semibold text-white">Create a research project</h1>
        <p className="mt-1 text-sm text-slate-400">Projects require a verified sponsor organization. Charter terms are versioned and do not represent funded escrow.</p>
      </header>
      <form className="space-y-5 rounded-lg border border-slate-800 bg-slate-950 p-5" onSubmit={submit}>
        <label className="block text-sm text-slate-300">
          Verified sponsor organization ID
          <input className="mt-1.5 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" required pattern="[0-9a-fA-F-]{36}" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} />
          <span className="mt-1 block text-xs text-slate-500">The ID must belong to an approved organization where you are an owner or administrator.</span>
        </label>
        <label className="block text-sm text-slate-300">
          Project title
          <input className="mt-1.5 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="block text-sm text-slate-300">
          Research objective and acceptance criteria
          <textarea className="mt-1.5 min-h-36 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" required maxLength={8000} value={objective} onChange={(event) => setObjective(event.target.value)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">Domain
            <select className="mt-1.5 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" value={domain} onChange={(event) => setDomain(event.target.value as (typeof domains)[number])}>
              {domains.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block text-sm text-slate-300">Data sensitivity
            <select className="mt-1.5 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" value={sensitivity} onChange={(event) => setSensitivity(event.target.value)}>
              <option>PUBLIC</option><option>RESTRICTED</option><option>CONFIDENTIAL</option>
            </select>
          </label>
          <label className="block text-sm text-slate-300">Proposed credit cap (optional)
            <input className="mt-1.5 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" min="0" step="1" type="number" value={creditCap} onChange={(event) => setCreditCap(event.target.value)} />
          </label>
          <label className="block text-sm text-slate-300">Proposed IP license
            <input className="mt-1.5 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" maxLength={200} value={license} onChange={(event) => setLicense(event.target.value)} placeholder="Agree with the project team" />
          </label>
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-300">
          <input className="mt-1" type="checkbox" checked={aiAllowed} onChange={(event) => setAiAllowed(event.target.checked)} />
          Allow charter-scoped AI assistance, subject to a future configured AI runtime and human review.
        </label>
        {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}
        <button className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50" disabled={busy} type="submit">
          {busy ? 'Creating…' : 'Create project and charter v1'}
        </button>
      </form>
    </main>
  );
}
