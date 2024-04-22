import { test, expect } from "@playwright/test";
import { describe } from "node:test";
import {
  DISCORD_URL,
  GITHUB_URL,
  PROVIDE_FEEDBACK_URL,
  // TWITTER_URL, x.com redirects to twitter.com
  WORMHOLE_BLOG,
  XLABS_ABOUT_US_URL,
  XLABS_CAREERS_URL,
  XLABS_OUR_WORK_URL,
  XLABS_URL,
} from "./../src/consts";

const internalLinks = [
  { name: "Wormhole Scan logo", href: "#/" },
  { name: "Terms of Use", href: "#/terms-of-use" },
];

const externalLinks = [
  { name: "Blog", href: WORMHOLE_BLOG },
  { name: "Twitter link", href: "https://twitter.com/wormhole" },
  { name: "Discord link", href: DISCORD_URL },
  { name: "GitHub link", href: GITHUB_URL },

  { name: "About Us", href: XLABS_ABOUT_US_URL },
  { name: "Our Work", href: XLABS_OUR_WORK_URL },
  { name: "Careers", href: XLABS_CAREERS_URL },
  { name: "Provide Feedback", href: PROVIDE_FEEDBACK_URL },

  { name: "xLabs link", href: XLABS_URL },
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
      await footer.getByRole("link", { name: externalLink.name }).nth(0).click();
      const pageOpen = await pagePromise;
      expect(pageOpen.url().replace(/\/$/, "")).toBe(externalLink.href.replace(/\/$/, ""));
      await pageOpen.close();
    }
  });
});
