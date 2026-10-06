'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface Verification {
  id: string;
  organization_id: string;
  document_path: string;
  submitted_at: string;
  organization: { name: string } | { name: string }[] | null;
}

export function OrganizationVerificationQueue({ verifications }: { verifications: Verification[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openDocument = async (verification: Verification) => {
    setBusyId(verification.id);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: urlError } = await supabase.storage
        .from('organization-verification')
        .createSignedUrl(verification.document_path, 60);
      if (urlError) throw new Error(`Private document could not be opened: ${urlError.message}`);
      setUrls((current) => ({ ...current, [verification.id]: data.signedUrl }));
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : 'Private document could not be opened.');
    } finally {
      setBusyId(null);
    }
  };

  const decide = async (verificationId: string, decision: 'APPROVED' | 'REJECTED') => {
    setBusyId(verificationId);
    setError(null);
    try {
      const response = await fetch(`/api/organization-verifications/${verificationId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes: notes[verificationId] ?? '' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Verification decision could not be recorded.');
      router.refresh();
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Verification decision could not be recorded.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
      {verifications.length === 0 ? <p className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-600">No pending organization verifications.</p> : (
        <ul className="space-y-4">
          {verifications.map((verification) => {
            const organization = Array.isArray(verification.organization) ? verification.organization[0] : verification.organization;
            return (
            <li className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={verification.id}>
              <div>
                <h2 className="text-base font-semibold text-slate-950">{organization?.name ?? verification.organization_id}</h2>
                <p className="mt-1 text-sm text-slate-500">Submitted {new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(verification.submitted_at))}</p>
              </div>
              {urls[verification.id] ? (
                <a className="text-sm font-medium text-teal-800 underline" href={urls[verification.id]} target="_blank" rel="noreferrer">Open private document (link expires in 60 seconds)</a>
              ) : (
                <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50" disabled={busyId === verification.id} onClick={() => void openDocument(verification)}>Open verification document</button>
              )}
              <label className="block text-sm font-medium text-slate-700">Review notes
                <textarea className="mt-1.5 block min-h-20 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" maxLength={4000} value={notes[verification.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [verification.id]: event.target.value }))} />
              </label>
              <div className="flex gap-2">
                <button className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-800 hover:bg-rose-50 disabled:opacity-50" disabled={busyId === verification.id} onClick={() => void decide(verification.id, 'REJECTED')}>Reject</button>
                <button className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50" disabled={busyId === verification.id} onClick={() => void decide(verification.id, 'APPROVED')}>Approve</button>
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
