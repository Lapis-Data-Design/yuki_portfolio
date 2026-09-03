"use server";

import { redirect } from "next/navigation";
import { authenticateUser, createSession, clearSession } from "@/lib/auth";

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

    redirect(user.role === "owner" ? "/dashboard/owner" : "/dashboard/admin" );
}

export async function logoutAction(): Promise<void> {
    await clearSession();
    redirect("/login");
}