import { test, expect } from "@playwright/test";
import { describe } from "node:test";
import { DISCORD_URL } from "../src/consts";

describe("Home Page", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/#/`);
  });

  describe("Transaction History", () => {
    test("check endpoints for 1d-1w-1mo", async ({ page }) => {
      const transHistory = page.getByTestId("trans-history");

      const testCases = [
        { label: "One month", timeSpan: "1mo", sampleRate: "1d", expectedRange: "month" },
        { label: "One week", timeSpan: "1w", sampleRate: "1d", expectedRange: "week" },
        { label: "One day", timeSpan: "1d", sampleRate: "1h", expectedRange: "day" },
      ];

      for (const testCase of testCases) {
        // check if buttons in transaction history work
        await page.getByLabel(testCase.label).click();
        // check if the endpoint is called with the correct params
        await page.waitForResponse(
          `https://api.staging.wormscan.io/api/v1/last-txs?timeSpan=${testCase.timeSpan}&sampleRate=${testCase.sampleRate}`,
        );
        // check if the correct data-range attribute is set
        expect(await transHistory.getAttribute("data-range")).toBe(testCase.expectedRange);
      }
    });
  });

  describe("Wormhole stats", () => {
    test("check endpoint for wormhole stats", async ({ page }) => {
      const wormholeStatsEndpoint = "https://api.staging.wormscan.io/api/v1/scorecards";
      const responsePromise = page.waitForResponse(wormholeStatsEndpoint);
      const response = await responsePromise;
      expect(response.status()).toBe(200);
    });
  });

  describe("Cross-chain activity", () => {
    test("check buttons/endpoints for volume and transactions", async ({ page }) => {
      const crossChainCard = page.getByTestId("cross-chain-card");
      const volumeButton = crossChainCard.getByLabel("Volume");
      const transactionsButton = crossChainCard.getByLabel("Transactions");
      const selectElement = crossChainCard.locator(".select__control");
      const selectMenuList = page.locator(".select__menu-list");

      // check if the buttons/endpoints work correctly for volume and transactions
      async function checkTimeRange(selectItem: number, timeSpan: string, by: string) {
        await selectElement.click();
        await selectMenuList.locator("div").nth(selectItem).click();
        const endpoint = `https://api.staging.wormscan.io/api/v1/x-chain-activity/?timeSpan=${timeSpan}&by=${by}`;
        await page.waitForResponse(endpoint);
      }

      await volumeButton.click();
      await checkTimeRange(4, "all-time", "notional");
      await checkTimeRange(3, "1y", "notional");
      await checkTimeRange(2, "90d", "notional");
      await checkTimeRange(1, "30d", "notional");
      await checkTimeRange(0, "7d", "notional");

      await transactionsButton.click();
      await checkTimeRange(4, "all-time", "tx");
      await checkTimeRange(3, "1y", "tx");
      await checkTimeRange(2, "90d", "tx");
      await checkTimeRange(1, "30d", "tx");
      await checkTimeRange(0, "7d", "tx");
    });

    test("source/target buttons and click each item", async ({ page }) => {
      const crossChainCard = page.getByTestId("cross-chain-card");
      const sourceBtn = crossChainCard.getByLabel("Select graphic type").getByText("SOURCE");
      const targetBtn = crossChainCard.getByLabel("Select graphic type").getByText("TARGET");
      const rightItems = crossChainCard.locator(".cross-chain-chart-side").last();
      const leftItems = crossChainCard.locator(".cross-chain-chart-side").first();
      const prevBtn = crossChainCard.getByRole("button", { name: "<" });

      // clicking the "target" button should make all right items selectable
      await targetBtn.click();

      // check if 10 right items are selectable
      for (let i = 0; i <= 9; i++) {
        await rightItems.locator(".selectable.right").nth(i).click();
      }

      // clicking the "source" button should make all left items selectable
      await sourceBtn.click();

      if (!(await prevBtn.isDisabled())) {
        await prevBtn.click();
      }

      // check if 10 left items are selectable
      for (let i = 0; i <= 9; i++) {
        await leftItems.locator(".selectable.left").nth(i).click();
      }
    });

    test("pagination buttons", async ({ page }) => {
      const crossChainCard = page.getByTestId("cross-chain-card");
      const prevBtn = crossChainCard.getByRole("button", { name: "<" });
      const paginationNumber = crossChainCard.locator(".pagination.current");
      const nextBtn = crossChainCard.getByRole("button", { name: ">" });

      // check if the buttons are disabled correctly
      expect(await prevBtn.getAttribute("disabled")).toBe("");
      expect(await paginationNumber.innerText()).toBe("1");
      expect(await nextBtn.getAttribute("disabled")).toBeFalsy();

      // check if the buttons work correctly
      await nextBtn.click();
      expect(await prevBtn.getAttribute("disabled")).toBeFalsy();
      expect(await paginationNumber.innerText()).toBe("2");
      expect(await nextBtn.getAttribute("disabled")).toBe("");

      await prevBtn.click();
      expect(await prevBtn.getAttribute("disabled")).toBe("");
      expect(await paginationNumber.innerText()).toBe("1");
      expect(await nextBtn.getAttribute("disabled")).toBeFalsy();
    });
  });

  describe("Top 7 assets", () => {
    test("check endpoint top 7 assets for 7d-15d-30d", async ({ page }) => {
      const topChainTimeRange = page.getByTestId("topAssetTimeRange");
      const selectElement = topChainTimeRange.locator(".select__control");
      const selectMenuList = page.locator(".select__menu-list");

      // check if the buttons/endpoints work correctly
      async function checkTop7Assets(selectItem: number, timeSpan: string) {
        await selectElement.click();
        await selectMenuList.locator("div").nth(selectItem).click();
        const endpoint = `https://api.staging.wormscan.io/api/v1/top-symbols-by-volume?timeSpan=${timeSpan}`;
        await page.waitForResponse(endpoint);
      }

      await checkTop7Assets(2, "30d");
      await checkTop7Assets(1, "15d");
      await checkTop7Assets(0, "7d");
    });
  });
});
