export default function AdminDashboardHome() {
    return (
        <div>
            <p className="font-mono text-xs tracking-wide text-accent-soft mb-2">
                Roll 00A
            </p>
            <h1 className="font-sans text-2xl font-semibold text-text-primary mb-4">
                Admin Dashboard
            </h1>
            <p className="font-serif text-text-primary max-w-md">
                    Site health, deploy status, and storage usage will surface here.
                    Placeholder for now — real infrastructure access still lives in
                    Vercel, Neon, and Cloudflare directly.
            </p>
        </div>
    );
}