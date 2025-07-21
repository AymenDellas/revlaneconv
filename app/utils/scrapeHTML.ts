import puppeteer from "puppeteer";
import { validateAndNormalizeUrl } from "@/app/lib/urlUtils";

export async function scrapeHTML(url: string): Promise<string> {
  const validUrl = validateAndNormalizeUrl(url);
  if (!validUrl) {
    throw new Error("Invalid URL format - please check the URL");
  }

  console.log(
    `[Scraper] Starting to fetch content from: ${validUrl} using Puppeteer`
  );

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(validUrl, { waitUntil: "networkidle0" });

    const extractedContent = await page.evaluate(() => {
      const selectors = [
        "h1",
        "h2",
        "h3",
        "p",
        "span",
        "button",
        'a[href*="signup"]',
        'a[href*="get"]',
        '[role="button"]',
        ".hero",
        ".features",
        ".cta",
        ".testimonials",
      ];

      // Exclude navbars, footers, cookie banners
      const excludeSelectors = "nav, footer, #cookie-banner, .cookie-consent";
      document.querySelectorAll(excludeSelectors).forEach((el) => el.remove());

      let content = "";
      document.querySelectorAll(selectors.join(", ")).forEach((el) => {
        if (el.textContent && el.textContent.trim() !== "") {
          content += el.textContent.trim() + "\\n";
        }
      });

      return content;
    });

    if (!extractedContent || extractedContent.trim().length < 100) {
      throw new Error("Could not extract visible landing page content.");
    }

    return extractedContent;
  } catch (error: any) {
    console.error(
      `[Scraper] Puppeteer error scraping ${validUrl}: ${error.message}`
    );
    throw new Error(
      `Failed to scrape HTML content from ${validUrl} using Puppeteer. Details: ${error.message}`
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
