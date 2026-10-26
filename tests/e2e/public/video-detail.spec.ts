import { expect, test } from "@playwright/test";

const TOTAL = 6;
const FIRST = "001";
const LAST = "006";

const detailHeading = (frameNumber: string) => ({ level: 1, name: `Video No. ${frameNumber}` }) as const;

test("clicking a frame in the reel strip opens that video", async ({ page }) => {
    await page.goto("/video");

    await page
        .getByRole("list", { name: "Videos" })
        .getByRole("link", { name: "Video No. 003"})
        .click();

    await expect(page).toHaveURL(/\/video\/003$/);
    await expect(page).toHaveTitle(/Video No.\ 003/);
    await expect(page.getByRole("heading", detailHeading("003"))).toBeVisible();
    await expect(page.getByText(`3 / ${TOTAL}`, { exact: true })).toBeVisible();
});

test("next and previous follow the strip order", async ({ page }) => {
    await page.goto("/video/003");

    await page.getByRole("link", { name: "Next video" }).click();
    await expect(page).toHaveURL(/\/video\/004$/);
    await expect(page.getByRole("heading", detailHeading("004"))).toBeVisible();

    await page.getByRole("link", { name: "Previous video"}).click();
    await expect(page).toHaveURL(/\/video\/003$/);
    await expect(page.getByRole("heading", detailHeading("003"))).toBeVisible();
    
    await page.getByRole("link", { name: "Previous video"}).click();
    await expect(page).toHaveURL(/\/video\/002$/);
    await expect(page.getByRole("heading", detailHeading("002"))).toBeVisible();
});

test("the first video has no previous and the last has no next", async ({ page }) => {
    await page.goto(`/video/${FIRST}`);
    await expect(page.getByRole("heading", detailHeading(FIRST))).toBeVisible();
    await expect(page.getByRole("link", {name: "Previous video" })).toHaveCount(0);
    await expect(page.getByRole("link", {name: "Next video" })).toBeVisible();
    
    await page.goto(`/video/${LAST}`);
    await expect(page.getByRole("heading", detailHeading(LAST))).toBeVisible();
    await expect(page.getByRole("link", {name: "Previous video" })).toBeVisible();
    await expect(page.getByRole("link", {name: "Next video" })).toHaveCount(0);
});

test("arrow keys step through videos and Escape returns to the strip", async({ page }) => {
    await page.goto("/video/003", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", detailHeading("003"))).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/video\/004$/);

    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\/video\/003$/);

    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/video$/);
});

test("the back link returns to the strip", async ({ page }) => {
    await page.goto("/video/003");

    await page.getByRole("main").getByRole("link", { name: "video", exact: true }).click();

    await expect(page).toHaveURL(/\/video$/);
    await expect(page.getByRole("heading", { level: 1, name: "Video" })).toBeVisible();
});

test("an unknown frame number shows the not-found page and isn't indexed", async ({ page }) => {
    await page.goto("/video/999");

    await expect(page.getByText("This page could not be found.")).toBeVisible();
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
    await expect(page.getByRole("heading", detailHeading("999"))).toHaveCount(0);
});