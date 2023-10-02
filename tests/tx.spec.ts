import { test, expect } from "@playwright/test";
import { describe } from "node:test";

// generic 7fc7387b325746a0751c3dee008214d1e195a5eb8d2706f7986ecbe003a2e549
// double 7d4963fe9a658568cdd4ba90bc20fdb2197be99fefed1c9664906b0442d76b4e
// with fee 601c7bc77004819248aa505e0e5c7cf60d917691d571cb7e1c5364a7f75b245f

describe("Tx Page", () => {
  const txsURL = [
    "7fc7387b325746a0751c3dee008214d1e195a5eb8d2706f7986ecbe003a2e549",
    "7d4963fe9a658568cdd4ba90bc20fdb2197be99fefed1c9664906b0442d76b4e",
    "601c7bc77004819248aa505e0e5c7cf60d917691d571cb7e1c5364a7f75b245f",
  ];

  for (let i = 0; i < txsURL.length; i++) {
    test(`check links in tx ${i + 1}`, async ({ page, baseURL }) => {
      const tx = txsURL[i];
      await page.goto(`${baseURL}/#/tx/${tx}`);

      await Promise.race([
        page.waitForSelector(".relayer-tx-overview"),
        page.waitForSelector(".tx-overview"),
      ]);

      // select all <a> elements in the tx-information.
      const links = await page.locator(".tx-information a").all();

      for (const link of links) {
        const href = await link.getAttribute("href");
        const pagePromise = page.waitForEvent("popup");
        await link.click();
        const pageOpen = await pagePromise;

        expect(pageOpen.url()).toBe(href);
        await pageOpen.close();
      }
    });
  }
});
