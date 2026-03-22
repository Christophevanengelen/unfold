import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
