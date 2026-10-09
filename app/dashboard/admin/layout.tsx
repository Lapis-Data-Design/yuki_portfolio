import { requireAdminOnly } from "@/lib/auth";
import { LogoutButton } from "../../_components/logout-button";

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
        <div className="min-h-screen bg-background flex">
            <aside className="w-56 shrink-0 border-r border-text-primary/15 px-6 py-8 flex flex-col justify-between">
                <div>
                    <p className="font-mono text-xs tracking-wide text-accent-soft mb-1">
                        No. 000
                    </p>
                    <p className="font-sans text-lg font-semibold text-text-primary mb-8">
                        Admin dashboard
                    </p>
                    <nav className="space-y-3"> 
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                 className="block font-serif text-sm text-text-primary hover:text-accent-primary transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </div>

                <div>
                    <p className="font-serif text-xs text-accent-soft mb-2">
                        {user.email}
                    </p>
                    <LogoutButton />
                </div>
            </aside>

            <main className="flex-1 px-10 py-8">{children}</main>
        </div>
    );
}