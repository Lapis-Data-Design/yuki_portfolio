import { config } from "dotenv";

// Same principle as scripts/seed-users.ts: this file runs outside Next's
// own env-loading, so .env.test has to be loaded explicitly before any
// test that imports db/client.ts runs — otherwise DATABASE_URL is empty
// at the moment db/client.ts constructs its Neon connection.
config({ path: ".env.test" });