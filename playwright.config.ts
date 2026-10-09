import { defineConfig } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.test" });

const TARGET = process.env.E2E_TARGET === "prod" ? "prod" : "dev";

const PORT = TARGET === "prod" ? 3100 : 3000;
const BASE_URL = `http://localhost:${PORT}`;

if (!process.env.DATABASE_URL || process.env.NEON_BRANCH !== "test") {
    throw new Error(
        "E2E needs .env.test with DATABASE_URL and NEON_BRANCH=test; refuse to run."
    );
}

console.log(`[e2e] target : ${TARGET} (${BASE_URL})`);

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: false,
    workers: 1,
    globalSetup: "./tests/e2e/global-setup.ts",
    globalTeardown: "./tests/e2e/global-teardown.ts",
    use: {
        baseURL: BASE_URL,
        trace: "on-first-retry",
    },
    webServer: {
        command: 
            TARGET === "prod"
                ? `npm run build && npm run start -- --port ${PORT}`
                : `npm run dev -- --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: TARGET === "dev" && !process.env.CI,
        timeout: TARGET ? 240_000 : 60_000,
        stdout: "pipe",
        env: {
            DATABASE_URL: process.env.DATABASE_URL,
            NEON_BRANCH: process.env.NEON_BRANCH,
        },
    },
});