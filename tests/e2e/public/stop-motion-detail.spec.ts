import { expect, test } from "@playwright/test";

const TOTAL = 4;
const FIRST = "001";
const LAST = "004";

const detailHeading = (frameNumber: string) => ({ level: 1, name: `Stop motion No. ${frameNumber}` }) as const;

test("clicking a frame in the reel strip opens that clip", async ({ page }) => {
    await page.goto("/stop-motion");

    await page
        .getByRole("list", { name: "Stop motion", exact: true })
        .getByRole("link", { name: "Stop motion No. 002", exact: true })
        .click();

    await expect(page).toHaveURL(/\/stop-motion\/002$/);
    await expect(page).toHaveTitle(/Stop motion No\. 002/);
    await expect(page.getByRole("heading", detailHeading("002"))).toBeVisible();
    await expect(page.getByText(`2 / ${TOTAL}`, { exact: true })).toBeVisible();
});

test("next and previous follow the strip order", async ({ page }) => {
    await page.goto("/stop-motion/002");

    await page.getByRole("link", { name: "Next stop motion"}).click();
    await expect(page).toHaveURL(/\/stop-motion\/003$/);
    await expect(page.getByRole("heading", detailHeading("003"))).toBeVisible();
    
    await page.getByRole("link", { name: "Previous stop motion"}).click();
    await expect(page).toHaveURL(/\/stop-motion\/002$/);
    await expect(page.getByRole("heading", detailHeading("002"))).toBeVisible();
    
    await page.getByRole("link", { name: "Previous stop motion"}).click();
    await expect(page).toHaveURL(/\/stop-motion\/001$/);
    await expect(page.getByRole("heading", detailHeading("001"))).toBeVisible();
});

test("the first clip has no previous and the last has no next", async ({ page }) => {
    await page.goto(`/stop-motion/${FIRST}`);
    await expect(page.getByRole("heading", detailHeading(FIRST))).toBeVisible();
    await expect(page.getByRole("link", { name: "Previous stop motion"})).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Next stop motion"})).toBeVisible();
   
    await page.goto(`/stop-motion/${LAST}`);
    await expect(page.getByRole("heading", detailHeading(LAST))).toBeVisible();
    await expect(page.getByRole("link", { name: "Previous stop motion"})).toBeVisible();
    await expect(page.getByRole("link", { name: "Next stop motion"})).toHaveCount(0);
});

test("arrow keys step through clips and Escape returns to the strip", async ({ page }) => {
    await page.goto("/stop-motion/002", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", detailHeading("002"))).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/stop-motion\/003$/);
    
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\/stop-motion\/002$/);
    
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/stop-motion$/);
});

test("the back link returns to the strip", async ({ page }) => {
    await page.goto("/stop-motion/002");

    await page.getByRole("main").getByRole("link", { name: "stop motion", exact: true }).click();

    await expect(page).toHaveURL(/\/stop-motion$/);
    await expect(page.getByRole("heading", { level: 1, name: "Stop motion" })).toBeVisible();
});

test("an unknown frame number shows the not-found page and isn't indexed", async ({ page }) => {
    await page.goto("/stop-motion/999");

    await expect(page.getByText("This page could not be found.")).toBeVisible();
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
    await expect(page.getByRole("heading", detailHeading("999"))).toHaveCount(0);
})