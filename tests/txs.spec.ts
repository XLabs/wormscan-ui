import { test, expect, Response } from "@playwright/test";
import { describe } from "node:test";

describe("Txs Page", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/#/txs`);
  });

  test("check endpoint for txs", async ({ page }) => {
    const maxAttempts = 3;
    let attempt = 0;
    let response: Response | null = null;

    // try to get the response from the endpoint
    while (attempt < maxAttempts) {
      attempt++;
      const txsEndpoint =
        "https://api.staging.wormscan.io/api/v1/transactions?page=0&pageSize=50&sortOrder=DESC";
      const responsePromise = page.waitForResponse(txsEndpoint);
      response = await responsePromise;

      if (response.ok()) {
        break;
      } else if (attempt < maxAttempts) {
        // if the response is not successful but we have not exhausted attempts, wait a while and then try again.
        await page.waitForTimeout(1000);
      }
    }

    expect(response?.ok()).toBeTruthy();
  });

  test("check pagination buttons", async ({ page, baseURL }) => {
    const txsPage = page.getByTestId("txs-page");
    const firstPaginationElement = txsPage.locator(".txs-information-top-pagination");
    const prevPrevButton = firstPaginationElement.getByRole("button", { name: "<<" }).first();
    const prevButton = firstPaginationElement.getByRole("button", { name: "<" }).nth(1);
    const page1 = firstPaginationElement.getByRole("button", { name: "1" });
    const page2 = firstPaginationElement.getByRole("button", { name: "2" });
    const page3 = firstPaginationElement.getByRole("button", { name: "3" });
    const nextButton = firstPaginationElement.getByRole("button", { name: ">" });

    // check if the buttons are disabled correctly
    expect(await prevPrevButton.getAttribute("disabled")).toBe("");
    expect(await prevButton.getAttribute("disabled")).toBe("");
    expect(await page1.getAttribute("disabled")).toBe("");

    // check if the buttons work correctly
    await page2.click();
    expect(await prevPrevButton.getAttribute("disabled")).toBeFalsy();
    expect(await prevButton.getAttribute("disabled")).toBeFalsy();
    expect(await page1.getAttribute("disabled")).toBeFalsy();
    expect(await page2.getAttribute("disabled")).toBe("");
    expect(page.url()).toBe(`${baseURL}/#/txs?page=2`);

    await page3.click();
    expect(await page2.getAttribute("disabled")).toBeFalsy();
    expect(await page3.getAttribute("disabled")).toBe("");
    expect(page.url()).toBe(`${baseURL}/#/txs?page=3`);

    await nextButton.click();
    expect(await page3.getAttribute("disabled")).toBeFalsy();
    expect(await nextButton.getAttribute("disabled")).toBe("");
    expect(page.url()).toBe(`${baseURL}/#/txs?page=4`);

    await prevButton.click();
    expect(await prevPrevButton.getAttribute("disabled")).toBeFalsy();
    expect(await prevButton.getAttribute("disabled")).toBeFalsy();
    expect(page.url()).toBe(`${baseURL}/#/txs?page=3`);

    await prevPrevButton.click();
    expect(await prevPrevButton.getAttribute("disabled")).toBe("");
    expect(await prevButton.getAttribute("disabled")).toBe("");
    expect(await page1.getAttribute("disabled")).toBe("");
    expect(page.url()).toBe(`${baseURL}/#/txs?page=1`);
  });

  test("check row click", async ({ page, baseURL }) => {
    const txsPage = page.getByTestId("txs-page");
    const tbody = txsPage.locator("tbody");

    // test first 5 items
    for (let i = 1; i <= 5; i++) {
      const txHashElement = tbody.locator(`tr:nth-child(${i}) .tx-hash`);
      const txHashText = await txHashElement.innerText();

      // check if the txHash exists
      if (txHashText !== "-") {
        const txHashHref = await txHashElement.locator("a.navlink").getAttribute("href");

        await tbody.locator(`tr:nth-child(${i})`).click();

        expect(page.url()).toBe(`${baseURL}/${txHashHref}`);

        await page.goBack();
      }
    }
  });
});
