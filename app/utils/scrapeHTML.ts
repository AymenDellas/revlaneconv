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

    // Optional: Strip out nav/footer/noise
    await page.evaluate(() => {
      const selectorsToRemove = "nav, footer, header, script, style, noscript";
      document.querySelectorAll(selectorsToRemove).forEach((el) => el.remove());
    });

    const htmlContent = await page.content();

    if (
      !htmlContent ||
      typeof htmlContent !== "string" ||
      htmlContent.trim().length < 100
    ) {
      const contentLength = htmlContent ? String(htmlContent).length : 0;
      const snippet = htmlContent ? String(htmlContent).substring(0, 200) : "";
      console.warn(
        `[Scraper] Potentially insufficient content from ${validUrl} using Playwright. Length: ${contentLength}. Snippet: \"${snippet}\"`
      );
    }

    return htmlContent;
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
