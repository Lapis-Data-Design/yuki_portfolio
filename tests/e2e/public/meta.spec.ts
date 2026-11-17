import { expect, test } from "@playwright/test";

test("pages opt out of Dark Reader with a darkreader-lock meta tag", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="darkreader-lock"]')).toHaveCount(1);
});