import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
    return (
        <form action={logoutAction}>
            <button 
                type="submit"
                className="font-mono text-xs tracking-wide text-accent-soft hover:text-accent-primary transition-colors"
            >
                Log out
            </button>
        </form>
    );
}