import { expect, test } from "@playwright/test";
import { SITE, SOCIAL_LINKS } from "@/lib/site";

test("contact shows the heading and a mailto link to the site email", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.getByRole("heading", { level: 1, name: "Contact"})).toBeVisible();

    const email = page.getByRole("link", { name: SITE.email });
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute("href", `mailto:${SITE.email}`);
});


test("each social link points at its URL and opens in a new tab", async ({ page }) => {
    await page.goto("/contact");

    const links = page.getByRole("list", { name: "Elsewhere "}).getByRole("link");
    await expect(links).toHaveCount(SOCIAL_LINKS.length);

    for (const [index, item] of SOCIAL_LINKS.entries()) {
        const link = links.nth(index);
        await expect(link).toContainText(item.label);
        await expect(link).toHaveAttribute("href", item.href );
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", "noopener noreferer" );
    }
});

test("the main nav reaches the contact page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "contact" }).click();
    
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByRole("heading", { level: 1, name: "Contact"})).toBeVisible();
});