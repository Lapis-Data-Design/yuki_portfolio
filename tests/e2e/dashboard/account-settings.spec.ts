import { test, expect, type Locator } from "@playwright/test";
import { login, logout } from "../fixtures/auth-actions";
import { TEST_ACCOUNTS } from "../fixtures/accounts";
import { CURRENT_PASSWORD_INCORRECT_MESSAGE, EMAIL_IN_USE_MESSAGE } from "@/lib/account-rules";

const TEST_ACCOUNT = TEST_ACCOUNTS.accountSettings;
const NEW_EMAIL = TEST_ACCOUNT.changedEmail;
const NEW_PASSWORD = "e2e-account-settings-new-password";
const ACCOUNT_SETTINGS_URL = "/dashboard/owner/account";

test.describe.configure({ mode: "serial" });

test.describe("owner account settings", () => {
    let main: Locator;
    let emailTab: Locator;
    let passwordTab: Locator;
    let emailPanel: Locator;
    let passwordPanel: Locator;

    let emailCurrentPassword: Locator;
    let newEmail: Locator;
    let confirmNewEmail: Locator;
    let saveEmailButton: Locator;

    let passwordCurrentPassword: Locator;
    let newPassword: Locator;
    let confirmNewPassword: Locator;
    let savePasswordButton: Locator;

    test.beforeEach(async ({ page }) => {
        await login(page, TEST_ACCOUNT.email, TEST_ACCOUNT.password);
        await expect(page).toHaveURL("/dashboard/owner");
        await page.goto(ACCOUNT_SETTINGS_URL, { waitUntil: "networkidle" });

        main = page.getByRole("main");
        emailTab = main.getByRole("tab", { name: "Email" });
        passwordTab = main.getByRole("tab", { name: "Password" });
        emailPanel = main.getByRole("tabpanel", { name: "Email" });
        passwordPanel = main.getByRole("tabpanel", { name: "Password" });

        emailCurrentPassword = emailPanel.getByLabel("Current password", { exact: true });
        newEmail = emailPanel.getByLabel("New email", { exact: true });
        confirmNewEmail = emailPanel.getByLabel("Confirm new email", { exact: true });
        saveEmailButton = emailPanel.getByRole("button", { name: "Save email" });

        passwordCurrentPassword = passwordPanel.getByLabel("Current password", { exact: true });
        newPassword = passwordPanel.getByLabel("New password", { exact: true });
        confirmNewPassword = passwordPanel.getByLabel("Confirm new password", { exact: true });
        savePasswordButton = passwordPanel.getByRole("button", { name: "Save password" });
    });

    test("tabs switch between the email and password forms", async () => {
        await expect(emailTab).toHaveAttribute("aria-selected", "true");
        await expect(emailPanel).toBeVisible();
        await expect(passwordPanel).toBeHidden();

        await passwordTab.click();
        await expect(passwordTab).toHaveAttribute("aria-selected", "true");
        await expect(passwordPanel).toBeVisible();
        await expect(emailPanel).toBeHidden();

        await passwordTab.press("ArrowLeft");
        await expect(emailTab).toBeFocused();
        await expect(emailPanel).toBeVisible();
    });

    test("every field has a visible label and its hint", async () => {
        await expect(emailPanel.getByText(`Current email: ${TEST_ACCOUNT.email}`)).toBeVisible();
        await expect(emailCurrentPassword).toHaveAccessibleDescription("Required to confirm the change.");
        await expect(newEmail).toBeVisible();
        await expect(confirmNewEmail).toHaveAccessibleDescription("Type the new email again.");

        await passwordTab.click();
        await expect(passwordCurrentPassword).toHaveAccessibleDescription("Required to confirm the change.");
        await expect(newPassword).toHaveAccessibleDescription("At least 8 characters.");
        await expect(confirmNewPassword).toHaveAccessibleDescription("Type the new password again.");

        await passwordPanel.getByText("New password", { exact: true }).click();
        await expect(newPassword).toBeFocused();
    });

    test("the email save button waits until the new emails match", async () => {
        const mismatch = emailPanel.getByText("New emails don't match.");

        await expect(saveEmailButton).toBeDisabled();

        await emailCurrentPassword.fill(TEST_ACCOUNT.password);
        await newEmail.fill(NEW_EMAIL);
        await expect(saveEmailButton).toBeDisabled();

        await confirmNewEmail.fill(NEW_EMAIL.slice(0, 6));
        await expect(mismatch).toBeHidden();
        await expect(saveEmailButton).toBeDisabled();

        await confirmNewEmail.fill("e2e-account-settings-old@example.test");
        await expect(mismatch).toBeVisible();
        await expect(confirmNewEmail).toHaveAttribute("aria-invalid", "true");
        await expect(saveEmailButton).toBeDisabled();

        await confirmNewEmail.fill(NEW_EMAIL);
        await expect(mismatch).toBeHidden();
        await expect(saveEmailButton).toBeEnabled();
    });

    test("entering the current email explains why the save button waits", async () => {
        const sameEmail = emailPanel.getByText("That's already your email address.");

        await emailCurrentPassword.fill(TEST_ACCOUNT.password);
        await newEmail.fill(TEST_ACCOUNT.email.toUpperCase());
        await confirmNewEmail.fill(TEST_ACCOUNT.email);

        await expect(sameEmail).toBeVisible();
        await expect(newEmail).toHaveAttribute("aria-invalid", "true");
        await expect(saveEmailButton).toBeDisabled();

        await newEmail.fill(NEW_EMAIL);
        await expect(sameEmail).toBeHidden();
    });

    test("the password save button waits until the new passwords match", async () => {
        const mismatch = passwordPanel.getByText("New passwords don't match.");

        await passwordTab.click();
        await expect(savePasswordButton).toBeDisabled();

        await passwordCurrentPassword.fill(TEST_ACCOUNT.password);
        await newPassword.fill(NEW_PASSWORD);
        await expect(savePasswordButton).toBeDisabled();

        await confirmNewPassword.fill(NEW_PASSWORD.slice(0, 6));
        await expect(mismatch).toBeHidden();
        await expect(savePasswordButton).toBeDisabled();

        await confirmNewPassword.fill(`${NEW_PASSWORD}-typo`);
        await expect(mismatch).toBeVisible();
        await expect(confirmNewPassword).toHaveAttribute("aria-invalid", "true");
        await expect(savePasswordButton).toBeDisabled();

        await confirmNewPassword.fill(NEW_PASSWORD);
        await expect(mismatch).toBeHidden();
        await expect(savePasswordButton).toBeEnabled();
    });

    test("the password save button waits for at least 8 characters", async () => {
        await passwordTab.click();
        await passwordCurrentPassword.fill(TEST_ACCOUNT.password);

        await newPassword.fill("short");
        await confirmNewPassword.fill("short");
        await expect(savePasswordButton).toBeDisabled();

        await newPassword.fill("long-enough");
        await confirmNewPassword.fill("long-enough");
        await expect(savePasswordButton).toBeEnabled();
    })

    test("a wrong current password shows an error and saves nothing", async ({ page }) => {
        await emailCurrentPassword.fill("not-the-password");
        await newEmail.fill(NEW_EMAIL);
        await confirmNewEmail.fill(NEW_EMAIL);
        await saveEmailButton.click();

        await expect(emailPanel.getByRole("alert")).toHaveText("Current password is incorrect.");
        await expect(emailPanel.getByText(`Current email: ${TEST_ACCOUNT.email}`)).toBeVisible();

        await passwordTab.click();

        await passwordCurrentPassword.fill("not-the-password");
        await newPassword.fill(NEW_PASSWORD);
        await confirmNewPassword.fill(NEW_PASSWORD);
        await savePasswordButton.click();

        await expect(passwordPanel.getByRole("alert")).toHaveText(CURRENT_PASSWORD_INCORRECT_MESSAGE);
        await expect(page).toHaveURL(ACCOUNT_SETTINGS_URL);
    });

    test("an email that belongs to another account is refused", async ({ page }) => {
        const takenEmail = TEST_ACCOUNTS.roleTestOwner.email;

        await emailCurrentPassword.fill(TEST_ACCOUNT.password);
        await newEmail.fill(takenEmail);
        await confirmNewEmail.fill(takenEmail);
        await saveEmailButton.click();

        await expect(emailPanel.getByRole("alert")).toHaveText(EMAIL_IN_USE_MESSAGE);
        await expect(emailPanel.getByText(`Current email: ${TEST_ACCOUNT.email}`)).toBeVisible();
        await expect(page).toHaveURL(ACCOUNT_SETTINGS_URL);
    });

    test("a new password equal to the current one is refused", async ({ page }) => {
        await passwordTab.click();
        await passwordCurrentPassword.fill(TEST_ACCOUNT.password);
        await newPassword.fill(TEST_ACCOUNT.password);
        await confirmNewPassword.fill(TEST_ACCOUNT.password);
        await savePasswordButton.click();

        await expect(passwordPanel.getByRole("alert")).toHaveText(
            "Choose a password different from your current one."
        );
        await expect(page).toHaveURL(ACCOUNT_SETTINGS_URL);
    });

    test("saved changes stay out of the URL and work at the next login", async ({ page }) => {
        await test.step("save a new password", async () => {
            await passwordTab.click();
            await passwordCurrentPassword.fill(TEST_ACCOUNT.password);
            await newPassword.fill(NEW_PASSWORD);
            await confirmNewPassword.fill(NEW_PASSWORD);
            await savePasswordButton.click();

            await expect(passwordPanel.getByRole("status")).toHaveText("Saved.");
            await expect(page).toHaveURL(ACCOUNT_SETTINGS_URL);
        });

        await test.step("log back in with the new password", async () => {
            await logout(page);
            await login(page, TEST_ACCOUNT.email, NEW_PASSWORD);
            await expect(page).toHaveURL("/dashboard/owner");
            await page.goto(ACCOUNT_SETTINGS_URL, { waitUntil: "networkidle" });
        });

        await test.step("save a new email", async () => {
            await emailCurrentPassword.fill(NEW_PASSWORD);
            await newEmail.fill(NEW_EMAIL);
            await confirmNewEmail.fill(NEW_EMAIL);
            await saveEmailButton.click();

            await expect(emailPanel.getByRole("status")).toHaveText("Saved.");
            await expect(emailPanel.getByText(`Current email: ${NEW_EMAIL}`)).toBeVisible();
            await expect(page).toHaveURL(ACCOUNT_SETTINGS_URL);
        });

        await test.step("log back in with the new email", async () => {
            await logout(page);
            await login(page, NEW_EMAIL, NEW_PASSWORD);
            await expect(page).toHaveURL("/dashboard/owner");
        });
    });
});
