'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PlatformUser {
  id: string;
  full_name: string;
  role: string;
  institution: string | null;
  created_at: string;
}

const roles = ['STUDENT', 'RESEARCHER', 'MENTOR', 'SPONSOR', 'ADMIN'] as const;

export function AdminUsers({ users }: { users: PlatformUser[] }) {
  const router = useRouter();
  const [selectedRoles, setSelectedRoles] = useState<Record<string, (typeof roles)[number]>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const assignRole = async (userId: string, currentRole: string) => {
    const role = selectedRoles[userId] ?? currentRole as (typeof roles)[number];
    setBusyId(userId);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Role update failed.');
      setMessage('Role change recorded in the audit trail.');
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Role update failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}
      {message && <p className="text-sm text-emerald-300" role="status">{message}</p>}
      <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-950">
        {users.map((user) => (
          <li className="flex flex-wrap items-center justify-between gap-4 px-4 py-4" key={user.id}>
            <div>
              <p className="text-sm font-medium text-white">{user.full_name}</p>
              <p className="mt-1 text-xs text-slate-500">{user.institution ?? 'No institution'} · {user.id}</p>
              <p className="mt-1 text-xs text-slate-500">Joined {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`role-${user.id}`}>Role for {user.full_name}</label>
              <select className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-white" id={`role-${user.id}`} value={selectedRoles[user.id] ?? user.role} onChange={(event) => setSelectedRoles((current) => ({ ...current, [user.id]: event.target.value as (typeof roles)[number] }))}>
                {roles.map((role) => <option key={role}>{role}</option>)}
              </select>
              <button className="rounded bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-50" disabled={busyId === user.id || (selectedRoles[user.id] ?? user.role) === user.role} onClick={() => void assignRole(user.id, user.role)}>Save</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
