import { expect, test } from "@playwright/test";

const HERO_LABEL = "No. 001";
const SELECTED_LABELS = ["No. 002", "No. 003", "No. 005", "No. 007"];

test("home shows the hero frame and the featured frames from the database", async ({ page })=> {
    await page.goto("/");

    const selected = page.getByRole("region", { name: "Selected frames" });
    await expect(selected.getByRole("figure")).toHaveText(SELECTED_LABELS);

    await expect(page.getByRole("figure")).toHaveCount(SELECTED_LABELS.length + 1);
    await expect(page.getByRole("figure").first()).toHaveText(HERO_LABEL);
    await expect(selected.getByText(HERO_LABEL)).toHaveCount(0);
});
