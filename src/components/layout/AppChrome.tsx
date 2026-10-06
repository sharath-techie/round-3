'use client';

import { usePathname } from 'next/navigation';
import { CommandMenu } from '@/components/layout/CommandMenu';
import { Header } from '@/components/layout/Header';
import { RoleNavigation } from '@/components/layout/RoleNavigation';

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/auth')) return <>{children}</>;

  if (pathname.startsWith('/projects/')) return <main>{children}</main>;

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 lg:flex">
      <RoleNavigation />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="min-h-[calc(100dvh-4rem)] pb-10">{children}</main>
      </div>
      <CommandMenu />
    </div>
  );
}
