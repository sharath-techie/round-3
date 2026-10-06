'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRole } from '@/context/RoleContext';

interface OrganizationVerification {
  id: string;
  status: string;
  review_notes: string | null;
  submitted_at: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  verification_status: string;
  organization_verifications: OrganizationVerification[];
}

export function OrganizationManager({ organizations }: { organizations: Organization[] }) {
  const router = useRouter();
  const { currentUser } = useRole();
  const [name, setName] = useState('');
  const [type, setType] = useState('COMPANY');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [country, setCountry] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedOrganization && organizations[0]) setSelectedOrganization(organizations[0].id);
  }, [organizations, selectedOrganization]);

  const createOrganization = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, registrationNumber, country }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Organization could not be created.');
      setMessage('Organization created with pending verification status.');
      setName('');
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Organization could not be created.');
    } finally {
      setBusy(false);
    }
  };

  const updateFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const submitVerification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (!currentUser) throw new Error('Sign in before submitting organization verification.');
      if (!file) throw new Error('Choose a PDF, PNG, or JPEG verification document.');
      if (file.size > 10 * 1024 * 1024) throw new Error('Verification documents must be 10 MB or smaller.');

      const supabase = createSupabaseBrowserClient();
      const extension = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : file.type === 'image/jpeg' ? 'jpg' : null;
      if (!extension) throw new Error('Only PDF, PNG, and JPEG verification documents are accepted.');
      const documentPath = `${selectedOrganization}/${currentUser.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from('organization-verification')
        .upload(documentPath, file, { contentType: file.type, upsert: false });
      if (uploadError) throw new Error(`Private document upload failed: ${uploadError.message}`);

      const response = await fetch(`/api/organizations/${selectedOrganization}/verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentPath }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Verification submission failed.');
      setMessage('Verification document submitted privately for administrator review.');
      setFile(null);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Verification submission failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form className="space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-5" onSubmit={createOrganization}>
        <div>
          <h2 className="text-sm font-semibold text-white">Register an organization</h2>
          <p className="mt-1 text-xs text-slate-500">New organizations remain pending until an administrator verifies them.</p>
        </div>
        <label className="block text-xs text-slate-300">Organization name
          <input className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" required maxLength={200} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="block text-xs text-slate-300">Organization type
          <select className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="COMPANY">Company</option><option value="ACADEMIC">Academic</option><option value="FOUNDATION">Foundation</option>
          </select>
        </label>
        <label className="block text-xs text-slate-300">Registration number (optional)
          <input className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" maxLength={200} value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value)} />
        </label>
        <label className="block text-xs text-slate-300">Country (optional)
          <input className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" maxLength={100} value={country} onChange={(event) => setCountry(event.target.value)} />
        </label>
        <button className="rounded bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50" disabled={busy} type="submit">Register organization</button>
      </form>

      <form className="space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-5" onSubmit={submitVerification}>
        <div>
          <h2 className="text-sm font-semibold text-white">Submit verification</h2>
          <p className="mt-1 text-xs text-slate-500">Documents are stored in a private Supabase Storage bucket, accessible only to organization owners and administrators.</p>
        </div>
        <label className="block text-xs text-slate-300">Organization
          <select className="mt-1 block w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" required value={selectedOrganization} onChange={(event) => setSelectedOrganization(event.target.value)}>
            <option value="">Select organization</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id} disabled={organization.verification_status === 'APPROVED'}>
                {organization.name} — {organization.verification_status}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-slate-300">Verification document
          <input className="mt-1 block w-full text-sm text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:text-white" accept="application/pdf,image/jpeg,image/png" required type="file" onChange={updateFile} />
        </label>
        <button className="rounded bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50" disabled={busy || organizations.every((organization) => organization.verification_status === 'APPROVED')} type="submit">Submit for review</button>
      </form>

      {error && <p className="text-sm text-rose-300 lg:col-span-2" role="alert">{error}</p>}
      {message && <p className="text-sm text-emerald-300 lg:col-span-2" role="status">{message}</p>}

      <section className="space-y-3 lg:col-span-2">
        <h2 className="text-sm font-semibold text-white">Your organizations</h2>
        {organizations.length === 0 ? <p className="text-sm text-slate-400">No organizations registered yet.</p> : (
          <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-950">
            {organizations.map((organization) => (
              <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" key={organization.id}>
                <div><p className="text-sm text-white">{organization.name}</p><p className="text-xs text-slate-500">{organization.type} · {organization.id}</p></div>
                <div className="text-right text-xs text-slate-400">
                  <p>Organization: {organization.verification_status}</p>
                  <p>Submission: {organization.organization_verifications[0]?.status ?? 'Not submitted'}</p>
                  {organization.organization_verifications[0]?.review_notes && <p className="mt-1 text-amber-300">{organization.organization_verifications[0].review_notes}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
