import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Check if a next redirect parameter was supplied, otherwise default back home
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.headers.get("cookie")?.split("; ")
              .find(row => row.startsWith(`${name}=`))?.split("=")[1];
          },
          set(name: string, value: string, options: CookieOptions) {
            // Handled securely by middleware mapping configurations
          },
          remove(name: string, options: CookieOptions) {
            // Handled securely by middleware mapping configurations
          },
        },
      }
    );

    // Cryptographically trade the email link token code for an active verified browser session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If anything fails, route them safely to the home page to attempt signing in again
  return NextResponse.redirect(`${origin}/`);
}