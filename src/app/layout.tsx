import type { Metadata } from 'next';
import './globals.css';
import { RoleProvider } from '@/context/RoleContext';
import { AppChrome } from '@/components/layout/AppChrome';

export const metadata: Metadata = {
  title: 'GARDENIA — Research Collaboration',
  description: 'A collaborative workspace for research teams, sponsors, mentors, and contributors.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-50 text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-950">
        <RoleProvider>
          <AppChrome>{children}</AppChrome>
        </RoleProvider>
      </body>
    </html>
  );
}
