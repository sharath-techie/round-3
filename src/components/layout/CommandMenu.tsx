'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Command, Search, X } from 'lucide-react';
import { useRole } from '@/context/RoleContext';

const commands = [
  { label: 'Dashboard', path: 'dashboard' },
  { label: 'Projects', path: 'projects' },
  { label: 'Research', path: 'research' },
  { label: 'Contributions', path: 'contributions' },
  { label: 'Access', path: 'access' },
  { label: 'Users', path: 'users', roles: ['ADMIN'] },
  { label: 'Verification', path: 'verification', roles: ['ADMIN'] },
  { label: 'Research Problems', path: 'research-problems', roles: ['SPONSOR'] },
  { label: 'Access Requests', path: 'access-requests', roles: ['SPONSOR'] },
  { label: 'Rewards', path: 'rewards', roles: ['SPONSOR'] },
  { label: 'Reviews', path: 'reviews', roles: ['MENTOR'] },
  { label: 'Team', path: 'team', roles: ['MENTOR'] },
  { label: 'Skills', path: 'skills', roles: ['MENTOR', 'STUDENT'] },
  { label: 'AI Workspace', path: 'ai-workspace', roles: ['STUDENT', 'RESEARCHER'] },
  { label: 'Audit', path: 'audit', roles: ['ADMIN'] },
  { label: 'Security', path: 'security', roles: ['ADMIN'] },
];

export function CommandMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentRole } = useRole();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const results = useMemo(() => {
    const role = currentRole;
    const base = `/${role?.toLowerCase() ?? ''}`;
    return commands
      .filter((item) => !item.roles || (role && item.roles.includes(role)))
      .filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
      .map((item) => ({ ...item, href: item.path === 'projects' ? '/projects' : `${base}/${item.path}` }));
  }, [currentRole, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-24" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setOpen(false);
    }}>
      <section role="dialog" aria-modal="true" aria-label="Navigate" className="w-full max-w-lg overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
          <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <input
            autoFocus
            aria-label="Search navigation"
            placeholder="Search pages…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation search">
            <X className="h-4 w-4 text-slate-500 hover:text-white" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length ? results.map((item) => (
            <button
              type="button"
              key={`${item.href}-${item.label}`}
              onClick={() => {
                setOpen(false);
                setQuery('');
                router.push(item.href);
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-900"
            >
              <span>{item.label}</span>
              <span className="text-[10px] text-slate-500">{item.href}</span>
            </button>
          )) : <p className="px-3 py-5 text-sm text-slate-500">No matching pages.</p>}
        </div>
        <footer className="flex items-center gap-1 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-500">
          <Command className="h-3 w-3" aria-hidden="true" /> K to open · Esc to close
        </footer>
      </section>
      <span className="sr-only">{pathname}</span>
    </div>
  );
}
