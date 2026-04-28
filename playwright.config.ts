import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: {
    baseURL: "https://unfold-nine.vercel.app",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Mobile viewport — app is phone-sized
    viewport: { width: 390, height: 844 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        // Mobile viewport matching the app phone shell
        viewport: { width: 390, height: 844 },
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
