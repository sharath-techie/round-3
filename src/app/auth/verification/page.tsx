'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

function VerificationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resend = async () => {
    if (!email) {
      setError('The signup email address is missing. Return to signup and try again.');
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const { error: resendError } = await createSupabaseBrowserClient().auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/onboarding` },
      });
      if (resendError) throw new Error(resendError.message);
      setMessage('A new confirmation email has been sent.');
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : 'Unable to resend the confirmation email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-9">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><MailCheck className="size-6" aria-hidden="true" /></span>
        <p className="mt-6 text-xs font-semibold uppercase text-teal-800">Email verification</p>
        <h1 className="text-balance mt-2 text-2xl font-bold text-slate-950">Check your inbox</h1>
        <p className="text-pretty mt-2 text-sm leading-6 text-slate-600">
          Follow the confirmation link sent to <span className="font-semibold text-slate-800">{email || 'your email address'}</span>. Once confirmed, you can sign in.
        </p>
        {error && <p className="mt-4 text-sm text-rose-700" role="alert">{error}</p>}
        {message && <p className="mt-4 text-sm text-emerald-700" role="status">{message}</p>}
        <button className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60" disabled={busy} onClick={() => void resend()} type="button">
          {busy ? 'Sending…' : 'Resend confirmation email'}
        </button>
        <Link href="/auth/login" className="mt-5 inline-block text-xs font-semibold text-teal-800 hover:underline">Return to sign in</Link>
      </section>
    </main>
  );
}

export default function VerificationPage() {
  return <Suspense fallback={<main className="min-h-dvh bg-slate-50" />}><VerificationContent /></Suspense>;
}
