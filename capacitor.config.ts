import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.zebrapad.unfold",
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
      // Keep splash up until React renders — hide programmatically in demo/layout.tsx
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: "#1B1535",
      showSpinner: false,
      fadeInDuration: 200,
      fadeOutDuration: 300,
    },
    StatusBar: {
      // LIGHT = white text/icons — correct for Unfold's dark #1B1535 background
      style: "LIGHT",
      backgroundColor: "#1B1535",
      overlaysWebView: true,
    },
    Keyboard: {
      // Prevent viewport resize on keyboard open (keeps 100dvh stable)
      resize: "none",
      style: "DARK",
      resizeOnFullScreen: true,
    },
    Haptics: {},
  },
};

export default config;
