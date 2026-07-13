// app/auth/callback/route.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // If a valid code is present, exchange it for an active session
  if (code) {
    // 1. Prepare the redirect response object first
    const targetUrl = new URL(next, origin);
    targetUrl.searchParams.set("verified", "true");
    const response = NextResponse.redirect(targetUrl.toString());

    // 2. Initialize Supabase SSR and map cookie handlers directly to the response object
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.headers.get("cookie")?.split("; ")
              .find(row => row.startsWith(`${name}=`))?.split("=")[1];
          },
          // FIXED: Write cookies directly onto the outgoing response so the browser saves them
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options });
          },
          // FIXED: Allow token destruction on the response if verification fails
          remove(name: string, options: CookieOptions) {
            response.cookies.delete({ name, ...options });
          },
        },
      }
    );

    // 3. Cryptographically trade the verification code for active session tokens
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Return the response object containing the brand-new session cookies!
      return response;
    }
  }

  // Fallback safe escape hatch if the token was invalid or expired
  return NextResponse.redirect(`${origin}/?error=verification_failed`);
}