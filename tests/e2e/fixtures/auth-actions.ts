import { type Page, expect } from "@playwright/test";

export async function login(
    page: Page, 
    email: string,
    password: string
): Promise<void> {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();
}

export async function logout(page: Page): Promise<void> {
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL("/login");
}