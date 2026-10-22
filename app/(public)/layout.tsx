import { SiteHeader } from "../_components/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full flex-1 overflow-x-clip">
            <div className="mx-auto w-full max-w-[960px] flex-1 px-4 pb-20 pt-8 sm:px-10 sm:pt-12">
                <SiteHeader />
                <main>{children}</main>
            </div>
        </div>
    );
}