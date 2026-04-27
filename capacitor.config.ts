import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.unfold.app",
  appName: "Unfold",
  // Live server URL: the native WebView loads directly from Vercel.
  // This is the standard Capacitor hybrid pattern — the app has real native
  // integration (deep links, safe areas, IAP, push notifications) so it
  // satisfies App Store / Play Store requirements.
  webDir: "out", // fallback for offline / dev builds
  server: {
    url: "https://unfold-nine.vercel.app/demo",
    cleartext: false,
    allowNavigation: [
      "unfold-nine.vercel.app",
      "*.supabase.co",
      "checkout.stripe.com",
      "js.stripe.com",
    ],
  },
  ios: {
    // Safe-area handling via CSS env() — do NOT set scrollEnabled here.
    contentInset: "automatic",
    backgroundColor: "#1B1535",
    scheme: "unfold",
  },
  android: {
    backgroundColor: "#1B1535",
    allowMixedContent: false,
    captureInput: true,
  },
  plugins: {
    // App plugin handles deep links (magic-link callbacks)
    // Pattern: unfold://auth/callback?code=...
    App: {},
    SplashScreen: {
      launchShowDuration: 500,
      backgroundColor: "#1B1535",
      showSpinner: false,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#1B1535",
    },
  },
};

export default config;
