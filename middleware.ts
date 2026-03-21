import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, localeCodes } from "@/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

/** Security headers applied to all responses */
const securityHeaders: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword) {
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !isValidBasicAuth(authHeader, adminPassword)) {
        return new NextResponse("Authentication required", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Unfold Admin"',
            ...securityHeaders,
          },
        });
      }
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // Skip public files, API routes, demo, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/demo") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Check if pathname already has a valid locale
  const pathnameLocale = localeCodes.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", pathnameLocale);
    return applySecurityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } })
    );
  }

  // Detect preferred locale from Accept-Language header
  const acceptLanguage = request.headers.get("Accept-Language") || "";
  const preferredLocale = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].trim().substring(0, 2).toLowerCase())
    .find((code) => localeCodes.includes(code as typeof localeCodes[number]));

  const locale = preferredLocale || defaultLocale;

  // Redirect to locale-prefixed path
  return applySecurityHeaders(
    NextResponse.redirect(
      new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url)
    )
  );
}

function isValidBasicAuth(header: string, password: string): boolean {
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) return false;
  try {
    const decoded = atob(encoded);
    const [, pwd] = decoded.split(":");
    return pwd === password;
  } catch {
    return false;
  }
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
