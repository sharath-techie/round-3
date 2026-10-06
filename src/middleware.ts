import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const roleBySegment: Record<string, string> = {
  student: 'STUDENT',
  researcher: 'RESEARCHER',
  mentor: 'MENTOR',
  sponsor: 'SPONSOR',
  admin: 'ADMIN',
};

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' },
      { status: 503 },
    );
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  const { data, error: authError } = await supabase.auth.getUser();
  if (authError && authError.name !== 'AuthSessionMissingError') {
    return NextResponse.json({ error: `Unable to validate your session: ${authError.message}` }, { status: 503 });
  }
  if (!data.user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();
  if (profileError) {
    const missingSchema = profileError.code === 'PGRST205'
      || profileError.message.includes("Could not find the table 'public.profiles' in the schema cache");
    return NextResponse.json({
      error: missingSchema
        ? 'The Gardenia database schema is not installed in this Supabase project. From the repository root, run: npx supabase login, npx supabase link --project-ref furlxgfcvpczjeakscgr, then npx supabase db push.'
        : `Unable to verify your platform role: ${profileError.message}`,
    }, { status: 503 });
  }
  if (!profile) {
    return NextResponse.redirect(new URL('/auth/onboarding', request.url));
  }

  const expectedRole = roleBySegment[request.nextUrl.pathname.split('/')[1]];
  if (expectedRole && profile.role !== expectedRole) {
    const actualRole = profile.role.toLowerCase();
    if (!roleBySegment[actualRole]) {
      return NextResponse.json({ error: 'Your account has an invalid platform role.' }, { status: 403 });
    }
    const redirect = NextResponse.redirect(new URL(`/${actualRole}/dashboard`, request.url));
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ['/student/:path*', '/researcher/:path*', '/mentor/:path*', '/sponsor/:path*', '/admin/:path*'],
};
