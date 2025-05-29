import puppeteer, { type PuppeteerLaunchOptions } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
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
    let executablePath: string | undefined = undefined;
    let launchArgs = chromium.args; // Start with sparticuz args as a base

    if (process.env.NODE_ENV !== 'production') {
      console.log("[Scraper] Local development: Using specified executablePath for Chromium.");
      // For local, we might not need all sparticuz args, especially those related to /tmp
      launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ];
      executablePath = 'C:\\Users\\della\\.cache\\puppeteer\\chrome\\win64-127.0.6533.88\\chrome-win64\\chrome.exe';
    } else {
      console.log(`[Scraper] Production environment: Using @sparticuz/chromium. NODE_ENV: ${process.env.NODE_ENV}`);
      executablePath = await chromium.executablePath();
      console.log(`[Scraper] Chromium executable path: ${executablePath}`);
      launchArgs = chromium.args; // Ensure launchArgs are set for production from chromium.args
      console.log(`[Scraper] Chromium args: ${JSON.stringify(launchArgs)}`);
    }

    browser = await puppeteer.launch({
      args: launchArgs,
      defaultViewport: chromium.defaultViewport, // Can still use sparticuz default viewport
      executablePath: executablePath, // Will be from sparticuz in prod, or auto-detected/undefined locally
      headless: (process.env.NODE_ENV === 'production' 
            ? chromium.headless 
            : "new") as PuppeteerLaunchOptions['headless'],
      ignoreHTTPSErrors: true,
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

