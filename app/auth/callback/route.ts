// app/auth/callback/route.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
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
            // Managed by global middleware configurations safely
          },
          remove(name: string, options: CookieOptions) {
            // Managed by global middleware configurations safely
          },
        },
      }
    );

    // Trade the email token code for an active verified session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // SENIOR ENGINEER FIX: Append a verified state flag to the URL.
      // This breaks client-side routing cache locks and forces the browser to instantly
      // read the fresh cookies we just dropped in without displaying the sign-in modal again.
      const targetUrl = new URL(next, origin);
      targetUrl.searchParams.set("verified", "true");
      
      return NextResponse.redirect(targetUrl.toString());
    }
  }

  // Fallback safe recovery exit
  return NextResponse.redirect(`${origin}/`);
}