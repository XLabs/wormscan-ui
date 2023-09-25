import { test, expect } from "@playwright/test";
import { describe } from "node:test";

const addressEndpoint = "http://api.staging.wormscan.io/api/v1/address/";
const address = "0x0000000000000000000000001ef2e0219841d1a540d99c432a6eddb75deed1b7";
const badAddress = "0x12345";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/#`);
  });

  describe("Hero Section", () => {
    test.skip("Search an address", async ({ page }) => {
      // ARRANGE
      const heroTextElement = page.getByText(/Cross-chain Explorer/i);
      const searchForm = page.getByTestId("search-form");
      const searchInput = searchForm.getByLabel("search");
      const searchButton = searchForm.getByRole("button");

      // ACT
      // Good address
      await searchInput.fill(address);
      const responsePromiseOk = page.waitForResponse(`${addressEndpoint}${address}`);
      await searchButton.click();
      const responseOk = await responsePromiseOk;
      expect(responseOk.ok()).toBeTruthy();

      // Bad address
      await searchInput.fill(badAddress);
      const responsePromiseError = page.waitForResponse(`${addressEndpoint}${badAddress}`);
      await searchButton.click();
      const responseError = await responsePromiseError;
      expect(responseError.ok()).toBeFalsy();

      // ASSERT
      await expect(heroTextElement).toBeVisible();
      await expect(searchButton).toBeVisible();
    });
  });

  test("Transaction History", async ({ page }) => {
    const transHistory = page.locator(".trans-history");

    await page.getByLabel("One month").click();
    await page.waitForSelector(".trans-history[data-range='month']");
    expect(await transHistory.getAttribute("data-range")).toBe("month");

    await page.getByLabel("One week").click();
    await page.waitForSelector(".trans-history[data-range='week']");
    expect(await transHistory.getAttribute("data-range")).toBe("week");

    await page.getByLabel("One day").click();
    await page.waitForSelector(".trans-history[data-range='day']");
    expect(await transHistory.getAttribute("data-range")).toBe("day");
  });
});
