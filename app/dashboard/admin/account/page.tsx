import { requireAdminOnly } from "@/lib/auth";
import { AccountSettingsPage } from "@/app/_components/account-settings-page";

export const instant = false;

export default async function AdminAccountPage() {
    const user = await requireAdminOnly();

    return <AccountSettingsPage frameLabel="Roll 00B" user={user} />
}