import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // If there's an error, redirect to login with error message
  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(error_description || 'An error occurred')}`
    );
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    try {
      await supabase.auth.exchangeCodeForSession(code);
      return NextResponse.redirect(`${requestUrl.origin}`);
    } catch (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent('Invalid or expired link')}`
      );
    }
  }

  // Return to login if no code or error (shouldn't happen)
  return NextResponse.redirect(`${requestUrl.origin}/login`);
} 