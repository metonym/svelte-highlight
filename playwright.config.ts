import path from "node:path";
import { defineConfig, devices } from "@playwright/experimental-ct-svelte";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 10_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // A worker's first test on a cold CI runner sometimes spends its whole
  // timeout setting up the page. One retry absorbs that, and it's what
  // makes `trace: "on-first-retry"` below record anything.
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    ctPort: 3100,
    ctTemplateDir: "tests/e2e/playwright",
    ctViteConfig: {
      plugins: [svelte({ preprocess: vitePreprocess() })],
      resolve: {
        alias: {
          "svelte-highlight": path.resolve("src"),
        },
        conditions: ["browser", "module", "import"],
      },
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.CI ? "chrome" : undefined,
      },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
