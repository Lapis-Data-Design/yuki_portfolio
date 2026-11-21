import { LogoutButton } from "./logout-button";

type NavItem = { readonly href: string; readonly label: string};

export function DashboardShell({
    label,
    title,
    navItems,
    email,
    children,
}: {
    label: string;
    title: string;
    navItems: readonly NavItem[];
    email: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            <aside className="shrink-0 border-b border-text-primary/15 px-4 py-6 flex flex-col gap-6 md:w-56 md:border-b-0 md:border-r md:px-6 md:py-8 md:justify-between">
                <div>
                    <p className="font-mono text-xs tracking-wide text-accent-soft mb-1">
                        {label}
                    </p>
                    <p className="font-sans text-lg font-semibold text-text-primary mb-4 md:mb-8">
                        {title}
                    </p>
                    <nav className="flex flex-wrap gap-x-6 gap-y-2 md:block md:space-y-3">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="block font-serif text-sm text-text-primary hover:text-accent-secondary transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 md:block">
                    <p className="font-serif text-xs text-accent-soft break-all md:mb-2">
                        {email}
                    </p>
                    <LogoutButton />
                </div>
            </aside>
            
            <main className="flex-1 min-w-0 px-4 py-8 md:px-10"> {children} </main>
        </div>
    );
}