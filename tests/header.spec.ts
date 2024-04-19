import { test, expect, Response } from "@playwright/test";
import { describe } from "node:test";
import { WORMHOLE_DOCS_URL } from "../src/consts";

const internalLinks = [
  { name: "VAA Parser", href: "#/vaa-parser" },
  { name: "Wormhole Scan logo", href: "#/" },
  { name: "Transactions", href: "#/txs" },
  { name: "Governor", href: "#/governor" },
];

const externalLinks = [
  { name: "API Docs", href: WORMHOLE_DOCS_URL },
  { name: "Wormhole Docs", href: "https://docs.wormhole.com/wormhole" },
];

describe("Header", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/#/`);
  });

  describe("Header search", () => {
    async function searchTxAndVerify(
      page: {
        getByTestId: (arg0: string) => any;
        waitForResponse: (arg0: string) => any;
        waitForURL: (arg0: string) => any;
        url: () => any;
        waitForTimeout: (arg0: number) => any;
      },
      isByTxHash: boolean,
      inputText: string,
      endpoint: string,
      endpoint2: string,
      expectedURL: string,
      isValid: boolean,
    ) {
      const maxRetries = 3;
      const retryTimeout = 10000;
      let retries = 0;
      let response: Response | undefined;
      let response2: Response | undefined;

      while (retries < maxRetries) {
        try {
          const searchForm = page.getByTestId("search-form");
          const searchInput = searchForm.getByPlaceholder("Search by Tx Hash / Address / VAA ID");
          const searchButton = searchForm.getByRole("button", { name: "search" });

          await searchInput.click();
          await searchInput.fill(inputText);
          await page.waitForTimeout(1000);
          await searchButton.click();

          // wait for the response or timeout
          const racePromise = Promise.race([
            page.waitForResponse(endpoint),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Time limit reached")), retryTimeout),
            ),
          ]);

          response = await racePromise;

          if (isValid) {
            if (isByTxHash) {
              const txHashResponseJson = await response?.json();
              const txHashId = txHashResponseJson.data[0].id;

              const racePromise2 = Promise.race([
                page.waitForResponse(
                  `https://api.staging.wormscan.io/api/v1/transactions/${txHashId}?page=0&pageSize=10&sortOrder=ASC`,
                ),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("Time limit reached")), retryTimeout),
                ),
              ]);

              response2 = await racePromise2;
            } else {
              const racePromise2 = Promise.race([
                page.waitForResponse(endpoint2),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("Time limit reached")), retryTimeout),
                ),
              ]);

              response2 = await racePromise2;
            }
          }

          if (
            (isValid && response?.status() === 200 && response2?.status() === 200) ||
            (!isValid && response?.status() !== 200)
          ) {
            break;
          }
        } catch (error) {
          console.error(`Request error (attempt ${retries + 1}): ${error.message}`);
        }
        retries++;
      }

      // verify the response
      if (!isValid) {
        expect(response?.status()).not.toBe(200);
        await page.waitForURL(expectedURL);
        expect(page.url()).toBe(expectedURL);
      } else {
        expect(response?.status()).toBe(200);
        await page.waitForURL(expectedURL);
        expect(page.url()).toBe(expectedURL);
      }
    }

    test("search by txHash", async ({ page, baseURL }) => {
      const txHash =
        "5rZmexGcA2eTttK1nihBGPMheho66dQjoNNg8TXYBCybiMS2cw5ZkRHPoL5E1dztWJmYkmmDN1tnRwkkeuSsTah8";
      const txHashEndpoint = `https://api.staging.wormscan.io/api/v1/operations?page=0&pageSize=10&sortOrder=ASC&txHash=${txHash}`;
      const expectedURL = `${baseURL}/#/tx/${txHash}`;
      await searchTxAndVerify(page, false, txHash, txHashEndpoint, "", expectedURL, true);
    });

    test("search by address", async ({ page, baseURL }) => {
      const address = "0x685104d2aaf736e4bfaa8480ea4006a6db0b4bb1";
      const addressEndpoint = `https://api.staging.wormscan.io/api/v1/operations?page=0&pageSize=50&sortOrder=DESC&address=${address}`;
      const expectedURL = `${baseURL}/#/txs?address=${address}&network=MAINNET`;
      await searchTxAndVerify(page, false, address, addressEndpoint, "", expectedURL, true);
    });

    test("search by VAA ID", async ({ page, baseURL }) => {
      const vaaId = "1/ec7372995d5cc8732397fb0ad35c0121e0eaa90d26f828a534cab54391b3a4f5/316347";
      const vaaIdEndpoint = `https://api.staging.wormscan.io/api/v1/operations/${vaaId}?page=0&pageSize=10&sortOrder=ASC`;
      const expectedURL = `${baseURL}/#/tx/${vaaId}`;
      await searchTxAndVerify(page, false, vaaId, vaaIdEndpoint, "", expectedURL, true);
    });
  });

  describe("Header Links", () => {
    test("check links in header", async ({ page, baseURL }) => {
      const header = page.getByTestId("header");

      for (const internalLink of internalLinks) {
        const dataState = await page.getAttribute(".dropdown-menu-trigger", "data-state");
        if (dataState === "closed") {
          await page.click(".dropdown-menu-trigger");
        }
        await header.getByRole("link", { name: internalLink.name }).click();
        expect(page.url()).toBe(`${baseURL}/${internalLink.href}`);
      }

      for (const externalLink of externalLinks) {
        const dataState = await page.getAttribute(".dropdown-menu-trigger", "data-state");
        if (dataState === "closed") {
          await page.click(".dropdown-menu-trigger");
        }
        const pagePromise = page.waitForEvent("popup");
        await header.getByRole("link", { name: externalLink.name }).click();
        const pageOpen = await pagePromise;
        expect(pageOpen.url().replace(/\/$/, "")).toBe(externalLink.href.replace(/\/$/, ""));
        await pageOpen.close();
      }
    });
  });
});
