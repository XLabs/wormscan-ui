import { test, expect } from "@playwright/test";
import { describe } from "node:test";

const internalLinks = [
  { name: "Wormhole Scan logo", href: "#/" },
  { name: "Txs", href: "#/txs" },
];

const externalLinks = [{ name: "Go to Bridge", href: "https://www.portalbridge.com/" }];

describe("Header", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/#/`);
  });

  describe("Header search", () => {
    test("search by txHash", async ({ page, baseURL }) => {
      const searchForm = page.getByTestId("search-form");
      const searchInput = searchForm.getByPlaceholder("Search by TxHash / Address / VAA ID");
      const searchButton = searchForm.getByRole("button", { name: "search" });

      // check search by txHash valid
      const txHash =
        "5rZmexGcA2eTttK1nihBGPMheho66dQjoNNg8TXYBCybiMS2cw5ZkRHPoL5E1dztWJmYkmmDN1tnRwkkeuSsTah8";

      await searchInput.click();
      await searchInput.fill(txHash);
      await searchButton.click();

      const txHashEndpoint = `https://api.staging.wormscan.io/api/v1/vaas/?txHash=${txHash}&parsedPayload=true`;
      const txHashResponse = await page.waitForResponse(txHashEndpoint);
      expect(txHashResponse.ok()).toBeTruthy();

      const txHashResponseJson = await txHashResponse.json();
      const txHashId = txHashResponseJson.data[0].id;
      const txHashEndpoint2 = `https://api.staging.wormscan.io/api/v1/transactions/${txHashId}?page=0&pageSize=10&sortOrder=ASC`;
      const txHashResponse2 = await page.waitForResponse(txHashEndpoint2);
      expect(txHashResponse2.ok()).toBeTruthy();

      // check url tx ok
      await page.waitForURL(`${baseURL}/#/tx/${txHash}`);
      expect(page.url()).toBe(`${baseURL}/#/tx/${txHash}`);

      // check search by txHash invalid
      const badTxHash = "4rZmexGcA2eTttK1nihBGPMheho66dQjo123abc123abv123abc123abc123abc";

      await searchInput.click();
      await searchInput.fill(badTxHash);
      await searchButton.click();

      const badTxHashEndpoint = `https://api.staging.wormscan.io/api/v1/vaas/?txHash=${badTxHash}&parsedPayload=true`;
      const badTxHashResponse = await page.waitForResponse(badTxHashEndpoint);
      expect(badTxHashResponse.ok()).toBeFalsy();

      // check url search-not-found page
      await page.waitForURL(`${baseURL}/#/search-not-found/${badTxHash}`);
      expect(page.url()).toBe(`${baseURL}/#/search-not-found/${badTxHash}`);
    });

    test("search by address", async ({ page, baseURL }) => {
      const searchForm = page.getByTestId("search-form");
      const searchInput = searchForm.getByPlaceholder("Search by TxHash / Address / VAA ID");
      const searchButton = searchForm.getByRole("button", { name: "search" });

      // check search by address valid
      const address = "0x685104d2aaf736e4bfaa8480ea4006a6db0b4bb1";

      await searchInput.click();
      await searchInput.fill(address);
      await searchButton.click();

      const addressEndpoint = `https://api.staging.wormscan.io/api/v1/address/${address}`;
      const addressResponse = await page.waitForResponse(addressEndpoint);
      expect(addressResponse.ok()).toBeTruthy();

      const addressEndpoint2 = `https://api.staging.wormscan.io/api/v1/transactions?address=${address}&page=0&pageSize=50&sortOrder=DESC`;
      const addressResponse2 = await page.waitForResponse(addressEndpoint2);
      expect(addressResponse2.ok()).toBeTruthy();

      // check url address ok
      await page.waitForURL(`${baseURL}/#/txs?address=${address}`);
      expect(page.url()).toBe(`${baseURL}/#/txs?address=${address}`);

      // check search by address invalid
      const badAddress = "0x12345abscasdnkdtg12321321";

      await searchInput.click();
      await searchInput.fill(badAddress);
      await searchButton.click();

      const badAddressEndpoint = `https://api.staging.wormscan.io/api/v1/address/${badAddress}`;
      const badResponse = await page.waitForResponse(badAddressEndpoint);
      expect(badResponse.ok()).toBeFalsy();

      const badAddressEndpoint2 = `https://api.staging.wormscan.io/api/v1/vaas/?txHash=${badAddress}&parsedPayload=true`;
      const badResponse2 = await page.waitForResponse(badAddressEndpoint2);
      expect(badResponse2.ok()).toBeFalsy();

      // check url search-not-found page
      await page.waitForURL(`${baseURL}/#/search-not-found/${badAddress}`);
      expect(page.url()).toBe(`${baseURL}/#/search-not-found/${badAddress}`);
    });

    test("search by VAA ID", async ({ page, baseURL }) => {
      const searchForm = page.getByTestId("search-form");
      const searchInput = searchForm.getByPlaceholder("Search by TxHash / Address / VAA ID");
      const searchButton = searchForm.getByRole("button", { name: "search" });

      // check search by VAA ID valid
      const vaaId = "1/ec7372995d5cc8732397fb0ad35c0121e0eaa90d26f828a534cab54391b3a4f5/316347";

      await searchInput.click();
      await searchInput.fill(vaaId);
      await searchButton.click();

      const vaaIdEndpoint = `https://api.staging.wormscan.io/api/v1/vaas/${vaaId}?parsedPayload=true&page=0&pageSize=10&sortOrder=ASC`;
      const vaaIdResponse = await page.waitForResponse(vaaIdEndpoint);
      expect(vaaIdResponse.ok()).toBeTruthy();

      const vaaIdEndpoint2 = `https://api.staging.wormscan.io/api/v1/transactions/${vaaId}?page=0&pageSize=10&sortOrder=ASC`;
      const vaaIdResponse2 = await page.waitForResponse(vaaIdEndpoint2);
      expect(vaaIdResponse2.ok()).toBeTruthy();

      // check url vaa ok
      await page.waitForURL(`${baseURL}/#/tx/${vaaId}`);
      expect(page.url()).toBe(`${baseURL}/#/tx/${vaaId}`);

      // check search by VAA ID invalid
      const badVaaId = "7/ec7372995d5cc8732397fb0ad35c0121e0eaa90d26f828a534cab54391b3a4f5/123456";

      await searchInput.click();
      await searchInput.fill(badVaaId);
      await searchButton.click();

      const badVaaIdEndpoint = `https://api.staging.wormscan.io/api/v1/vaas/${badVaaId}?parsedPayload=true&page=0&pageSize=10&sortOrder=ASC`;
      const badVaaIdResponse = await page.waitForResponse(badVaaIdEndpoint);
      expect(badVaaIdResponse.ok()).toBeFalsy();

      // check url search-not-found page
      await page.waitForURL(`${baseURL}/#/search-not-found?q=${badVaaId}`);
      expect(page.url()).toBe(`${baseURL}/#/search-not-found?q=${badVaaId}`);
    });
  });

  describe("Header Links", () => {
    test("check links", async ({ page, baseURL }) => {
      const header = page.getByTestId("header");

      // check the internal links
      for (const internalLink of internalLinks) {
        await header.getByRole("link", { name: internalLink.name }).click();
        expect(page.url()).toBe(`${baseURL}/${internalLink.href}`);
      }

      // check the external links
      for (const externalLink of externalLinks) {
        const pagePromise = page.waitForEvent("popup");
        await header.getByRole("link", { name: externalLink.name }).click();
        const pageOpen = await pagePromise;
        expect(pageOpen.url()).toBe(externalLink.href);
        await pageOpen.close();
      }
    });
  });
});
