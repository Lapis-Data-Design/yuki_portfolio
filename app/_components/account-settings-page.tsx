import { AccountSettingsForm } from "./account-settings-form";
import { TempPasswordBanner } from "./temp-password-banner";

type AccountSettingsPageProps = {
    frameLabel: string;
    user: { email: string; mustChangePassword: boolean };
};

export function AccountSettingsPage({ frameLabel, user }: AccountSettingsPageProps) {
    return (
        <div>
            <p className="font-mono text-xs tracking-wide text-text-primary mb-2">
                {frameLabel}
            </p>
            <h1 className="font-sans text-2xl font-semibold text-text-primary mb-6">
                Account Settings
            </h1>

            {user.mustChangePassword && <TempPasswordBanner />}

            <AccountSettingsForm currentEmail={user.email} />
        </div>
    );
}
