import { expect, test } from "@playwright/test";

const TOTAL = 24;
const FIRST = "001";
const LAST = "024";

const detailHeading = (frameNumber: string) => ({level: 1, name: `Photograph No. ${frameNumber}` }) as const;

test("clicking a frame in the contact sheet opens that photo", async ({ page }) => {
    await page.goto("/photography");

    await page
        .getByRole("list", { name: "Photographs" })
        .getByRole("link", { name: "Photograph No. 007"})
        .click();

        await expect(page).toHaveURL(/\/photography\/007$/);
        await expect(page.getByRole("heading", detailHeading("007"))).toBeVisible();
        await expect(page.getByText(`7 / ${TOTAL}`, { exact: true })).toBeVisible();
});

test("next and previous follow the grid order", async ({ page }) => {
    await page.goto("/photography/007");

    await page.getByRole("link", { name: "Next photograph" }).click();
    await expect(page).toHaveURL(/\/photography\/008$/);
    await expect(page.getByRole("heading", detailHeading("008"))).toBeVisible();
    
    await page.getByRole("link", { name: "Previous photograph" }).click();
    await page.getByRole("link", { name: "Previous photograph" }).click();
    await expect(page).toHaveURL(/\/photography\/006$/);
    await expect(page.getByRole("heading", detailHeading("006"))).toBeVisible();
});

test("the first photo has no previous and the last has no next", async ({ page }) => {
    await page.goto(`/photography/${FIRST}`);
    await expect(page.getByRole("heading", detailHeading(FIRST))).toBeVisible();
    await expect(page.getByRole("link", { name: "Previous photograph "})).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Next photograph "})).toBeVisible();
    
    await page.goto(`/photography/${LAST}`);
    await expect(page.getByRole("heading", detailHeading(LAST))).toBeVisible();
    await expect(page.getByRole("link", { name: "Previous photograph "})).toBeVisible();
    await expect(page.getByRole("link", { name: "Next photograph "})).toHaveCount(0);
});

test("arrow keys step through photos and Escape returns to the contact sheet", async ({ page}) => {
    await page.goto("/photography/007");
    await expect(page.getByRole("heading", detailHeading("007"))).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/photography\/008$/);
    
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\/photography\/007$/);
    
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/photography$/);
});

test("the back link returns to the contact sheet", async ({ page }) => {
    await page.goto("/photography/007");

    await page.getByRole("link", { name: "photography", exact: true }).click();

    await expect(page).toHaveURL(/\/photography$/);
    await expect(page.getByRole("heading", { level: 1, name: "Photography" })).toBeVisible();
});

test("an unknown frame number is a 404", async ({ page }) => {
    const response = await page.goto("/photography/999");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", detailHeading("999"))).toHaveCount(0);
});