import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.unfold.app",
  appName: "Unfold",
  // The /demo routes are pure "use client" — no SSR. We export them statically
  // for the native bundle via NEXT_PUBLIC_NATIVE=true next build --output export.
  webDir: "out",
  server: {
    // Allow the native WebView to navigate to our Vercel API for auth callback.
    // All data API calls use fetch() pointing to NEXT_PUBLIC_API_BASE directly.
    allowNavigation: ["unfold-nine.vercel.app", "*.supabase.co"],
  },
  ios: {
    // Safe-area handling via CSS env() — do NOT set scrollEnabled here.
    contentInset: "automatic",
    backgroundColor: "#1B1535",
  },
  android: {
    backgroundColor: "#1B1535",
    allowMixedContent: false,
  },
  plugins: {
    // App plugin handles deep links (magic-link callbacks)
    App: {
      // Scheme registered in Info.plist (iOS) + AndroidManifest.xml (Android)
      // Pattern: unfold://auth/callback?code=...
    },
  },
};

export default config;
