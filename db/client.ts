import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DbClient = NeonHttpDatabase<typeof schema>;

let _db: DbClient | undefined;

function getDb(): DbClient {
    if (!_db) {
        const sql = neon(process.env.DATABASE_URL!);
        _db = drizzle(sql, { schema });
    }

    return _db;
}

export const db: DbClient = new Proxy({} as DbClient, {
    get(_target, prop, receiver) {
        return Reflect.get(getDb() as object, prop, receiver);
    }
})