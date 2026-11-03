import { expect, test } from "@playwright/test";

test.describe("SCENTS & MISTS Administrator Login", () => {
  test("renders secure administrator login portal at /admin/login without public registration", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await expect(page.getByRole("heading", { name: /Administrator Portal/i })).toBeVisible();
    await expect(page.getByLabel(/Administrator Email/i)).toBeVisible();
    await expect(page.getByLabel(/^Password$/i)).toBeVisible();

    // Ensure no public sign-up link exists
    await expect(page.getByText(/Sign up/i)).toHaveCount(0);
    await expect(page.getByText(/Create account/i)).toHaveCount(0);
  });
});

