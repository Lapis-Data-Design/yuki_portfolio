import { FALLBACK_THEME } from "../lib/theme-tokens";
import { loadScriptEnv, runScript } from "./_lib/script-env";

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
    loadScriptEnv({ allowTestBranch: true });

    const { db } = await import("../db/client");
    const { themePalettes } = await import("../db/schema");
    const { and, eq, sql } = await import("drizzle-orm");

    const now = new Date();

    const [inserted, , activated] = await db.batch([ 
        db
            .insert(themePalettes)
            .values(PALETTES.map((palette) => ({ ...palette, isActive: false})))
            .onConflictDoNothing({ target: themePalettes.name })
            .returning({ id: themePalettes.id, name: themePalettes.name }),
        db
            .update(themePalettes)
            .set({ isActive: false, updatedAt: now })
            .where(
                and(
                    eq(themePalettes.isActive, true),
                    sql`exists (select 1 from ${themePalettes} where ${themePalettes.name} = ${ACTIVE_PALETTE})`,
                ),
            ),
        db
            .update(themePalettes)
            .set({ isActive: true, updatedAt: now })
            .where(eq(themePalettes.name, ACTIVE_PALETTE))
            .returning({ id: themePalettes.id, name: themePalettes.name }),
    ]);

    const insertedNames = new Set(inserted.map((row) => row.name));
    for (const palette of PALETTES) {
        console.log(
            insertedNames.has(palette.name)
                ? `Inserted palette "${palette.name}"`
                : `Palette "${palette.name}" already exists, left unchanged`,
        );
    }

    if (activated.length === 0) {
        throw new Error(`Palette "${ACTIVE_PALETTE}" not found; nothing activated`);
    }
    console.log(`Active palette: "${ACTIVE_PALETTE}"`);
    
}

runScript(seedPalettes);