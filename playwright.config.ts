import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  retries: 1,
  use: {
    baseURL: `http://localhost:${process.env.VITE_PORT ?? 3000}`,
    headless: true,
  },
  webServer: {
    command: "npm run dev",
    port: process.env.VITE_PORT ? Number(process.env.VITE_PORT) : 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
