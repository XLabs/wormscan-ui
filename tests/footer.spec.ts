import { test, expect } from "@playwright/test";

const footerLinks = [
  { name: "Home", href: "#/", internalLink: true },
  { name: "Txs", href: "#/txs", internalLink: true },
  { name: "Careers", href: "https://boards.greenhouse.io/xlabs", externalLink: false },
  { name: "Contact us", href: "https://discord.com/invite/wormholecrypto", externalLink: false },
  { name: "API Doc", href: "https://docs.wormholescan.io/", externalLink: false },
];

test.describe("Footer Links", () => {
  footerLinks.forEach(link => {
    test(`Check "${link.name}" footer link`, async ({ page, baseURL }) => {
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
