import { redirect } from "next/navigation";
import { requireUser, dashboardPathFor } from "@/lib/auth";
import { ChangePasswordForm } from "./change-password-form";

export default async function ChangePasswordPage() {
    const user = await requireUser();

    if (!user.mustChangePassword) {
        redirect(dashboardPathFor(user.role));
    }

    return (
        <main className="min-h-screen bg-background flex items-center px-8 md:px-16">
            <div className="w-full max-w-sm">
                <p className="font-mono text-xs tracking-wide text-accent-soft mb-2">
                    No. 000
                </p>
                <h1 className="font-sans text-3xl font-semibold text-text-primary mb-3">
                    Set your password
                </h1>
                <p className="font-serif text-sm text-text-primary mb-8">
                    You&apos;re still using a temporary password. Choose your own to
                    continue, or skip for now — you&apos;ll be asked again next time
                    you log in.
                </p>

                <ChangePasswordForm dashboardPath={dashboardPathFor(user.role)} />
            </div>
        </main>
    )
}