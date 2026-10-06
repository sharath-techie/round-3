'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const { error: updateError } = await createSupabaseBrowserClient().auth.updateUser({ password });
      if (updateError) throw new Error(updateError.message);
      router.replace('/student/dashboard');
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update your password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase text-teal-800">Account recovery</p>
        <h1 className="text-balance mt-2 text-2xl font-bold text-slate-950">Choose a new password</h1>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-xs font-semibold text-slate-700">New password
            <input className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Confirm new password
            <input className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </label>
          {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
          <button className="w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy} type="submit">
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>
    </main>
  );
}
