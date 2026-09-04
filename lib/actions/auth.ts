"use server";

import { redirect } from "next/navigation";
import { authenticateUser, createSession, clearSession } from "@/lib/auth";

function dashboardPathFor(role: "owner" | "admin"): string {
    return role === "owner" ? "/dashboard/owner" : "/dashboard/admin";
}

export async function loginAction(
    _prevState: { error: string | null },
    formData: FormData
): Promise<{ error: string | null }> {
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string" || !email || !password ) {
        return { error: "Email and password are required." };
    }

    const user = await authenticateUser(email, password);
    if (!user) {
        return { error: "Invalid email or password." };
    }

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