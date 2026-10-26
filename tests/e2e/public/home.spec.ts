import { expect, test } from "@playwright/test";
import { SITE } from "@/lib/site";

const HERO = { label: "No. 001", name: "Photograph No. 001", href: "/photography/001" };
const SELECTED = [
    { label: "No. 002", name: "Stop motion No. 002", href: "/stop-motion/002" },
    { label: "No. 003", name: "Video No. 003", href: "/video/003" },
    { label: "No. 005", name: "Video No. 005", href: "/video/005" },
    { label: "No. 007", name: "Photograph No. 007", href: "/photography/007" },
];

test("home uses the site name as its tab title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(SITE.name);
});

test("home shows the hero frame and the featured frames from the database", async ({ page }) => {
    await page.goto("/");

    const selected = page.getByRole("region", { name: "Selected frames" });
    await expect(selected.getByRole("figure")).toHaveText(SELECTED.map((frame) => frame.label));

    await expect(page.getByRole("figure")).toHaveCount(SELECTED.length + 1);
    await expect(page.getByRole("figure").first()).toHaveText(HERO.label);
    await expect(selected.getByText(HERO.label)).toHaveCount(0);
});

test("home links the hero and each selected frame to its detail page", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: HERO.name, exact: true })).toHaveAttribute("href", HERO.href);

    const links = page.getByRole("region", { name: "Selected frames" }).getByRole("link");
    await expect(links).toHaveCount(SELECTED.length);
    for (const [i, frame] of SELECTED.entries()) {
        await expect(links.nth(i)).toHaveAccessibleName(frame.name);
        await expect(links.nth(i)).toHaveAttribute("href", frame.href);
    }
});

test("the hero link opens its detail page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: HERO.name, exact: true }).click();
    await expect(page).toHaveURL(/\/photography\/001$/);
    await expect(page.getByText("1 / 24")).toBeVisible();
});