import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, sessions } from "@/db/schema";

export const SESSION_COOKIE_NAME = "session";

const HOUR_MS = 60 * 60 * 1000;

export async function insertSession(userEmail: string, expiresAt: Date): Promise<string> {
    const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

    if(!user) {
        throw new Error(`insertSession: no user with email ${userEmail}`);
    }

    const token = randomBytes(32).toString("hex");
    await db.insert(sessions).values({ id: token, userId: user.id, expiresAt});

    return token;
}

export async function createValidSession(userEmail: string): Promise<string> {
    return insertSession(userEmail, new Date(Date.now() + HOUR_MS));
}

export async function createExpiredSession(userEmail: string): Promise<string> {
    return insertSession(userEmail, new Date(Date.now() - HOUR_MS));
}

export async function sessionExists(token: string): Promise<boolean> {
    const [row] = await db
        .select({ id: sessions.id })
        .from(sessions)
        .where(eq(sessions.id, token))
        .limit(1);

        return Boolean(row);
}