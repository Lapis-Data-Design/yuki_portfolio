import { describe, it, expect } from "vitest";
import {
    EMAIL_FAILURE_LIMIT,
    IP_FAILURE_LIMIT,
    ACCOUNT_FAILURE_LIMIT,
    LOGIN_LOCK_MINUTES,
    LOGIN_WINDOW_MINUTES,
    clientIpFrom,
    emailThrottleKey,
    ipThrottleKey,
    accountThrottleKey,
    lockoutMessage,
} from "./login-throttle-policy";


describe("limits", () => {
    it("locks an email after 5 failures in 15 minutes, for 15 minutes", () => {
        expect(EMAIL_FAILURE_LIMIT).toBe(5);
        expect(LOGIN_WINDOW_MINUTES).toBe(15);
        expect(LOGIN_LOCK_MINUTES).toBe(15);
    });

    it("gives an IP a higher ceiling than a single email", () => {
        expect(IP_FAILURE_LIMIT).toBeGreaterThan(EMAIL_FAILURE_LIMIT);
    });

    it("locks an account's current-password check after 5 failures", () => {
        expect(ACCOUNT_FAILURE_LIMIT).toBe(5);
    }); 
});

describe("throttle key", () => {
    it("prefixes email keys and normalizes the address", () => {
        expect(emailThrottleKey("Owner@Example.test")).toBe("email:owner@example.test");
    });

    it("prefixes IP keys", () => {
        expect(ipThrottleKey("203.0.113.7")).toBe("ip:203.0.113.7");
    });

    it("prefixes account keys with the user id", () => {
        expect(accountThrottleKey(42)).toBe("account:42");
    });
});

describe("clientIpFrom", () => {
    it("uses the first x-forwarded-for hop", () => {
        expect(clientIpFrom("203.0.113.7, 10.0.0.1", null)).toBe("203.0.113.7");
    });

    it("falls back to x-real-ip", () => {
        expect(clientIpFrom(null, " 198.51.100.4 ")).toBe("198.51.100.4");
    });

    it("skips an empty x-forwarded-for", () => {
        expect(clientIpFrom(" ", "198.51.100.4")).toBe("198.51.100.4");
    });

    it("returns 'unknown' when neither header is present", () =>{
       expect(clientIpFrom(null, null)).toBe("unknown");
    });
});

describe("lockoutMessage", () => {
    it("states the minutes left", () => {
        expect(lockoutMessage(15)).toBe("Too many attempts. Try again in 15 minutes.");
    });

    it("uses the singular for one minute", () => {
        expect(lockoutMessage(1)).toBe("Too many attempts. Try again in 1 minute.");
    });

    it("rounds partial minutes up and never says 0", () => {
        expect(lockoutMessage(2.2)).toBe("Too many attempts. Try again in 3 minutes.");
        expect(lockoutMessage(0)).toBe("Too many attempts. Try again in 1 minute.");
    });
});