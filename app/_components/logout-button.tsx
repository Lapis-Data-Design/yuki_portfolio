import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
    return (
        <form action={logoutAction}>
            <button 
                type="submit"
                className="font-mono text-xs tracking-wide text-[#8C5A4E] hover:text-[#A6472B] transition-colors"
            >
                Log out
            </button>
        </form>
    );
}