import { requireOwner } from "@/lib/auth";
import { LogoutButton } from "../../_components/logout-button";

const NAV_ITEMS = [
    { href: "/dashboard/owner", label: "Overview" },
    { href: "/dashboard/owner/frames", label: "Frames" },
    { href: "/dashboard/owner/palettes", label: "Palettes" },
    { href: "/dashboard/owner/projects", label: "Projects" },
    { href: "/dashboard/owner/account", label: "Account"}
] as const;

export default async function OwnerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireOwner();

    return (
        <div className="min-h-screen bg-[#E8DEC6] flex">
            <aside className="w-56 shrink-0 border-r border-[#2B2119]/15 px-6 py-8 flex flex-col justify-between">
                <div>
                    <p className="font-mono text-xs tracking-wide text-[#8C5A4E] mb-1">
                        No. 001
                    </p>
                    <p className="font-sans text-lg font-semibold text-[#2B2119] mb-8">
                        Owner Dashboard
                    </p>
                    <nav className="space-y-3">
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="block font-serif text-sm text-[#2B2119] hover:text-[#A6472B] transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </div>

                <div>
                    <p className="font-serif text-xs text-[#8C5A4E] mb-2">
                        {user.email}
                    </p>
                    <LogoutButton />
                </div>
            </aside>

            <main className="flex-1 px-10 py-8">{children}</main>
        </div>
    );
}