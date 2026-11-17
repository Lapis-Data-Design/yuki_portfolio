import { requireOwner } from "@/lib/auth";
import { AccountSettingsPage } from "@/app/_components/account-settings-page";

export const instant = false;

export default async function OwnerAccountPage() {
    const user = await requireOwner();

    return <AccountSettingsPage frameLabel="No. 002" user={user} />
}