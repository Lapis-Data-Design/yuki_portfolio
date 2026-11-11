import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { normalizeEmail } from "@/lib/email";
import { users, loginThrottle } from "@/db/schema";
import { emailThrottleKey, accountThrottleKey } from "@/lib/login-throttle-policy";

function assertTestBranch(): void {
    if (process.env.NEON_BRANCH !== "test") {
        throw new Error("login-throttle test helpers only run against the Neon test branch (NEON_BRANCH=test).");
    }
}

export async function clearAllLoginThrottle(): Promise<void> {
    assertTestBranch();
    await db.delete(loginThrottle);
}

export async function rewindLoginThrottle(key: string, minutes = 16): Promise<void> {
    assertTestBranch();
    await db
        .update(loginThrottle)
        .set({
            windowStartedAt: sql`${loginThrottle.windowStartedAt} - make_interval(mins => ${minutes}::int)`,            
            lockedUntil: sql`${loginThrottle.lockedUntil} - make_interval(mins => ${minutes}::int)`,
        })
        .where(eq(loginThrottle.key, key));
}

export async function rewindLoginThrottleForEmail(email: string, minutes = 16): Promise<void> {
    await rewindLoginThrottle(emailThrottleKey(email), minutes);
}

export async function rewindAccountThrottleForEmail(email: string, minutes = 16): Promise<void> {
    assertTestBranch();
    const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalizeEmail(email)));
    if(!user) throw new Error(`No user with email ${email}.`);
    await rewindLoginThrottle(accountThrottleKey(user.id), minutes);
}