import { defineConfig } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.test" });

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: false,
    workers: 1,
    globalSetup: "./tests/e2e/global-setup.ts",
    globalTeardown: "./tests/e2e/global-teardown.ts",
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
    },
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        env: {
            DATABASE_URL: process.env.DATABASE_URL ?? "",
            NEON_BRANCH: process.env.NEON_BRANCH ?? "",
        },
    },
})