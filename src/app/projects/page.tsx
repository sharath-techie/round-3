import { ProjectDirectory } from '@/components/projects/ProjectDirectory';
import { requireAuthenticatedActor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const { actor } = await requireAuthenticatedActor();
  return <ProjectDirectory role={actor.role} />;
}
