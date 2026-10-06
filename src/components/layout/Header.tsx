'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, Command, LogOut, Search, Sun } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import type { UserRole } from '@/types';

const rolePaths: Record<UserRole, string> = {
  STUDENT: '/student/dashboard',
  RESEARCHER: '/researcher/dashboard',
  MENTOR: '/mentor/dashboard',
  SPONSOR: '/sponsor/dashboard',
  ADMIN: '/admin/dashboard',
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, currentRole, signOut } = useRole();
  const [search, setSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications?countOnly=1');
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? 'Unread notifications could not be loaded.');
        if (active) {
          setUnreadCount(result.unreadCount ?? 0);
          setNotificationError(null);
        }
      } catch (error) {
        if (active) setNotificationError(error instanceof Error ? error.message : 'Unread notifications could not be loaded.');
      }
    };
    const refresh = () => void loadUnreadCount();

    refresh();
    window.addEventListener('gardenia:notifications-updated', refresh);
    return () => {
      active = false;
      window.removeEventListener('gardenia:notifications-updated', refresh);
    };
  }, [pathname]);

  const signOutToLogin = async () => {
    setSignOutError(null);
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <form
        className="hidden w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex"
        onSubmit={(event) => {
          event.preventDefault();
          const query = search.trim().toLowerCase();
          if (query.includes('project')) router.push(`/${currentRole.toLowerCase()}/projects`);
          else if (query.includes('skill')) router.push('/student/skills');
          else if (query.includes('message')) router.push(`/${currentRole.toLowerCase()}/messages`);
          else if (query.includes('dashboard') || query.length === 0) router.push(rolePaths[currentRole]);
        }}
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <input
          aria-label="Search workspace"
          className="min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
          placeholder="Search projects, researchers, mentors..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <kbd className="hidden items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] sm:inline-flex">
          <Command className="size-3" aria-hidden="true" /> K
        </kbd>
      </form>
      <p className="text-sm font-semibold text-slate-900 md:hidden">{pathname.includes('/projects/') ? 'Project workspace' : 'Workspace'}</p>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          title={notificationError ?? `${unreadCount} unread notifications`}
          onClick={() => router.push('/notifications')}
          className="relative flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <Bell className="size-4" aria-hidden="true" />
          {unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-600 px-1 text-center text-[9px] font-bold leading-4 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>
        <button type="button" aria-label="Theme is set to light" className="hidden size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 sm:flex">
          <Sun className="size-4" aria-hidden="true" />
        </button>
        <span className="flex size-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-800" aria-hidden="true">
          {currentUser.name.trim().slice(0, 1).toUpperCase()}
        </span>
        <button
          type="button"
          onClick={() => void signOutToLogin()}
          className="hidden items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 sm:inline-flex"
          aria-label="Sign out"
        >
          <LogOut className="size-4" aria-hidden="true" />
        </button>
      </div>
      {signOutError && <p className="absolute right-4 top-full mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800 shadow" role="alert">{signOutError}</p>}
      {notificationError && <p className="absolute right-4 top-full mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 shadow" role="alert">{notificationError}</p>}
    </header>
  );
}
