import { pgTable, serial, text, integer, timestamp, boolean, jsonb, varchar, check, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ----- Enums -----------------------------------

export const roles = ["admin", "owner"] as const;
export const discipline = ["photo", "video", "stop_motion"] as const;

// ----- Auth ------------------------------------

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: roles }).notNull(),
    mustChangePassword: boolean("must_change_password").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const sessions = pgTable("sessions", {
    id: varchar("id", { length: 255 }).primaryKey(), // session token
    userId: integer("user_id").notNull().references(() => users.id ),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const loginThrottle = pgTable("login_throttle", {
    key: text("key").primaryKey(),
    failures: integer("failures").notNull().default(0),
    windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull().defaultNow(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
})

// ----- Content ---------------------------------

export const projects = pgTable("projects", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: varchar("slug", { length: 128 }).notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const frames = pgTable("frames", {
        id: serial("id").primaryKey(),
        discipline: text("discipline", { enum: discipline }).notNull(),
        frameNumber: varchar("frame_number", { length: 32 }).notNull(),
        rollTag: varchar("roll_tag", { length: 32 }),
        title: text("title"),
        caption: text("caption"),
        imageUrl: text("image_url"),
        streamVideoId: text("stream_video_id"),
        projectId: integer("project_id").references(() => projects.id),
        displayOrder: integer("display_order").notNull().default(0),
        featuredOnHome: boolean("featured_on_home").notNull().default(false),
        isHero: boolean("is_hero").notNull().default(false),
        createdAt: timestamp("created_at").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("frames_discipline_frame_number_unique").on(table.discipline, table.frameNumber),
        uniqueIndex("only_one_hero_frame")
            .on(table.isHero)
            .where(sql`${table.isHero} = true`),
    ],
);

// ----- Theming ---------------------------------

const hexColor = (name: string) => varchar(name, { length: 7 });

export const themePalettes = pgTable(
    "theme_palettes",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 64 }).notNull().unique(),
        isActive: boolean("is_active").notNull().default(false),
        background: hexColor("background").notNull(),
        textPrimary: hexColor("text_primary").notNull(),
        accentPrimary: hexColor("accent_primary").notNull(),
        accentSecondary: hexColor("accent_secondary").notNull(),
        accentTertiary: hexColor("accent_tertiary").notNull(),
        accentSoft: hexColor("accent_soft").notNull(),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => [
        check("background_is_hex", sql`${table.background} ~ '^#[0-9A-Fa-f]{6}$'`),
        check("text_primary_is_hex", sql`${table.textPrimary} ~ '^#[0-9A-Fa-f]{6}$'`),
        check("accent_primary_is_hex", sql`${table.accentPrimary} ~ '^#[0-9A-Fa-f]{6}$'`),
        check("accent_secondary_is_hex", sql`${table.accentSecondary} ~ '^#[0-9A-Fa-f]{6}$'`),
        check("accent_tertiary_is_hex", sql`${table.accentTertiary} ~ '^#[0-9A-Fa-f]{6}$'`),
        check("accent_soft_is_hex", sql`${table.accentSoft} ~ '^#[0-9A-Fa-f]{6}$'`),
        uniqueIndex("only_one_active_palette")
            .on(table.isActive)
            .where(sql`${table.isActive} = true`),
    ]
);

export const themeSettings = pgTable("theme_settings", {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 64 }).notNull().unique(), // e.g. "font-dispaly", "show_iris_divider"
    value: jsonb("value").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});