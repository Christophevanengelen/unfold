import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "day.favorable.app",
  appName: "Unfold",
  // L app embarque son propre code. Rien n est charge a distance au demarrage :
  // c est ce qu exigent les regles 2.5.2 et 4.2 de l App Store. Les donnees, elles,
  // viennent des API comme dans n importe quelle app (voir lib/api-client.ts).
  webDir: "out",
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
      launchFadeOutDuration: 300,
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
