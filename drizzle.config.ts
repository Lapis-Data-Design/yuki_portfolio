import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

const envFile = process.env.ENV_FILE ?? ".env.local";
const loaded = config({ path: envFile, override: true });
if (loaded.error) throw new Error(`Could not read ${envFile}`);

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) throw new Error(`DATABASE_URL_UNPOOLED is not set in ${envFile}`);

try {
    console.log(`[drizzle] ${envFile} -> ${new URL(url).host}`);
} catch {
    throw new Error(`DATABASE_URL_UNPOOLED in ${envFile} is not a valid URL`);
}

export default defineConfig({
    schema: "./db/schema.ts",
    out: "./db/migrations",
    dialect: "postgresql",
    dbCredentials: { url },
});