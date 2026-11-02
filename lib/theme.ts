import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { themePalettes } from "@/db/schema";
import { FALLBACK_THEME, THEME_CACHE_TAG, normalizeTokens, type ThemeTokens } from "./theme-tokens";



export async function getTheme(): Promise<ThemeTokens> {
    "use cache";
    cacheTag(THEME_CACHE_TAG);

    try {
        const [row] = await db
            .select()
            .from(themePalettes)
            .where(eq(themePalettes.isActive, true))
            .limit(1);

        const tokens = row ? normalizeTokens(row) : null;
        if (tokens) {
            cacheLife("max");
            return tokens;
        }

        cacheLife("minutes");
        return FALLBACK_THEME;
        
    } catch (error) {
        console.error("[theme] falling back to default palette:", error);
        cacheLife("minutes");
        return FALLBACK_THEME;
    }
}

export async function getActivePaletteName(): Promise<string | null> {
    "use cache";
    cacheTag(THEME_CACHE_TAG);

    try {
        const [row] = await db
            .select()
            .from(themePalettes)
            .where(eq(themePalettes.isActive, true))
            .limit(1);

        if (row && normalizeTokens(row)) {
            cacheLife("max");
            return row.name;
        }

        cacheLife("minutes");
        return null;
    } catch (error) {
        console.error("[theme] counld not read the active palette name:", error);
        cacheLife("minutes");
        return null;
    }
} 