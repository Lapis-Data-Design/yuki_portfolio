import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { loginThrottle } from "@/db/schema";
import { emailThrottleKey } from "@/lib/login-throttle-policy";

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