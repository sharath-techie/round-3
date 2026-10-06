'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSent(false);
    try {
      const { error: resetError } = await createSupabaseBrowserClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });
      if (resetError) throw new Error(resetError.message);
      setSent(true);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to send the password reset email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase text-teal-800">Account recovery</p>
        <h1 className="text-balance mt-2 text-2xl font-bold text-slate-950">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">We’ll send a password reset link to the email address on your account.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-xs font-semibold text-slate-700">Email
            <input className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
          {sent && <p className="text-sm text-emerald-700" role="status">If an account exists for that email, a reset link has been sent.</p>}
          <button className="w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy} type="submit">
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <Link href="/auth/login" className="mt-5 inline-block text-xs font-semibold text-teal-800 hover:underline">Back to sign in</Link>
      </section>
    </main>
  );
}
