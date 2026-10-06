'use client';

import { FormEvent, useState } from 'react';

const agents = [
  'RESEARCH_AGENT',
  'ANALYSIS_AGENT',
  'IMPLEMENTATION_AGENT',
  'INTEGRITY_AGENT',
  'CONTRIBUTION_AGENT',
  'REPORTING_AGENT',
] as const;

export function AgentInvocationForm({ projectId }: { projectId: string }) {
  const [agentType, setAgentType] = useState<(typeof agents)[number]>('RESEARCH_AGENT');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/mesh/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, agentType, prompt }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'AI request failed.');
      setResult(JSON.stringify(body, null, 2));
    } catch (invokeError) {
      setError(invokeError instanceof Error ? invokeError.message : 'AI request failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submit}>
      <h2 className="text-base font-semibold text-slate-950">Project-scoped AI assistance</h2>
      <p className="text-pretty text-sm leading-6 text-slate-600">Requests are checked against the current project charter. A configured AI runtime is required before prompts can be dispatched.</p>
      <label className="block text-sm font-medium text-slate-700">
        Agent
        <select className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value={agentType} onChange={(event) => setAgentType(event.target.value as (typeof agents)[number])}>
          {agents.map((agent) => <option key={agent}>{agent}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Research request
        <textarea className="mt-1.5 min-h-32 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" required maxLength={24000} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
      </label>
      {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
      {result && <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs text-slate-700">{result}</pre>}
      <button className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50" type="submit" disabled={busy}>
        {busy ? 'Checking charter…' : 'Submit to project AI gateway'}
      </button>
    </form>
  );
}
