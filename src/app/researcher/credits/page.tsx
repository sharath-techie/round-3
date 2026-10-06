import Link from 'next/link';
import { requireAuthenticatedActor, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ResearcherCreditsPage() {
  const { supabase, actor } = await requireAuthenticatedActor();
  requireRole(actor, ['RESEARCHER']);
  const { data: entries, error } = await supabase
    .from('credit_ledger')
    .select('id, project_id, amount, reason, created_at')
    .eq('user_id', actor.id)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Credit history could not be loaded: ${error.message}`);

  const rows = entries ?? [];
  const total = rows.reduce((sum, entry) => sum + entry.amount, 0);
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-semibold text-white">Approved contribution credits</h1>
        <p className="mt-1 text-sm text-slate-400">Credits appear only after an authorized human reviewer approves an award.</p>
      </header>
      <p className="rounded-lg border border-slate-800 bg-slate-950 p-5 text-lg text-cyan-200">Recorded total: {total.toLocaleString()}</p>
      {rows.length ? (
        <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-950">
          {rows.map((entry) => (
            <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-4" key={entry.id}>
              <div>
                <p className="text-sm text-white">{entry.reason}</p>
                <Link className="mt-1 block text-xs text-cyan-300 hover:underline" href={`/projects/${entry.project_id}`}>Open project</Link>
                <p className="mt-1 text-xs text-slate-500">{new Date(entry.created_at).toLocaleString()}</p>
              </div>
              <span className="font-mono text-sm text-emerald-300">+{entry.amount.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-6 text-sm text-slate-400">No credit awards have been recorded for this account.</p>
      )}
    </main>
  );
}
