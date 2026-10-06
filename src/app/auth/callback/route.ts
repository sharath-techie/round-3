import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SupabaseConfigurationError } from '@/lib/supabase/env';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next');
  const destination = next?.startsWith('/') && !next.startsWith('//') ? next : '/auth/onboarding';

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=confirmation_failed', request.url));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL('/auth/login?error=confirmation_failed', request.url));
    }
    return NextResponse.redirect(new URL(destination, request.url));
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error('Supabase auth callback failed:', error);
    return NextResponse.redirect(new URL('/auth/login?error=confirmation_failed', request.url));
  }
}
