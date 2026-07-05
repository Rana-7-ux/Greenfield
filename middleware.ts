import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
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

  // 2. Pure native check: Look for ANY cookie containing 'auth-token'
  const allCookies = request.cookies.getAll();
  const hasAuthToken = allCookies.some((cookie) => 
    cookie.name.includes("auth-token") || cookie.name.includes("access-token")
  );

  // 3. Define your core storefront routes that anyone can view
  const isPublicRoute =
    path === "/" ||
    path.startsWith("/search") ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/farmer-login");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 4. Secure Routes: Only redirect to login if they have NO token whatsoever
  const isProtectedRoute =
    path.startsWith("/cart") ||
    path.startsWith("/checkout") ||
    path.startsWith("/track-orders") ||
    path.startsWith("/profile") ||
    path.startsWith("/admin");

  if (isProtectedRoute && !hasAuthToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};