import path from "node:path";
import { defineConfig, devices } from "@playwright/experimental-ct-svelte";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 10_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    ctPort: 3100,
    ctViteConfig: {
      plugins: [svelte({ preprocess: vitePreprocess() })],
      resolve: {
        alias: {
          "svelte-highlight/styles": path.resolve(process.cwd(), "src/styles"),
          "svelte-highlight/languages": path.resolve(
            process.cwd(),
            "src/languages",
          ),
          "svelte-highlight": path.resolve(process.cwd(), "src"),
        },
        conditions: ["browser", "module", "import"],
      },
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
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
