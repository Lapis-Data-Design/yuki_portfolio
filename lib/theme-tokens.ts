import type { CSSProperties } from "react";

export const THEME_CACHE_TAG = "theme";

export const THEME_ROLES = [
    "background",
    "textPrimary",
    "accentPrimary",
    "accentSecondary",
    "accentTertiary",
    "accentSoft",
] as const;

export type ThemeRole = (typeof THEME_ROLES)[number];
export type ThemeTokens = Record<ThemeRole, string>;

export const THEME_CSS_VAR: Record<ThemeRole, `--theme-${string}`> = {
    background: "--theme-background",
    textPrimary: "--theme-text-primary",
    accentPrimary: "--theme-accent-primary",
    accentSecondary: "--theme-accent-secondary",
    accentTertiary: "--theme-accent-tertiary",
    accentSoft: "--theme-accent-soft",
};

export const FALLBACK_THEME: ThemeTokens = {
    background: "#17140F", // asphalt
    textPrimary: "#E9DFC8", // vapor cream
    accentPrimary: "#C1272D", // harsh red: frame counts, iris arc, buttons, focus
    accentSecondary: "#C97C2E", // sodium amber
    accentTertiary: "#9AAA3C", // sickly neon
    accentSoft: "#46535B", // rain-slick: captions, hover fills
};

const HEX = /^#[0-9a-f]{6}$/i;

export function normalizeTokens(
    input: Partial<Record<ThemeRole, unknown>> | null | undefined,
): ThemeTokens {
    if (!input) return { ...FALLBACK_THEME };

    const out = {} as ThemeTokens;
    for (const role of THEME_ROLES) {
        const value = input[role];
        if (typeof value !== "string" || !HEX.test(value)) return { ...FALLBACK_THEME};
        out[role] = value;
    }
    return out;
}

function relativeLuminance(hex: string): number {
    const [r, g, b] = [1, 3, 5].map((i) => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** True for dark backgrounds like asphalt, false for light ones like darkroom cream. */
export function isDarkColor(hex: string): boolean {
    return relativeLuminance(hex) < 0.18;
}

export function themeToStyle(tokens: ThemeTokens): CSSProperties {
    const style: Record<string, string> = {
        colorScheme: isDarkColor(tokens.background) ? "dark" : "light",
    };

    for (const role of THEME_ROLES) {
        style[THEME_CSS_VAR[role]] = tokens[role];
    }

    return style as CSSProperties;
}