import { RoleScreen } from '@/components/screens/RoleScreen';

export const dynamic = 'force-dynamic';

export default async function MockFrontendPage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;
  return <RoleScreen segments={path} />;
}
