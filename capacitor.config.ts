import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "day.favorable.app",
  appName: "Favorable",
  // L app embarque son propre code. Rien n est charge a distance au demarrage :
  // c est ce qu exigent les regles 2.5.2 et 4.2 de l App Store. Les donnees, elles,
  // viennent des API comme dans n importe quelle app (voir lib/api-client.ts).
  webDir: "out",
  ios: {
    // Les zones de securite sont gerees en CSS (env(safe-area-inset-*), voir
    // globals.css et app/app/layout.tsx), donc la vue web couvre tout l ecran.
    // Avec "automatic", iOS reservait la bande du haut et y laissait voir le fond
    // natif de la vue web, fige en sombre : on avait un bandeau mauve fonce
    // au-dessus d une page claire. Constate le 31 aout 2026.
    // Ne pas toucher a scrollEnabled ici.
    contentInset: "never",
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
    Preferences: {
      // Le magasin est PARTAGE avec l extension widget. Sans ce groupe, l app
      // ecrirait dans son propre coin et le widget lirait dans le vide, sans
      // qu aucune erreur n apparaisse d aucun cote.
      group: "group.day.favorable.app",
    },
    PushNotifications: {
      // Sans cette liste, une notification recue pendant que l app est au
      // premier plan n apparait pas du tout : le greffon renvoie une liste
      // vide par defaut. Verifie dans les sources de la version 8.1.2.
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
