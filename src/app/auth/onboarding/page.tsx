'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { currentRole, currentUser, loading, error } = useRole();

  if (loading) return <main className="flex min-h-dvh items-center justify-center bg-slate-50 text-sm text-slate-600">Loading your account…</main>;
  if (error) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-5">
        <section className="max-w-md rounded-2xl border border-rose-200 bg-white p-7">
          <h1 className="text-lg font-semibold text-slate-950">Account setup could not be completed</h1>
          <p className="mt-2 text-sm text-rose-700" role="alert">{error}</p>
          <Link href="/auth/login" className="mt-5 inline-block text-sm font-semibold text-teal-800">Return to sign in</Link>
        </section>
      </main>
    );
  }
  if (!currentUser.id) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-5">
        <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-7">
          <h1 className="text-lg font-semibold text-slate-950">Sign in to continue</h1>
          <p className="mt-2 text-sm text-slate-600">Your account must be authenticated before workspace setup.</p>
          <Link href="/auth/login" className="mt-5 inline-block text-sm font-semibold text-teal-800">Sign in</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase text-teal-800">Workspace setup</p>
        <h1 className="text-balance mt-2 text-3xl font-bold text-slate-950">Your account is ready, {currentUser.name}</h1>
        <p className="text-pretty mt-3 text-sm leading-6 text-slate-600">Your current platform role is <strong>{currentRole}</strong>. Roles and administrative access are assigned securely by platform administrators.</p>
        <button
          className="mt-6 rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          onClick={() => router.replace(`/${currentRole.toLowerCase()}/dashboard`)}
          type="button"
        >
          Open my workspace
        </button>
      </section>
    </main>
  );
}
