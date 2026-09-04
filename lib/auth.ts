import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { hash, compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, sessions, type roles } from "@/db/schema";

const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const BCRYPT_ROUNDS = 12;

type Role = (typeof roles)[number];

// ---- Passwords ---------------------------------------

export async function hashPassword(password: string): Promise<string> {
    return hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
    password: string,
    passwordHash: string
): Promise<boolean> {
    return compare(password, passwordHash);
}

// ---- Credential check (no session side effect) ------

export async function authenticateUser(
    email: string,
    password: string
): Promise<typeof users.$inferSelect | null> {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

        if (!user) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;
        
        return user;
}

// ---- Session creation / clearing ----------------------

function generateToken(): string {
    return randomBytes(32).toString("hex");
}

export async function createSession(userId: number): Promise<void> {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await db.insert(sessions).values({
        id: token,
        userId,
        expiresAt,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
    });
}

export async function clearSession(): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    
    if (token) {
        await db.delete(sessions).where(eq(sessions.id, token));
    }

    cookieStore.delete(SESSION_COOKIE);
}

// ---- Session lookup ------------------------------------------

export async function getSession(): Promise<{
    user: typeof users.$inferSelect;
} | null > {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const [row] = await db
        .select({ session: sessions, user: users })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.id, token))
        .limit(1);

    if (!row) return null;

    if (row.session.expiresAt < new Date()) {
        // Clean up expired sessoin from table
        await db.delete(sessions).where(eq(sessions.id, token));
        cookieStore.delete(SESSION_COOKIE);
        return null;
    }

    return { user: row.user };
}

// ---- Role gates, for use at top of Server Actions ----------------

async function requireRole(role: Role) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== role) {
        redirect("/login");
    }

    return session.user;
}

export async function requireOwner() {
    return requireRole("owner");
}

export async function requireAdmin() {
    return requireRole("admin");
}

export async function requireUser() {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }
    return session.user;
}

export function dashboardPathFor(role: "owner" | "admin"): string {
    return role === "owner" ? "/dashboard/owner" : "/dashboard/admin";
}

// ---- Account changes (email / password) ------------------

export function generateTempoeraryPassword(): string {
    return randomBytes(12).toString("base64url");
};

export async function updateUserEmail(
    userId: number,
    newEmail: string
): Promise<{ success: true } | { success: false; error: string }> {
    const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, newEmail))
        .limit(1);

        if (existing && existing.id !== userId) {
            return { success: false, error: "That email is already in use." };
        }

        await db.update(users).set({ email: newEmail }).where(eq(users.id, userId));
        return { success: true };
}

export async function updateUserPassword(
    userId: number,
    currentPassword: string,
    newPassword: string
): Promise<{ success: true } | { success: false; error: string }> {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const valid = await verifyPassword(currentPassword, user.passwordHash);
        if (!valid) {
            return { success: false,  error: "Current password is incorrect." };
        }

        if (newPassword.length < 8) {
            return { success: false,  error: "New password must be at leadt 8 characters." };
        }

        const newHash = await hashPassword(newPassword);

        await db
            .update(users)
            .set({passwordHash: newHash, mustChangePassword: false })
            .where(eq(users.id, userId));
        
        return { success: true }; 
}
