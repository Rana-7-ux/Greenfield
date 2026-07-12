import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Immediately allow all static assets, images, and framework files
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/static") ||
    path === "/favicon.ico" ||
    path.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Create an extensible, mutable response object for cookie setting
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Official Crypto-Verified Session Check via Supabase Server Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Retrieve the true session state. Unconfirmed accounts will return a null session.
  const { data: { session } } = await supabase.auth.getSession();
  const hasAuthToken = !!session;

  // 3. Define your core storefront routes that anyone can view
  const isPublicRoute =
    path === "/" ||
    path.startsWith("/search") ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/farmer-login") ||
    path.startsWith("/auth");

  if (isPublicRoute) {
    return response;
  }

  // 4. Secure Routes: Redirect straight to your beautiful orange login page!
  const isProtectedRoute =
    path.startsWith("/cart") ||
    path.startsWith("/checkout") ||
    path.startsWith("/track-orders") ||
    path.startsWith("/farmer") || // 👈 Added this to protect the Farmer Portal dashboard space
    path.startsWith("/profile") ||
    path.startsWith("/admin");

  if (isProtectedRoute && !hasAuthToken) {
    // Construct the URL to your specific login page
    const loginUrl = new URL("/login", request.url);
    
    // Clever engineering: Remember where they were trying to go so we can route them back later
    loginUrl.searchParams.set("next", path);
    
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};