import { requireAdmin } from "@/lib/auth";
import { LogoutButton } from "../_components/logout-button";

export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireAdmin();

    return (
        <div className="min-h-screen bg-[#E8DEC6] flex">
            <aside className="w-56 shrink-0 border-r border-[#2B2119]/15 px-6 py-8 flex flex-col justify-between">
                <div>
                    <p className="font-mono text-xs tracking-wide text-[#8C5A4E] mb-1">
                        No. 000
                    </p>
                    <p className="font-sans text-lg font-semibold text-[#2B2119] mb-8">
                        Admin dashboard
                    </p>
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