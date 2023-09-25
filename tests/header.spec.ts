import { test, expect } from "@playwright/test";

const headerLinks = [
  { name: "Home", href: "#/", internalLink: true },
  { name: "Txs", href: "#/txs", internalLink: true },
  { name: "Careers", href: "https://www.portalbridge.com/#/transfer", externalLink: false },
];

test.describe("Header Links", () => {
  headerLinks.forEach(link => {
    test(`Check "${link.name}" header link`, async ({ page, baseURL }) => {
      await page.goto(link.href);

      if (link.internalLink) {
        expect(page.url()).toBe(`${baseURL}/${link.href}`);
        return;
      } else {
        expect(page.url()).toBe(link.href);
      }
    });
  });
});
