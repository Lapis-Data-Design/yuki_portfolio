import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { requireOwner, requireAdminOnly, requireOwnerOrAdmin } from "@/lib/auth";
import { cleanupUsersByEmailPattern } from "@/tests/helpers/user-cleanup";
import { 
    SESSION_COOKIE_NAME,
    createValidSession,
    createExpiredSession
} from "@/tests/helpers/sessions";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getURLFromRedirectError } from "next/dist/client/components/redirect";

const cookie = vi.hoisted(() => ({ token: null as string | null }));

vi.mock("next/headers", () => ({
    cookies: vi.fn(async () => ({
        get: (name: string) =>
            name === SESSION_COOKIE_NAME && cookie.token
                ? { name, value: cookie.token}
                : undefined,
    })),
}));

type UserRow = typeof users.$inferSelect;
type Role = UserRow["role"];

const OWNER_EMAIL = "roles-gates-owner@example.test";
const ADMIN_EMAIL = "roles-gates-admin@example.test";
const EMAIL_FOR: Record<Role, string> = { owner: OWNER_EMAIL, admin: ADMIN_EMAIL };

async function insertUser(email: string, role: Role): Promise<UserRow> {
    const [row] = await db
        .insert(users)
        .values({ email, passwordHash: "not-a-real-hash", role, mustChangePassword: false })
        .returning();
    return row;
}

async function signInAs(role: Role): Promise<void> {
    cookie.token = await createValidSession(EMAIL_FOR[role]);
}

async function redirectTarget(gate: () => Promise<unknown>): Promise<string | null> {
    try {
        await gate();
        return null;
    } catch (error) {
        if (isRedirectError(error)) return getURLFromRedirectError(error);
        throw error;
    }
}

const GATES = [
    { name: "requireOwner", gate: requireOwner, allowed: ["owner"] },
    { name: "requireAdminOnly", gate: requireAdminOnly, allowed: ["admin"] },
    { name: "requireOwnerOrAdmin", gate: requireOwnerOrAdmin, allowed: ["owner", "admin"] },
] as const satisfies readonly { name: string; gate: () => Promise<UserRow>; allowed: readonly Role[] }[];

const ROLES: Role[] = ["owner", "admin"];

beforeEach(async () => {
    cookie.token = null;
    await cleanupUsersByEmailPattern("%@example.test");
    await insertUser(OWNER_EMAIL, "owner");
    await insertUser(ADMIN_EMAIL, "admin");
});

describe.each(GATES)("$name", ({ gate, allowed }) => {
    it("redirects to /login with no session cookie", async () => {
        expect(await redirectTarget(gate)).toBe("/login");
    });

    it("redirects to /login when the token matches no session", async () => {
        cookie.token = "no-such-session-token";
        expect(await redirectTarget(gate)).toBe("/login");
    });

    it("redirects to /login when the session has expired", async () => {
        cookie.token = await createExpiredSession(OWNER_EMAIL);
        expect(await redirectTarget(gate)).toBe("/login");
    });

    for (const role of ROLES) {
        if ((allowed as readonly Role[]).includes(role)) {
            it(`returns the signed-in ${role}`, async () => {
                await signInAs(role);
                const user = await gate();
                expect(user.email).toBe(EMAIL_FOR[role]);
                expect(user.role).toBe(role);
            });
        } else {
            it(`redirects an ${role} to /unauthorized`, async () => {
                await signInAs(role);
                expect(await redirectTarget(gate)).toBe("/unauthorized");
            });
        }
    } 
});