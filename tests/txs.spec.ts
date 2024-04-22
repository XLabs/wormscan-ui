import { test, expect, Response } from "@playwright/test";
import { describe } from "node:test";

describe("Txs Page", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/#/txs`);
  });

  test("check endpoint for txs", async ({ page }) => {
    const retryTimeout = 10000;
    const retryDelay = 5000;
    const maxRetries = 3;
    const txsEndpoint =
      "https://api.staging.wormscan.io/api/v1/operations?page=0&pageSize=50&sortOrder=DESC";
    let response: Response | undefined;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        // wait for the response or timeout
        const racePromise = Promise.race([
          page.waitForResponse(txsEndpoint),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Time limit reached")), retryTimeout),
          ),
        ]);

        response = (await racePromise) as Response;

        if (response?.status() === 200) {
          break;
        } else {
          console.error(`Request error (attempt ${retries + 1}): Status ${response?.status()}`);

          // Espera el tiempo especificado antes de volver a intentar.
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        console.error(`Request error (attempt ${retries + 1}): ${error.message}`);
      }
      retries++;
    }

    expect(response?.status()).toBe(200);
  });

  test("check pagination buttons", async ({ page }) => {
    const txsPage = page.getByTestId("txs-page");
    const firstPaginationElement = txsPage.locator(".txs-information-top-pagination");
    const prevPrevButton = firstPaginationElement.getByRole("button", { name: "<<" }).first();
    const prevButton = firstPaginationElement.getByRole("button", { name: "<" }).nth(1);
    const page1 = firstPaginationElement.getByRole("button", { name: "1" });
    const page3 = firstPaginationElement.getByRole("button", { name: "3" });
    const page4 = firstPaginationElement.getByRole("button", { name: "4" });
    const nextButton = firstPaginationElement.getByRole("button", { name: ">" });

    // check if the buttons are disabled correctly
    expect(await prevPrevButton.getAttribute("disabled")).toBe("");
    expect(await prevButton.getAttribute("disabled")).toBe("");
    expect(await page1.getAttribute("disabled")).toBe("");

    await page3.click();
    expect(await prevPrevButton.getAttribute("disabled")).toBeFalsy();
    expect(await prevButton.getAttribute("disabled")).toBeFalsy();
    expect(await page1.getAttribute("disabled")).toBeFalsy();
    expect(await page3.getAttribute("disabled")).toBe("");

    await nextButton.click();
    expect(await page3.getAttribute("disabled")).toBeFalsy();
    expect(await page4.getAttribute("disabled")).toBe("");

    await prevButton.click();
    expect(await page4.getAttribute("disabled")).toBeFalsy();
    expect(await page3.getAttribute("disabled")).toBe("");

    await prevPrevButton.click();
    expect(await prevPrevButton.getAttribute("disabled")).toBe("");
    expect(await prevButton.getAttribute("disabled")).toBe("");
    expect(await page1.getAttribute("disabled")).toBe("");
  });

  test("check row click", async ({ page, baseURL }) => {
    const txsPage = page.getByTestId("txs-page");
    const tbody = txsPage.locator("tbody");

    // test 5 rows
    for (let i = 10; i <= 14; i++) {
      try {
        await page.waitForSelector(`tbody tr:nth-child(${i})`);
        const txHashElement = tbody.locator(`tr:nth-child(${i}) .tx-hash`);
        const txHashText = await txHashElement.textContent();

        if (txHashText !== "-") {
          const txHashHref = await txHashElement.locator("a.navlink").getAttribute("href");

          await page.click(`tbody tr:nth-child(${i}) td:not(:has(a))`);

          expect(page.url()).toBe(`${baseURL}/${txHashHref}`);

          await page.goBack();
        }
      } catch (error) {
        console.error(`Error on row ${i}: ${error.message}`);
      }
    }
  });
});
