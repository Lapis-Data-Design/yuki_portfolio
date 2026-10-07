import "server-only";

import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { themePalettes } from "@/db/schema";
import { FALLBACK_THEME, THEME_CACHE_TAG, normalizeTokens, type ThemeTokens } from "./theme-tokens";

const loadActiveTheme = unstable_cache(
    async (): Promise<ThemeTokens | null> => {
        const [row] = await db
            .select()
            .from(themePalettes)
            .where(eq(themePalettes.isActive, true))
            .limit(1);
        
            return row ? normalizeTokens(row) : null;
    },
    ["active-theme"],
    { tags: [THEME_CACHE_TAG] },
);

export async function getTheme(): Promise<ThemeTokens> {
    try {
        return (await loadActiveTheme()) ?? FALLBACK_THEME;
    } catch (error) {
        console.error("[theme] falling back to default palette:", error);
        return FALLBACK_THEME;
    }
}