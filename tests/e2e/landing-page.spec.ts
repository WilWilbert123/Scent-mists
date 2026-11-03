import { expect, test } from "@playwright/test";

test.describe("SCENTS & MISTS Public Luxury Landing Page", () => {
  test("renders hero section, Himalayan Cherry Blossom Air showcase, and excludes admin links", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /SCENTS & MISTS/i }).first()).toBeVisible();
    await expect(page.getByText(/Himalayan Cherry Blossom Air/i).first()).toBeVisible();

    // Ensure no admin link appears anywhere in public navigation or footer
    const adminLinks = await page.locator('a[href*="/admin"]').count();
    expect(adminLinks).toBe(0);
  });

  test("toggles between Light Mode (default) and Dark Mode cleanly", async ({ page }) => {
    await page.goto("/");

    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");

    const toggleButton = page.getByRole("button", { name: /Switch to dark theme/i }).first();
    await toggleButton.click();

    await expect(html).toHaveAttribute("data-theme", "dark");
  });
});

