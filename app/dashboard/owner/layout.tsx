import { requireOwnerOrAdmin } from "@/lib/auth";
import { LogoutButton } from "../../_components/logout-button";
import { DashboardShell } from "@/app/_components/dashboard-shell";

export const instant = false;

const NAV_ITEMS = [
    { href: "/dashboard/owner", label: "Overview" },
    { href: "/dashboard/owner/account", label: "Account"}
] as const;

export default async function OwnerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireOwnerOrAdmin();

    return (
        <DashboardShell label="No. 001" title="Owner Dashboard" navItems={NAV_ITEMS} email={user.email}>
            {children}
        </DashboardShell>
    );
}