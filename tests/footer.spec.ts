import { test, expect } from "@playwright/test";
import { describe } from "node:test";
import { DISCORD_URL } from "./../src/consts";

const internalLinks = [
  { name: "Wormhole Scan logo", href: "#/" },
  { name: "Home", href: "#/" },
  { name: "Txs", href: "#/txs" },
];

const externalLinks = [
  { name: "Built by xLabs", href: "https://www.xlabs.xyz/" },
  { name: "Careers", href: "https://jobs.ashbyhq.com/Xlabs" },
  { name: "Contact us", href: DISCORD_URL },
  { name: "API Doc", href: "https://docs.wormholescan.io/" },
  { name: "Discord link", href: DISCORD_URL },
  { name: "Twitter link", href: "https://twitter.com/wormholecrypto" },
];

describe("Footer Links", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/#/`);
  });

  test("Check footer links", async ({ page, baseURL }) => {
    const footer = page.getByTestId("footer");

    // check the internal links
    for (const internalLink of internalLinks) {
      await footer.getByRole("link", { name: internalLink.name }).click();
      expect(page.url()).toBe(`${baseURL}/${internalLink.href}`);
    }

    // check the external links
    for (const externalLink of externalLinks) {
      const pagePromise = page.waitForEvent("popup");
      await footer.getByRole("link", { name: externalLink.name }).click();
      const pageOpen = await pagePromise;
      expect(pageOpen.url()).toBe(externalLink.href);
      await pageOpen.close();
    }
  });
});
