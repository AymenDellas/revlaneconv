import puppeteer from 'puppeteer';
import { validateAndNormalizeUrl } from "@/app/lib/urlUtils";

/**
 * Scrapes HTML content from a given URL using Puppeteer
 * @param url The URL to scrape
 * @returns Promise with the HTML content
 */
export async function scrapeHTML(url: string): Promise<string> {
  const validUrl = validateAndNormalizeUrl(url);
  if (!validUrl) {
    throw new Error("Invalid URL format - please check the URL");
  }

  console.log(`[Scraper] Starting to fetch content from: ${validUrl} using Puppeteer`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true, // Use the new headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common args for compatibility
    });
    const page = await browser.newPage();
    
    // Set a user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    
    // Navigate to the page
    await page.goto(validUrl, {
      waitUntil: 'networkidle2', // Wait until network activity has calmed down
      timeout: 45000 // 45 seconds timeout, Puppeteer can be slower
    });

    const htmlContent = await page.content();

    if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.trim().length < 100) {
      const contentLength = htmlContent ? String(htmlContent).length : 0;
      const snippet = htmlContent ? String(htmlContent).substring(0, 200) : "";
      console.warn(`[Scraper] Potentially insufficient content from ${validUrl} using Puppeteer. Length: ${contentLength}. Snippet: \"${snippet}\"`);
    }
    
    return htmlContent;

  } catch (error: any) {
    console.error(`[Scraper] Error scraping ${validUrl} with Puppeteer:`, error.message);
    throw new Error(`Failed to scrape HTML content from ${validUrl} using Puppeteer. Details: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

