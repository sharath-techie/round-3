'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRole } from '@/context/RoleContext';

export default function StudentProfilePage() {
  const { currentUser, loading, error: loadError, saveProfile } = useRole();
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [bio, setBio] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(currentUser.name);
    setInstitution(currentUser.institution);
    setBio(currentUser.bio);
  }, [currentUser.name, currentUser.institution, currentUser.bio]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await saveProfile({
        full_name: name.trim(),
        institution: institution.trim() || null,
        bio: bio.trim() || null,
      });
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Your profile could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-slate-400">Loading account profile…</main>;
  if (loadError) return <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-rose-700" role="alert">{loadError}</main>;
  if (!currentUser.id) return <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-slate-600">Sign in to view your profile.</main>;

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-slate-950">Account profile</h1>
        <p className="mt-1 text-sm text-slate-600">Update the profile details associated with your account.</p>
      </header>
      <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submit}>
        <p className="text-sm text-slate-600">Email: <span className="font-medium text-slate-900">{currentUser.email}</span></p>
        <p className="text-sm text-slate-600">Platform role: <span className="font-medium text-slate-900">{currentUser.role}</span></p>
        <label className="block text-sm font-medium text-slate-700">Full name
          <input className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="block text-sm font-medium text-slate-700">Institution
          <input className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" maxLength={200} value={institution} onChange={(event) => setInstitution(event.target.value)} />
        </label>
        <label className="block text-sm font-medium text-slate-700">About
          <textarea className="mt-1.5 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" maxLength={2000} value={bio} onChange={(event) => setBio(event.target.value)} />
        </label>
        {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
        {saved && <p className="text-sm text-emerald-700" role="status">Profile saved.</p>}
        <button className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" disabled={busy} type="submit">
          {busy ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </main>
  );
}
