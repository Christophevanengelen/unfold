import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, localeCodes } from "@/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public files, API routes, admin, demo, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/demo") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a valid locale
  const pathnameLocale = localeCodes.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) {
    // Pass locale to root layout via request header (for dynamic <html lang>)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", pathnameLocale);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Detect preferred locale from Accept-Language header
  const acceptLanguage = request.headers.get("Accept-Language") || "";
  const preferredLocale = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].trim().substring(0, 2).toLowerCase())
    .find((code) => localeCodes.includes(code as typeof localeCodes[number]));

  const locale = preferredLocale || defaultLocale;

  // Redirect to locale-prefixed path
  return NextResponse.redirect(
    new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url)
  );
}

export const config = {
  matcher: ["/((?!_next|api|admin|demo|.*\\..*).*)"],
};
