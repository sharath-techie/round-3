import { NextResponse } from 'next/server';
import { apiErrorResponse, requireAuthenticatedActor, requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    requireRole(actor, ['ADMIN']);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, institution, created_at')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`User profiles could not be loaded: ${error.message}`);
    return NextResponse.json({ users: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
