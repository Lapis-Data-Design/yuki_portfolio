import { test, expect } from "@playwright/test";
import { TEST_ACCOUNTS } from "../fixtures/accounts";
import { login } from "../fixtures/auth-actions";

const ACTIVE_PALETTE = "Night City";

const HOME_FRAMES = [
    { name: "Photograph No. 001", href: "/photography/001" },
    { name: "Stop motion No. 002", href: "/stop-motion/002" },
    { name: "Video No. 003", href: "/video/003" },
    { name: "Video No. 005", href: "/video/005" },
    { name: "Photograph No. 007", href: "/photography/007" },
] as const;

const WORK = [
    { name: "Photography", href: "/photography", count: "24 frames" },
    { name: "Video", href: "/video", count: "6 frames" },
    { name: "Stop motion", href: "/stop-motion", count: "4 frames" },
] as const;

test.describe("owner overview", () => {
    test.beforeEach(async ({ page }) => {
        const { email, password } = TEST_ACCOUNTS.ownerOverview;
        await login(page, email, password);
        await expect(page).toHaveURL(/\/dashboard\/owner$/);
    });

    test("shows the Overview heading and only built pages in the nav", async ({ page }) => {
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Overview");
        await expect(page.getByRole("navigation").getByRole("link")).toHaveText(["Overview", "Account"]);
    });

    test("links the Home hero and selected frames to their detail pages", async ({ page }) => {
        const links = page.getByRole("region", { name: "On the home page" }).getByRole("link");
        await expect(links).toHaveCount(HOME_FRAMES.length);

        for (const [i, frame] of HOME_FRAMES.entries()) {
            await expect(links.nth(i)).toHaveAccessibleName(frame.name);
            await expect(links.nth(i)).toHaveAttribute("href", frame.href);
        }
    });

    test("lists each discipline with its frame count", async ({ page }) => {
        const items = page.getByRole("region", { name: "Work" }).getByRole("listitem");
        await expect(items).toHaveCount(WORK.length);

        for (const [i, discipline] of WORK.entries()) {
            const item = items.nth(i);
            await expect(item.getByRole("link", { name: discipline.name, exact: true }))
                .toHaveAttribute("href", discipline.href);
            await expect(item).toContainText(discipline.count);
        }
    });

    test("shows the active palette name and its six colors", async ({ page }) => {
        const palette = page.getByRole("region", { name: "Palette" });
        await expect(palette.getByText(ACTIVE_PALETTE, { exact: true })).toBeVisible();
        await expect(palette.getByRole("listitem")).toHaveCount(6);
    });
});