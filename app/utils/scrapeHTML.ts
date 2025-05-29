import axios from 'axios';
import { validateAndNormalizeUrl } from "@/app/lib/urlUtils";

/**
 * Scrapes HTML content from a given URL using axios
 * @param url The URL to scrape
 * @returns Promise with the HTML content
 */
export async function scrapeHTML(url: string): Promise<string> {
  const validUrl = validateAndNormalizeUrl(url);
  if (!validUrl) {
    throw new Error("Invalid URL format - please check the URL");
  }

  console.log(`[Scraper] Starting to fetch content from: ${validUrl} using axios`);

  try {
    const response = await axios.get(validUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000, // 15 seconds timeout
    });

    const htmlContent = response.data;

    if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.trim().length < 100) {
      const contentLength = htmlContent ? String(htmlContent).length : 0;
      const snippet = htmlContent ? String(htmlContent).substring(0, 200) : "";
      console.warn(`[Scraper] Potentially insufficient content from ${validUrl} using axios. Length: ${contentLength}. Snippet: \"${snippet}\"`);
    }
    
    return htmlContent;

  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error(`[Scraper] Axios error scraping ${validUrl}: ${error.message}`);
      if (error.response) {
        console.error(`[Scraper] Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data).substring(0, 200)}`);
      }
      throw new Error(`Failed to scrape HTML content from ${validUrl} using axios. Status: ${error.response?.status}, Message: ${error.message}`);
    } else {
      console.error(`[Scraper] Generic error scraping ${validUrl} with axios:`, error.message);
      throw new Error(`Failed to scrape HTML content from ${validUrl} using axios. Details: ${error.message}`);
    }
  }
}