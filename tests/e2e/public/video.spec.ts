import { expect, test } from "@playwright/test";

const SEEDED_VIDEOS = ["001", "002", "003", "004", "005", "006"].map((n)=> `No. ${n}`);

test("video shows the reel in order and the header count matches the strip", async ({ page }) => {
    await page.goto("/video");

    await expect(page.getByRole("heading", { level: 1, name: "Video" })).toBeVisible();
    await expect(page.getByText(/^\d+ frames?$/)).toHaveText(`${SEEDED_VIDEOS.length} frames`);

    const strip = page.getByRole("list", { name: "Videos" });
    await expect(strip.getByRole("listitem")).toHaveCount(SEEDED_VIDEOS.length);
    await expect(strip.getByText(/^No\. \d+$/)).toHaveText(SEEDED_VIDEOS);
});

test("each strip frame links to its own detail page", async ({ page }) => {
    await page.goto("/video");
    const strip = page.getByRole("list", { name: "Videos" });

    await expect(strip.getByRole("link")).toHaveCount(SEEDED_VIDEOS.length);
    for (const label of SEEDED_VIDEOS) {
        const frameNumber = label.replace("No. ", "");
        await expect(strip.getByRole("link", { name: `Video ${label}`, exact: true })).toHaveAttribute(
            "href",
            `/video/${frameNumber}`,
        );
    }
});

test.describe("on a phone", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("the strip scrolls sideways and the page doesn't", async ({ page }) => {
        await page.goto("/video");
        const strip = page.getByRole("list", { name: "Videos" });

        const overflows = await strip.evaluate((el) => el.scrollWidth > el.clientWidth);
        expect(overflows).toBe(true);

        const pageOverflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(pageOverflow).toBeLessThanOrEqual(0);
    });

    test("the strip scrolls with the arrow keys once focused", async ({ page }) => {
        await page.goto("/video");
        const strip = page.getByRole("list", { name: "Videos" });

        await strip.focus();
        await page.keyboard.press("ArrowRight");
        await expect.poll(() => strip.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    });
});

test("the main nav reaches the Video page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: "video", exact: true }).click();
    await expect(page).toHaveURL("/video");
    await expect(page.getByRole("heading", { level: 1, name: "Video" })).toBeVisible();
});
