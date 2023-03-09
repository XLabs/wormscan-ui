import { test, expect, Locator } from "@playwright/test";

test("Home > Hero Component", async ({ page }) => {
  // ARRANGE
  await page.goto("http://localhost:1234/");

  // ACT
  const heroTextElement: Locator = page.getByText(/The Wormhole Explorer/i);
  const searchBarElement: Locator = page.getByPlaceholder(/Search by TxHash/i);

  // ASSERT
  await expect(heroTextElement).toBeVisible();
  await expect(searchBarElement).toBeVisible();
});
