import { config } from "dotenv";

// Same principle as scripts/seed-users.ts: this file runs outside Next's
// own env-loading, so .env.test has to be loaded explicitly before any
// test that imports db/client.ts runs — otherwise DATABASE_URL is empty
// at the moment db/client.ts constructs its Neon connection.
config({ path: ".env.test" });

if (process.env.NEON_BRANCH !== "test") {
    throw new Error(
        `Integration tests require NEON_BRANCH to be "test", but it was ` +
        `${JSON.stringify(process.env.NEON_BRANCH ?? null)}. Refusing to run ` +
        `— check .env.test and confirm NEON_BRANCH is set correctly before ` +
        `re-running.`
    );
}