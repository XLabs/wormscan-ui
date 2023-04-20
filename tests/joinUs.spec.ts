import { test, expect } from "@playwright/test";
import { describe } from "node:test";

describe("Join Us Section", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(String(baseURL));
  });

  test("Button should work", async ({ page }) => {
    // ARRANGE
    const joinUsButton = page.getByTestId("join-discord-button");

    // ACT
    await joinUsButton.click();

    // ASSERT
    await expect(joinUsButton).toBeVisible();
  });
});
