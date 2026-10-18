"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type PhotoKeysProps = {
    previousHref: string | null;
    nextHref: string | null;
    backHref: string;
};

export function PhotoKeys({ previousHref, nextHref, backHref }: PhotoKeysProps) {
    const router = useRouter();

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

            const target = event.target as HTMLElement | null;
            if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

            const href =
                event.key === "ArrowLeft" ? previousHref
                : event.key === "ArrowRight" ? nextHref
                : event.key === "Escape" ? backHref
                : null;
            if (!href) return;

            event.preventDefault();
            router.push(href);
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [router, previousHref, nextHref, backHref]);

    return null;
}
