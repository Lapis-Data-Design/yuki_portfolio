"use server";

import { db } from "@/db/client";
import { themePalettes } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { requireOwnerOrAdmin } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { THEME_CACHE_TAG } from "../theme-tokens";

export async function activatePalette(paletteId: number) {
    await requireOwnerOrAdmin();

    const now = new Date();

    const [, activated] = await db.batch([
        db
            .update(themePalettes)
            .set({ isActive: false, updatedAt: now})
            .where(
                and(
                    eq(themePalettes.isActive, true),
                    sql`exists (select 1 from ${themePalettes} where ${themePalettes.id} = ${paletteId})`,
                ),
            ),
        db
            .update(themePalettes)
            .set({ isActive: true, updatedAt: now })
            .where(eq(themePalettes.id, paletteId))
            .returning({ id: themePalettes.id })
    ]);
    
    if (activated.length == 0) {
        throw new Error(`Palette ${paletteId} not found`);
    }

    revalidateTag(THEME_CACHE_TAG, { expire: 0 } )
}
