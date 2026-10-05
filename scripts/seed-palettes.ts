import { config } from "dotenv";
import { FALLBACK_THEME } from "../lib/theme-tokens";
import { text } from "stream/consumers";

config({ path: "env.local" });

const ACTIVE_PALETTE = "Night City";

const PALETTES = [
    {
        name: "Night City",
        ...FALLBACK_THEME
    },
    {
        name: "Darkroom warm",
        background: "#E8DEC6",
        textPrimary: "#2B2119",
        accentPrimary: "#A6472B",
        accentSecondary: "#C08A2E",
        accentTertiary: "#5C6440",
        accentSoft: "#8C5A4E",
    },
]

async function seedPalettes() {
    const { db } = await import("../db/client");
    const { themePalettes } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    await db.transaction(async (tx) => {
        for (const palette of PALETTES) {
            const inserted = await tx
                .insert(themePalettes)
                .values({ ...palette, isActive: false })
                .onConflictDoNothing({ target: themePalettes.name })
                .returning({ id: themePalettes.id });

            console.log(
                inserted.length > 0
                ? `Inserted palette "${palette.name}"`
                : `Palette "${palette.name}" already exists, left unchanged`,
            );
        }
        
        await tx
        .update(themePalettes)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(themePalettes.isActive, true));
        
        const activated = await tx
        .update(themePalettes)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(themePalettes.name, ACTIVE_PALETTE))
        .returning({ id: themePalettes.id });
        
        if (activated.length === 0) {
            throw new Error(`Palette "${ACTIVE_PALETTE}" not found; nothing activated`);
        }
        console.log(`Active palette: "${ACTIVE_PALETTE}"`);
    });
}

seedPalettes()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });