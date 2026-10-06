import { ProjectDirectory } from '@/components/projects/ProjectDirectory';

export const dynamic = 'force-dynamic';

export default function AdminProjectsPage() {
  return <ProjectDirectory role="ADMIN" />;
}
