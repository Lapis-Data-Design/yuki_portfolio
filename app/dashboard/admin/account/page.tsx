import { requireAdminOnly } from "@/lib/auth";
import { AccountSettingsForm } from "@/app/_components/account-settings-form";
import { TempPasswordBanner } from "@/app/_components/temp-password-banner";

export default async function AdminAccountPage() {
    const user = await requireAdminOnly();

    return (
        <div>
            <p className="font-mono text-xs tracking-wide text-[#8C5A4E] mb-2">
                No. 000
            </p>
            <h1 className="font-sans text-2xl font-semibold text-[#2B2119] mb-6">
                Account Settings
            </h1>

            {user.mustChangePassword && <TempPasswordBanner />}

            <AccountSettingsForm currentEmail={user.email} />
        </div>
    );
}