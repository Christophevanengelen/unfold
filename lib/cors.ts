/**
 * CORS helper for API routes that Capacitor calls cross-origin.
 *
 * Allowed origins (single-origin echo — never wildcard):
 *   - capacitor://localhost  (iOS Capacitor WebView)
 *   - https://localhost      (Android Capacitor WebView)
 *   - http://localhost:3333  (local dev)
 *   - https://unfold-nine.vercel.app (web same-origin, technically fine)
 *
 * Usage:
 *   export async function OPTIONS(req) { return corsPreflightResponse(req); }
 *   // In POST/GET: return withCors(req, NextResponse.json(...));
 */

import { NextRequest, NextResponse } from "next/server";

const ALLOWED = new Set([
  "capacitor://localhost",
  "https://localhost",
  "http://localhost:3333",
  "https://unfold-nine.vercel.app",
]);

function getAllowedOrigin(req: NextRequest): string {
  const origin = req.headers.get("origin") ?? "";
  return ALLOWED.has(origin) ? origin : "https://unfold-nine.vercel.app";
}

export function withCors(req: NextRequest, res: NextResponse): NextResponse {
  res.headers.set("Access-Control-Allow-Origin", getAllowedOrigin(req));
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Vary", "Origin");
  return res;
}

export function corsPreflightResponse(req: NextRequest): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": getAllowedOrigin(req),
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, content-type, x-unfold-internal",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}
