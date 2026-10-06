import { RoleDashboard } from '@/components/dashboard/RoleDashboard';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  return <RoleDashboard role="ADMIN" />;
}
