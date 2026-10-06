import type { UserRole } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SupabaseConfigurationError } from '@/lib/supabase/env';
import { SqlEditorConfigurationError } from '@/lib/sql-editor/errors';

export interface AuthenticatedActor {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const APP_ROLES: readonly UserRole[] = [
  'STUDENT',
  'RESEARCHER',
  'MENTOR',
  'SPONSOR',
  'ADMIN',
];

export async function requireAuthenticatedActor() {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (!authData.user) {
    if (authError && authError.name !== 'AuthSessionMissingError') {
      throw new ApiError('Unable to validate the current session.', 503);
    }
    throw new ApiError('Authentication is required.', 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profileError) {
    if (
      profileError.code === 'PGRST205'
      || profileError.message.includes("Could not find the table 'public.profiles' in the schema cache")
    ) {
      throw new ApiError(
        'The Gardenia database schema is not installed. From the repository root, run: npx supabase login, npx supabase link --project-ref furlxgfcvpczjeakscgr, then npx supabase db push.',
        503,
      );
    }
    throw new ApiError('Unable to load the authenticated user profile.', 503);
  }
  if (!profile || !APP_ROLES.includes(profile.role as UserRole)) {
    throw new ApiError('The authenticated account has no valid platform role.', 403);
  }

  return {
    supabase,
    actor: {
      id: authData.user.id,
      email: authData.user.email ?? '',
      fullName: profile.full_name,
      role: profile.role as UserRole,
    } satisfies AuthenticatedActor,
  };
}

export function requireRole(actor: AuthenticatedActor, allowedRoles: readonly UserRole[]) {
  if (!allowedRoles.includes(actor.role)) {
    throw new ApiError('Your platform role is not permitted to perform this action.', 403);
  }
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof SupabaseConfigurationError) {
    return Response.json({ error: error.message }, { status: 503 });
  }
  if (error instanceof SqlEditorConfigurationError) {
    return Response.json({ error: error.message }, { status: 503 });
  }
  console.error('Unhandled API error:', error);
  return Response.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
}
