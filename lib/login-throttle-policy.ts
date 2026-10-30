import { normalizeEmail } from "./email";

export const LOGIN_WINDOW_MINUTES = 15;
export const LOGIN_LOCK_MINUTES = 15;

export const EMAIL_FAILURE_LIMIT = 5;
export const IP_FAILURE_LIMIT = 20;

export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";

export function emailThrottleKey(email: string): string {
    return `email:${normalizeEmail(email)}`;
}

export function ipThrottleKey(ip: string): string {
    return `ip:${ip}`;
}

export function clientIpFrom(forwardedFor: string | null, realIp: string | null): string {
    const first = forwardedFor?.split(",")[0]?.trim();
    if (first) return first;

    const real = realIp?.trim();
    if (real) return real;

    return "unknown";
}

export function lockoutMessage(minutesLeft: number): string {
    const minutes = Math.max(1, Math.ceil(minutesLeft));
    return `Too many attempts. Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`;
}