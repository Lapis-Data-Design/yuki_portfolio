import { requireAdminOnly } from "@/lib/auth";
import { AccountSettingsForm } from "@/app/_components/account-settings-form";
import { TempPasswordBanner } from "@/app/_components/temp-password-banner";

export default async function AdminAccountPage() {
    const user = await requireAdminOnly();

    return (
        <div>
            <p className="font-mono text-xs tracking-wide text-accent-soft mb-2">
                No. 000
            </p>
            <h1 className="font-sans text-2xl font-semibold text-text-primary mb-6">
                Account Settings
            </h1>

            {user.mustChangePassword && <TempPasswordBanner />}

            <AccountSettingsForm currentEmail={user.email} />
        </div>
    );
}