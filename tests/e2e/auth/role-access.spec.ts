import { test, expect } from "@playwright/test";
import { TEST_ACCOUNTS } from "../fixtures/accounts";
import { login } from "../fixtures/auth-actions";

const ADMIN_TEST_ACCOUNT = TEST_ACCOUNTS.admin;
const ROLE_OWNER_TEST_ACCOUNT = TEST_ACCOUNTS.roleTestOwner;

test("owner is blocked from the admin dashboard", async ({ page }) => {
    await login(page, ROLE_OWNER_TEST_ACCOUNT.email, ROLE_OWNER_TEST_ACCOUNT.password);
    await expect(page).toHaveURL("/dashboard/owner");

    await page.goto("/dashboard/admin");
    await expect(page).toHaveURL("/unauthorized");
    await expect(page.getByRole("heading", { name: "Not authorized" })).toBeVisible();

    // The way out leads back to the owner's own dashboard, not a dead end.
    await page.getByRole("link", { name: "Back to your dashboard" }).click();
    await expect(page).toHaveURL("/dashboard/owner");
});

test("admin can access the owner dashboard", async ({ page }) => {
    await login(page, ADMIN_TEST_ACCOUNT.email, ADMIN_TEST_ACCOUNT.password);
    await expect(page).toHaveURL("/dashboard/admin");

    await page.goto("/dashboard/owner");
    await expect(page).toHaveURL("/dashboard/owner");
    await expect(page.getByText(ADMIN_TEST_ACCOUNT.email)).toBeVisible(); 
});

test("logged-out visitor on /unauthorized is pointed to login", async ({ page }) => {
    await page.goto("/unauthorized");
    await expect(page.getByRole("heading", { name: "Not authorized" })).toBeVisible();

    await page.getByRole("link", { name: "Log in" }).click();
    await expect(page).toHaveURL("/login");
});