import { expect, test } from "@playwright/test";

const SEEDED_CLIPS = ["001", "002", "003", "004"].map((n) => `No. ${n}`);

test("stop motion shows the reel in order and the header count matches the strip", async ({ page }) => {
    await page.goto("/stop-motion");

    await expect(page.getByRole("heading", { level: 1, name: "Stop motion" })).toBeVisible();
    await expect(page.getByText(/^\d+ frames?$/)).toHaveText(`${SEEDED_CLIPS.length} frames`);

    const strip = page.getByRole("list", { name: "Stop motion", exact: true });
    await expect(strip.getByRole("listitem")).toHaveCount(SEEDED_CLIPS.length);
    await expect(strip.getByText(/^No\. \d+$/)).toHaveText(SEEDED_CLIPS);
});

test("each strip frame links to its own detail page", async ({ page }) => {
    await page.goto("/stop-motion");
    const strip = page.getByRole("list", { name: "Stop motion", exact: true });

    await expect(strip.getByRole("link")).toHaveCount(SEEDED_CLIPS.length);
    for (const label of SEEDED_CLIPS) {
        const frameNumber = label.replace("No. ", "");
        await expect(strip.getByRole("link", { name: `Stop motion ${label}`, exact: true })).toHaveAttribute(
            "href",
            `/stop-motion/${frameNumber}`,
        );
    }
});

test("the main nav reaches the Stop motion page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: "stop motion", exact: true }).click();
    await expect(page).toHaveURL("/stop-motion");
    await expect(page.getByRole("heading", { level: 1, name: "Stop motion" })).toBeVisible();
});