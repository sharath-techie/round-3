'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BriefcaseBusiness,
  Database,
  FileCheck2,
  FolderKanban,
  LayoutDashboard,
  Microscope,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { UserRole } from '@/types';
import { useRole } from '@/context/RoleContext';
import { cn } from '@/lib/cn';

type NavItem = { name: string; href: string; icon: ComponentType<{ className?: string }> };

const navigation: Record<UserRole, NavItem[]> = {
  STUDENT: [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/student/projects', icon: FolderKanban },
    { name: 'Contributions', href: '/student/contributions', icon: FileCheck2 },
    { name: 'Profile', href: '/student/profile', icon: Users },
  ],
  RESEARCHER: [
    { name: 'Dashboard', href: '/researcher/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/researcher/projects', icon: FolderKanban },
    { name: 'Contributions', href: '/researcher/contributions', icon: FileCheck2 },
    { name: 'Experiments', href: '/researcher/experiments', icon: Microscope },
  ],
  MENTOR: [
    { name: 'Dashboard', href: '/mentor/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/mentor/projects', icon: FolderKanban },
    { name: 'Reviews', href: '/mentor/review', icon: FileCheck2 },
  ],
  SPONSOR: [
    { name: 'Dashboard', href: '/sponsor/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/sponsor/projects', icon: FolderKanban },
    { name: 'Create project', href: '/sponsor/create', icon: Microscope },
    { name: 'Organizations', href: '/sponsor/organizations', icon: BriefcaseBusiness },
    { name: 'Analytics', href: '/sponsor/analytics', icon: Activity },
  ],
  ADMIN: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Verification', href: '/admin/verification', icon: ShieldCheck },
    { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { name: 'Audit', href: '/admin/audit', icon: Activity },
    { name: 'SQL Editor', href: '/admin/sql-editor', icon: Database },
    { name: 'AI Mesh', href: '/admin/mesh', icon: Sparkles },
  ],
};

function SidebarContents({ pathname }: { pathname: string }) {
  const { currentRole, currentUser } = useRole();
  return (
    <>
      <Link href={`/${currentRole.toLowerCase()}/dashboard`} className="flex items-center gap-3 px-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-teal-400 text-sm font-extrabold text-slate-950">G</span>
        <span>
          <span className="block text-sm font-bold tracking-wide text-white">GARDENIA</span>
          <span className="block text-[10px] text-slate-400">Research collaboration</span>
        </span>
      </Link>
      <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase text-slate-500">Workspace</p>
      <nav aria-label="Role navigation" className="flex flex-col gap-1">
        {navigation[currentRole].map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== `/${currentRole.toLowerCase()}/dashboard` && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium',
                active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden border-t border-slate-800 pt-4 lg:block">
        <div className="flex items-center gap-2 px-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">{currentUser.name.slice(0, 1)}</span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium text-slate-200">{currentUser.name}</span>
            <span className="block truncate text-[10px] text-slate-500">{currentUser.institution}</span>
          </span>
        </div>
      </div>
    </>
  );
}

export function RoleNavigation() {
  const pathname = usePathname();
  const projectMode = pathname.startsWith('/projects/');
  if (projectMode) return null;
  return (
    <>
      <aside className="hidden h-dvh w-56 shrink-0 flex-col bg-slate-950 px-3 py-5 text-slate-100 lg:sticky lg:top-0 lg:flex xl:w-60 xl:px-4">
        <SidebarContents pathname={pathname} />
      </aside>
      <details className="group border-b border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between">
          <span className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-teal-400 text-sm font-extrabold text-slate-950">G</span>
            <span className="text-sm font-bold tracking-wide">GARDENIA</span>
          </span>
          <span className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 group-open:hidden">Menu</span>
          <span className="hidden rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 group-open:inline">Close</span>
        </summary>
        <div className="max-h-[70dvh] overflow-y-auto pb-2 pt-4">
          <SidebarContents pathname={pathname} />
        </div>
      </details>
    </>
  );
}
