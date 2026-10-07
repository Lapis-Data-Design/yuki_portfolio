"use server";

import { db } from "@/db/client";
import { themePalettes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireOwnerOrAdmin } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { THEME_CACHE_TAG } from "../theme-tokens";

export async function activatePalette(paletteId: number) {
    await requireOwnerOrAdmin();

    await db.transaction(async (tx) => {
        await tx
            .update(themePalettes)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(themePalettes.isActive, true));

        const activated = await tx
            .update(themePalettes)
            .set({ isActive: true, updatedAt: new Date() })
            .where(eq(themePalettes.id, paletteId))
            .returning({ id: themePalettes.id });

        if (activated.length == 0) {
            throw new Error(`Palette ${paletteId} not found`);
        }
    });

    revalidateTag(THEME_CACHE_TAG, { expire: 0 } )
}
