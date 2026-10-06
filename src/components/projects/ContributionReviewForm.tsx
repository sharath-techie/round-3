'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type ReviewDecision = 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT';

export function ContributionReviewForm({
  contributionId,
  creditsRequested,
}: {
  contributionId: string;
  creditsRequested: number;
}) {
  const router = useRouter();
  const [decision, setDecision] = useState<ReviewDecision>('REQUEST_CHANGES');
  const [methodologyScore, setMethodologyScore] = useState(5);
  const [reproducibilityScore, setReproducibilityScore] = useState(5);
  const [creditsAwarded, setCreditsAwarded] = useState('');
  const [charterCompliance, setCharterCompliance] = useState(false);
  const [comments, setComments] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributionId,
          decision,
          methodologyScore,
          reproducibilityScore,
          charterCompliance,
          comments,
          ...(decision === 'APPROVE' ? { creditsAwarded: Number(creditsAwarded) } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Review could not be recorded.');
      setMessage('Review recorded. Any approved award was recorded through the project review transaction.');
      router.refresh();
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Review could not be recorded.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="mt-4 space-y-3 border-t border-slate-200 pt-4" onSubmit={submit}>
      <h3 className="text-xs font-semibold uppercase text-slate-700">Human review</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">Decision
          <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900" value={decision} onChange={(event) => setDecision(event.target.value as ReviewDecision)}>
            <option value="REQUEST_CHANGES">Request changes</option>
            <option value="REJECT">Reject</option>
            <option value="APPROVE">Approve</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Methodology (1-10)
          <input className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900" type="number" min="1" max="10" required value={methodologyScore} onChange={(event) => setMethodologyScore(Number(event.target.value))} />
        </label>
        <label className="text-sm font-medium text-slate-700">Reproducibility (1-10)
          <input className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900" type="number" min="1" max="10" required value={reproducibilityScore} onChange={(event) => setReproducibilityScore(Number(event.target.value))} />
        </label>
      </div>
      {decision === 'APPROVE' && (
        <label className="block text-sm font-medium text-slate-700">Credits to award (0–{creditsRequested})
          <input className="mt-1 block w-full max-w-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900" type="number" min="0" max={creditsRequested} step="1" required value={creditsAwarded} onChange={(event) => setCreditsAwarded(event.target.value)} />
        </label>
      )}
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={charterCompliance} onChange={(event) => setCharterCompliance(event.target.checked)} />
        I reviewed the applicable charter and this contribution complies.
      </label>
      <label className="block text-sm font-medium text-slate-700">Review comments
        <textarea className="mt-1 block min-h-20 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900" maxLength={8000} required value={comments} onChange={(event) => setComments(event.target.value)} />
      </label>
      {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
      {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
      <button className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50" type="submit" disabled={busy}>
        {busy ? 'Saving review…' : 'Record review'}
      </button>
    </form>
  );
}
