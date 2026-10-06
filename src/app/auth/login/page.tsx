'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Microscope } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('error') === 'confirmation_failed') {
      setError('That confirmation link is invalid or expired. Sign in again or request a new confirmation email.');
    }
  }, []);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error: signInError } = await createSupabaseBrowserClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw new Error(signInError.message);
      router.replace('/student/dashboard');
      router.refresh();
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.85fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-teal-400 font-extrabold text-slate-950">G</span><span className="text-sm font-bold tracking-wide">GARDENIA</span></Link>
        <div className="relative z-10 max-w-lg">
          <span className="flex size-12 items-center justify-center rounded-xl bg-slate-800 text-teal-300"><Microscope className="size-6" aria-hidden="true" /></span>
          <h1 className="text-balance mt-6 text-4xl font-bold leading-tight">Great research grows through collaboration.</h1>
          <p className="text-pretty mt-4 max-w-md text-sm leading-6 text-slate-300">Connect sponsors, researchers, mentors, and contributors around meaningful projects and shared evidence.</p>
        </div>
        <p className="text-xs text-slate-500">Secure research collaboration workspace</p>
        <div className="absolute bottom-0 right-0 size-80 translate-x-1/3 translate-y-1/3 rounded-full border border-slate-800" aria-hidden="true" />
      </aside>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Link href="/" className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-teal-700 font-extrabold text-white">G</span><span className="text-sm font-bold tracking-wide text-slate-900">GARDENIA</span></Link></div>
          <p className="text-xs font-semibold uppercase text-teal-800">Welcome to Gardenia</p>
          <h2 className="text-balance mt-2 text-3xl font-bold text-slate-950">Sign in to your workspace</h2>
          <p className="text-pretty mt-2 text-sm text-slate-600">Use your Gardenia account credentials to continue.</p>
          <form className="mt-7 space-y-4" onSubmit={signIn}>
            <label className="block text-xs font-semibold text-slate-700">Email
              <input className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="block text-xs font-semibold text-slate-700">Password
              <input className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60" disabled={busy} type="submit">
              {busy ? 'Signing in…' : 'Sign in'} <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </form>
          <p className="mt-4 text-right text-xs"><Link className="font-semibold text-teal-800 hover:underline" href="/auth/forgot-password">Forgot password?</Link></p>
          <p className="mt-6 text-center text-xs text-slate-600">New to Gardenia? <Link className="font-semibold text-teal-800 hover:underline" href="/auth/signup">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}
