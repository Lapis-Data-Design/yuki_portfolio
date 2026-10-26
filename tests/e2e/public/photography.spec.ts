import { expect, test } from "@playwright/test";

test("photography page sets its tab title", async ({ page }) => {
    await page.goto("/photography");
    await expect(page).toHaveTitle(/Photography/);
});

test("photography lists numbered frames and the header count matches the grid", async ({ page}) => {
    await page.goto("/photography");

    await expect(page.getByRole("heading", { level: 1, name: "Photography" })).toBeVisible();

    const countText = await page.getByText(/^\d+ frames?$/).textContent();
    const count = Number(countText?.match(/\d+/)?.[0]);
    expect(count).toBeGreaterThan(0);

    const cells = page.getByRole("list", { name: "Photographs" }).getByRole("listitem");
    await expect(cells).toHaveCount(count);
    await expect(cells.first().getByText(/^No\. \d+$/)).toBeVisible();
});