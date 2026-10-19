import "server-only";

import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { loginThrottle } from "@/db/schema"; 
import {
    EMAIL_FAILURE_LIMIT,
    IP_FAILURE_LIMIT,
    LOGIN_LOCK_MINUTES,
    LOGIN_WINDOW_MINUTES,
} from "@/lib/login-throttle-policy";

const activeLockMinutes = sql<number | null>`case
    when ${loginThrottle.lockedUntil} > now()
    then ceil(extract(epoch from (${loginThrottle.lockedUntil} - now())) / 60)::int
end`;

const windowExpired =sql`${loginThrottle.windowStartedAt} <= now() - make_interval(mins => ${LOGIN_WINDOW_MINUTES}::int)`;

export async function lockedMinutes(keys: string[]): Promise<number | null> {
    if (keys.length === 0) return null;

    const rows = await db
        .select({minutes: activeLockMinutes })
        .from(loginThrottle)
        .where(and(inArray(loginThrottle.key, keys), gt(loginThrottle.lockedUntil, sql`now()`)));
    
    const minutes = rows.map((r) => Number(r.minutes)).filter((m) => m > 0);
    return minutes.length > 0 ? Math.max(...minutes) : null;
}

export async function recordFailure(key: string, limit: number): Promise<number | null> {
    const nextFailures = sql`case when ${windowExpired} then 1 else ${loginThrottle.failures} + 1 end`;

    const [row] = await db
        .insert(loginThrottle)
        .values({
            key,
            failures: 1,
            lockedUntil: limit <= 1 ? sql`now() + make_interval(mins => ${LOGIN_LOCK_MINUTES}::int)` : null,
        })
        .onConflictDoUpdate({
            target: loginThrottle.key,
            set: {
                failures: nextFailures,
                windowStartedAt: sql`case when ${windowExpired} then now() else ${loginThrottle.windowStartedAt} end`,
                lockedUntil: sql`case
                    when (${nextFailures}) >= ${limit}::int
                    then now() + make_interval(mins => ${LOGIN_LOCK_MINUTES}::int)
                    else ${loginThrottle.lockedUntil}
                end`,
            },
        })
        .returning({ minutes: activeLockMinutes });

    return row?.minutes == null ? null : Number(row.minutes);
}

export async function recordLoginFailure(keys: { email: string, ip: string }): Promise<number | null> {
    const [emailLock, ipLock] = await Promise.all([
        recordFailure(keys.email, EMAIL_FAILURE_LIMIT),
        recordFailure(keys.ip, IP_FAILURE_LIMIT),
    ]);

    const locks = [emailLock, ipLock].filter((m): m is number => m !== null);
    return locks.length > 0 ? Math.max(...locks) : null;
}

export async function clearThrottle(key: string): Promise<void> {
    await db.delete(loginThrottle).where(eq(loginThrottle.key, key));
}