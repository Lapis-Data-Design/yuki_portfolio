"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authenticateUser, createSession, clearSession, dashboardPathFor } from "@/lib/auth";
import { clearThrottle, lockedMinutes, recordLoginFailure } from "../login-throttle";
import { 
    INVALID_CREDENTIALS_MESSAGE,
    clientIpFrom,
    emailThrottleKey,
    ipThrottleKey,
    lockoutMessage
} from "../login-throttle-policy";

export async function loginAction(
    _prevState: { error: string | null },
    formData: FormData
): Promise<{ error: string | null }> {
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string" || !email || !password ) {
        return { error: "Email and password are required." };
    }

    const requestHeaders = await headers();
    const keys = { 
        email: emailThrottleKey(email),
        ip: ipThrottleKey(
            clientIpFrom(requestHeaders.get("x-forwarded-for"), requestHeaders.get("x-real-ip"))
        ),
    };

    const locked = await lockedMinutes([keys.email, keys.ip]);
    if (locked !== null) {
        return { error: lockoutMessage(locked) };
    }

    const user = await authenticateUser(email, password);
    if (!user) {
        const nowLocked = await recordLoginFailure(keys);

        return { 
            error: nowLocked !== null ? lockoutMessage(nowLocked) : INVALID_CREDENTIALS_MESSAGE, 
        };
    }

    await clearThrottle(keys.email);
    await createSession(user.id);

    if (user.mustChangePassword) {
        redirect("/change-password");
    }

    redirect(dashboardPathFor(user.role));
}

export async function logoutAction(): Promise<void> {
    await clearSession();
    redirect("/login");
}