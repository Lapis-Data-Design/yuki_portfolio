import { describe, it, expect, beforeEach } from "@/tests/test-utils";
import {
    clearThrottle,
    lockedMinutes,
    recordFailure,
    recordLoginFailure,
} from "@/lib/login-throttle";
import {
    EMAIL_FAILURE_LIMIT,
    IP_FAILURE_LIMIT,
    LOGIN_LOCK_MINUTES,
    emailThrottleKey,
    ipThrottleKey,
} from "@/lib/login-throttle-policy";
import { clearAllLoginThrottle, rewindLoginThrottle } from "@/tests/helpers/login-throttle";
import { M } from "vitest/dist/chunks/reporters.d.BuRON0I0.js";

const EMAIL_KEY = emailThrottleKey("throttle-test@example.test");
const IP_KEY = ipThrottleKey("203.0.113.50");

async function fail(key: string, times: number, limit = EMAIL_FAILURE_LIMIT) {
    const results: (number | null)[] = [];
    for (let i = 0; i < times; i++) {
        results.push(await recordFailure(key, limit));
    }
    return results;
}

beforeEach(async () => {
    await clearAllLoginThrottle();
});

describe("lockedMinutes", () => {
    it("is null for a key with no failures", async () => {
        expect(await lockedMinutes([EMAIL_KEY])).toBeNull();
    });

    it("is null for an empty key list", async () => {
        expect(await lockedMinutes([])).toBeNull();
    });
});

describe("recordFailures", () => {
    it("does not lock before the limit", async () => {
        const results = await fail(EMAIL_KEY, EMAIL_FAILURE_LIMIT - 1);
        expect(results.every((r) => r === null)).toBe(true);
        expect(await lockedMinutes([EMAIL_KEY])).toBeNull();
    });
    
    it("locks on the limit for the full lock length", async () => {
        const results = await fail(EMAIL_KEY, EMAIL_FAILURE_LIMIT);
        expect(results.at(-1)).toBe(LOGIN_LOCK_MINUTES);
        expect(await lockedMinutes([EMAIL_KEY])).toBe(LOGIN_LOCK_MINUTES);
    });

    it("reports a lock when any key in the list is locked", async () => {
        await fail(IP_KEY, EMAIL_FAILURE_LIMIT);
        expect(await lockedMinutes([EMAIL_KEY, IP_KEY])).toBe(LOGIN_LOCK_MINUTES);
    });

    it("unlocks once the lock has run out", async () => {
        await fail(EMAIL_KEY, EMAIL_FAILURE_LIMIT);
        await rewindLoginThrottle(EMAIL_KEY);
        expect(await lockedMinutes([EMAIL_KEY])).toBeNull();
    });

    it("starts a new count after the window runs out", async () => {
        await fail(EMAIL_KEY, EMAIL_FAILURE_LIMIT - 1);
        await rewindLoginThrottle(EMAIL_KEY);
        const results = await fail(EMAIL_KEY, EMAIL_FAILURE_LIMIT - 1);
        expect(results.every((r) => r === null )).toBe(true);
    });

    it("starts a new count after lock runs out", async () => {
        await fail(EMAIL_KEY, EMAIL_FAILURE_LIMIT);
        await rewindLoginThrottle(EMAIL_KEY);
        expect(await recordFailure(EMAIL_KEY, EMAIL_FAILURE_LIMIT)).toBeNull();
    });
});

describe("clearThrottle", () => {
    it("removes the count and any lock", async () => {
        await fail(EMAIL_KEY, EMAIL_FAILURE_LIMIT);
        await clearThrottle(EMAIL_KEY);
        expect(await lockedMinutes([EMAIL_KEY])).toBeNull();

        const results = await fail(EMAIL_KEY, EMAIL_FAILURE_LIMIT - 1);
        expect(results.every((r) => r === null)).toBe(true);
    });
});

describe("recordLoginFailure", () => {
    it("counts the email and the IP, each against its own limit", async () => {
        for (let i = 0; i < EMAIL_FAILURE_LIMIT - 1; i++) {
            expect(await recordLoginFailure({ email: EMAIL_KEY, ip: IP_KEY })).toBeNull();
        }

        expect(await recordLoginFailure({ email: EMAIL_KEY, ip: IP_KEY })).toBe(LOGIN_LOCK_MINUTES);

        expect(await lockedMinutes([IP_KEY])).toBeNull();
    });

    it("locks the IP at its own lmit across different emails", async () => {
        for (let i = 0; i < IP_FAILURE_LIMIT - 1; i++) {
            const email = emailThrottleKey(`spray-${i}@example.test`);
            expect(await recordLoginFailure({ email, ip: IP_KEY})).toBeNull();
        }

        const last = await recordLoginFailure({
            email: emailThrottleKey("spray-last@example.test"),
            ip: IP_KEY,
        });
        expect(last).toBe(LOGIN_LOCK_MINUTES);
        expect(await lockedMinutes([IP_KEY])).toBe(LOGIN_LOCK_MINUTES);
    });
});