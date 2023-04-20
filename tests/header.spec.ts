import { test, expect } from "@playwright/test";
import { describe } from "node:test";

// const links = ["#/", "#/about", "#/txns"];
const links = ["#/", "#/txns"]; // TODO: Add rest of links

describe("Header", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(String(baseURL));
  });

  test("Links should work", async ({ page, baseURL }) => {
    // ARRANGE
    const header = page.getByTestId("header");

    // ACT
    for (const link of links) {
      await header.locator(`a[href="${link}"]:visible`).click();
      expect(page.url()).toBe(`${baseURL}/${link}`);
    }

    // ASSERT
    await expect(header).toBeVisible();
  });
});
