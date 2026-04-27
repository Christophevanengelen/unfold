import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const isNativeBuild = process.env.NEXT_PUBLIC_NATIVE === "true";

const nextConfig: NextConfig = {
  // Disable React Strict Mode to prevent Supabase auth lock warnings in dev
  // (Strict Mode causes double-mount which races on the navigator lock)
  reactStrictMode: false,

  // Native build: static export for Capacitor bundle (webDir: "out")
  // Only /demo routes are exported — landing/admin pages are skipped.
  ...(isNativeBuild && {
    output: "export",
    // Images must be unoptimized for static export (no server-side optimization)
    images: { unoptimized: true },
    // Trailing slash so each route becomes a folder with index.html
    trailingSlash: true,
  }),

  experimental: {
    // Re-enable client router cache for instant navigation between pages.
    // Next.js 15 defaults to staleTime=0 (refetch on every nav) which causes
    // visible delay when switching between timeline and match views.
    // static=300s for pages that don't change often, dynamic=30s for the rest.
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
};

const analyzeBundles = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default analyzeBundles(nextConfig);
