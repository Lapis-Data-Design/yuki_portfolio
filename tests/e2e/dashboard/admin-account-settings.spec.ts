import { test, expect} from "@playwright/test";
import { login, logout } from "../fixtures/auth-actions";
import { TEST_ACCOUNTS } from "../fixtures/accounts";

const TEST_ACCOUNT = TEST_ACCOUNTS.adminAccountSettings;
const NEW_PASSWORD = "e2e-admin-account-settings-new-password";
const ACCOUNT_SETTINGS_URL = "/dashboard/admin/account";

test.describe.configure({ mode: "serial" });

test.describe("admin account settings", () => {
    test.beforeEach(async ({ page }) => {
        await login(page, TEST_ACCOUNT.email, TEST_ACCOUNT.password);
        await expect(page).toHaveURL("/dashboard/admin");
        await page.goto(ACCOUNT_SETTINGS_URL, { waitUntil: "networkidle" });
    });

    test("shows its own frame label, the heading and the form", async ({ page}) => {
        const main = page.getByRole("main");
        
        await expect(main.getByText("Roll 00B", { exact: true })).toBeVisible();
        await expect(main.getByRole("heading", { level: 1, name: "Account Settings" })).toBeVisible();
        await expect(main.getByRole("tab", { name: "Email" })).toHaveAttribute("aria-selected", "true");
        await expect(main.getByRole("tabpanel", { name: "Email"}).getByText(`Current email: ${TEST_ACCOUNT.email}`)).toBeVisible();
    });

    test("a saved password works at the next login", async ({ page }) => {
        const main = page.getByRole("main");
        const passwordPanel = main.getByRole("tabpanel", { name: "Password" });

        await main.getByRole("tab", { name: "Password" }).click();
        await passwordPanel.getByLabel("Current password", { exact: true }).fill(TEST_ACCOUNT.password);
        await passwordPanel.getByLabel("New password", { exact: true }).fill(NEW_PASSWORD);
        await passwordPanel.getByLabel("Confirm new password", { exact: true }).fill(NEW_PASSWORD);
        await passwordPanel.getByRole("button", { name: "Save password" }).click();

        await expect(passwordPanel.getByRole("status")).toHaveText("Saved.");
        await expect(page).toHaveURL(ACCOUNT_SETTINGS_URL);

        await logout(page);
        await login(page, TEST_ACCOUNT.email, NEW_PASSWORD);
        await expect(page).toHaveURL("/dashboard/admin");
    });
});