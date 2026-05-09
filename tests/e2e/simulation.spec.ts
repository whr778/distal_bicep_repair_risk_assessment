import { test, expect } from "@playwright/test";

test("loads simulation page and updates controls", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Distal Biceps Repair Recovery Simulator/i })).toBeVisible();
  await expect(page.getByText(/Recovery timeline/i)).toBeVisible();

  const compliance = page.getByLabel(/Compliance with rehab plan/i);
  await compliance.fill("80");

  const activity = page.getByLabel(/Selected activity level/i);
  await activity.selectOption("moderate");

  await expect(page.getByText(/Average weekly re-injury risk/i)).toBeVisible();
});
