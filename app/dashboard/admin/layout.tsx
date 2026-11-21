import { requireAdminOnly } from "@/lib/auth";
import { DashboardShell } from "@/app/_components/dashboard-shell";

export const instant = false;

const NAV_ITEMS = [
    { href: "/dashboard/admin", label: "Overview"},
    { href: "/dashboard/admin/account", label: "Account"}
]

export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireAdminOnly();

    return (
        <DashboardShell label="No. 000" title="Admin Dashboard" navItems={NAV_ITEMS} email={user.email}>
            {children}
        </DashboardShell>
    );
}