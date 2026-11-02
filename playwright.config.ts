import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  timeout: 90000,
  workers: 1,
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: [
    {
      command: "node scripts/mock-ai.mjs",
      url: "http://127.0.0.1:4010",
      reuseExistingServer: false,
    },
    {
      command: "node node_modules/next/dist/bin/next start",
      url: "http://localhost:3000",
      reuseExistingServer: false,
      env: {
        OPENAI_BASE_URL: "http://127.0.0.1:4010/v1",
        OPENAI_API_KEY: "test-only-key",
      },
      timeout: 60000,
    },
  ],
});
