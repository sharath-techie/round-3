'use client';

import { useCallback, useEffect, useState } from 'react';
import type { UserRole } from '@/types';

interface ProjectAccessRequest {
  id: string;
  requester_id: string;
  resource_key: string;
  reason: string;
  status: string;
  requested_at: string;
  requester: { full_name: string; role: UserRole } | null;
}

export function AccessRequestQueue({ projectId, role }: { projectId: string; role: UserRole }) {
  const [requests, setRequests] = useState<ProjectAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/access-requests`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to load access requests.');
      setRequests(result.requests ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load access requests.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { void loadRequests(); }, [loadRequests]);

  const decide = async (requestId: string, decision: 'APPROVED' | 'REJECTED') => {
    setBusyId(requestId);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/project-access-requests/${requestId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to decide access request.');
      setMessage(`Access request ${decision.toLowerCase()}.`);
      await loadRequests();
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Unable to decide access request.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="space-y-3" aria-busy="true"><div className="h-5 w-40 rounded bg-slate-200" /><div className="h-24 rounded-xl bg-white" /></div>;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-950">Project access requests</h2>
        <p className="text-pretty mt-1 text-sm leading-5 text-slate-600">Every decision is written to the project audit trail. Approval grants only the requested scope.</p>
      </div>
      {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
      {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
      {requests.length ? (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {requests.map((request) => {
            const requestedRole = request.requester?.role;
            const canDecide = role === 'ADMIN'
              || (requestedRole === 'RESEARCHER' && role === 'SPONSOR')
              || (requestedRole === 'MENTOR' && role === 'RESEARCHER')
              || (requestedRole === 'STUDENT' && (role === 'MENTOR' || role === 'RESEARCHER'));
            return (
              <li key={request.id} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {request.requester?.full_name ?? request.requester_id}
                  <span className="ml-2 text-xs font-normal text-slate-500">{request.requester?.role ?? 'Account'}</span>
                </p>
                <p className="mt-1 text-xs text-slate-600">Scope: {request.resource_key}</p>
                <p className="text-pretty mt-2 whitespace-pre-wrap text-sm leading-5 text-slate-700">{request.reason}</p>
                <p className="mt-2 text-xs text-slate-500">{new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(request.requested_at))}</p>
              </div>
              {request.status === 'PENDING' && canDecide && (
                <div className="flex shrink-0 gap-2">
                  <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50" disabled={busyId === request.id} onClick={() => decide(request.id, 'REJECTED')}>Reject</button>
                  <button className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50" disabled={busyId === request.id} onClick={() => decide(request.id, 'APPROVED')}>Approve</button>
                </div>
              )}
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{request.status.replaceAll('_', ' ')}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-600">No access requests are visible to this account.</p>
      )}
    </section>
  );
}
