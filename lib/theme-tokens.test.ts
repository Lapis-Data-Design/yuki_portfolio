import { describe, it, expect } from "../tests/test-utils";
import {
    FALLBACK_THEME,
    THEME_ROLES,
    isDarkColor,
    normalizeTokens,
    themeToStyle,
} from "./theme-tokens";

const WARM = { 
    background: "#E8DEC6",
    textPrimary: "#2B2119",
    accentPrimary: "#A6472B",
    accentSecondary: "#C08A2E",
    accentTertiary: "#5C6440",
    accentSoft: "#8C5A4E",
}

describe("normalizeTokens", () => {
    it("returns a valid palette unchanged", () => {
        expect(normalizeTokens(WARM)).toEqual(WARM);
    });

    it("accepts a full DB row and ignores the extra columns", () => {
        const row = { id: 1, name: "Darkroom warm", isActive: true, ...WARM };
        expect(normalizeTokens(row)).toEqual(WARM);
    });

    it("falls back for null input", () => {
        expect(normalizeTokens(null)).toEqual(FALLBACK_THEME);
    });

    it("returns a copy, not the shared fallback object", () => {
        expect(normalizeTokens(null)).not.toBe(FALLBACK_THEME);
    })
});

describe("isDarkColor", () => {
    it("classifies the two known backgrounds", () => {
        expect(isDarkColor("#17140F")).toBe(true);
        expect(isDarkColor("#E8DEC6")).toBe(false);
    });
});

describe("themeToStyle", () => {
    it("writes one --theme-* variable per role", () => {
        const style = themeToStyle(WARM) as Record<string, string>;
        const vars = Object.keys(style).filter((k) => k.startsWith("--theme-"));
        expect(vars).toHaveLength(THEME_ROLES.length);
        expect(style["--theme-accent-secondary"]).toBe("#C08A2E")
        expect(style["--theme-text-primary"]).toBe("#2B2119")
    });

    it("sets color-scheme from the background", () => {
        expect(themeToStyle(FALLBACK_THEME).colorScheme).toBe("dark");
        expect(themeToStyle(WARM).colorScheme).toBe("light");
    });
});