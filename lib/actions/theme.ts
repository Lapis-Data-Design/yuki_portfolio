"use server";

import { db } from "@/db/client";
import { themePalettes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireOwner } from "@/lib/auth";

export async function activatePalette(paletteId: number) {
    await requireOwner();

    await db.transaction(async (tx) => {
        await tx
            .update(themePalettes)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(themePalettes.isActive, true));

        await tx
            .update(themePalettes)
            .set({ isActive: true, updatedAt: new Date() })
            .where(eq(themePalettes.id, paletteId));
    })
}
