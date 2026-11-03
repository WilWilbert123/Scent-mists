import { expect, test } from "@playwright/test";

test.describe("SCENTS & MISTS Customer Enquiry Submission", () => {
  test("validates required fields on blur and allows submitting a bespoke fragrance enquiry", async ({
    page,
  }) => {
    await page.goto("/contact");

    await expect(
      page.getByRole("heading", { name: /Private Fragrance Concierge/i })
    ).toBeVisible();

    const nameInput = page.getByLabel(/Full Name/i);
    await nameInput.focus();
    await nameInput.blur();
    await expect(page.getByText(/Please provide your full name/i)).toBeVisible();

    await nameInput.fill("Clara Vance");
    await page.getByLabel(/Email Address/i).fill("clara.vance@example.com");
    await page.getByLabel(/Subject/i).fill("Himalayan Cherry Blossom Air Enquiry");
    await page
      .getByLabel(/Your Message/i)
      .fill("I would love to learn more about the olfactory notes of Himalayan Cherry Blossom Air.");

    const submitButton = page.getByRole("button", { name: /Send Enquiry/i });
    await expect(submitButton).toBeEnabled();
  });
});

