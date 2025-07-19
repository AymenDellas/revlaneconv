import { chromium } from "playwright";
import { validateAndNormalizeUrl } from "@/app/lib/urlUtils";

export async function scrapeHTML(url: string): Promise<string> {
  const validUrl = validateAndNormalizeUrl(url);
  if (!validUrl) {
    throw new Error("Invalid URL format - please check the URL");
  }

  console.log(`[Scraper] Starting to fetch content from: ${validUrl} using Playwright`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    await page.goto(validUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000); // Wait for 3 seconds after network idle

    const extractedText = await page.evaluate(() => {
      const selectorsToRemove = "nav, footer, header, script, style, noscript, [aria-modal], [role='dialog']";
      document.querySelectorAll(selectorsToRemove).forEach((el) => el.remove());

      const contentSelectors = "h1, h2, h3, h4, h5, h6, p, button, a[href*='signup'], [role='button'], [class*='hero'], [class*='features'], [class*='testimonials']";
      const elements = Array.from(document.querySelectorAll(contentSelectors));

      let visibleText = "";
      elements.forEach(el => {
        if (el instanceof HTMLElement && el.offsetParent !== null) {
          visibleText += el.innerText + "\n";
        }
      });

      return visibleText;
    });

    if (!extractedText || extractedText.trim().length < 100) {
      throw new Error("Couldn’t find readable content. Page might be JavaScript-protected or empty.");
    }

    return extractedText;
  } catch (error: unknown) {
    let message = `Failed to scrape HTML content from ${validUrl} using Playwright.`;
    if (error instanceof Error) {
      message += ` Details: ${error.message}`;
    }
    console.error(`[Scraper] Error scraping ${validUrl} with Playwright:`, error);
    throw new Error(message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
