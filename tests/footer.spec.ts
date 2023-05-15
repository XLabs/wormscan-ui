import { test, expect } from "@playwright/test";
import { describe } from "node:test";

// const links = ["#/", "#/about", "#/txs", "#/contact"];
const links = ["#/", "#/txs"]; // TODO: Add rest of links

describe("Footer", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(String(baseURL));
  });

  test("Links should work", async ({ page, baseURL }) => {
    // ARRANGE
    const footer = page.getByTestId("footer");

    // ACT
    for (const link of links) {
      await footer.locator(`a[href="${link}"]`).click();
      expect(page.url()).toBe(`${baseURL}/${link}`);
    }

    // ASSERT
    await expect(footer).toBeVisible();
  });
});
