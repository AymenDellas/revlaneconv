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

  const maxRetries = 2;
  const retryDelay = 1000; // 1 second

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
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
        // Consider if this case should prevent returning the content or if it's just a warning
      }

      return htmlContent;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const retryableError = error.code === 'ECONNABORTED' || (error.response && error.response.status >= 500);

        if (retryableError && attempt < maxRetries) {
          console.warn(`[Scraper] Axios error scraping ${validUrl} (Attempt ${attempt + 1}/${maxRetries + 1}): ${error.message}. Retrying in ${retryDelay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue; // Next attempt
        } else {
          // Non-retryable error or max retries reached
          const retriesDone = attempt +1;
          if (error.response) {
            console.error(`[Scraper] Axios error scraping ${validUrl} after ${retriesDone} attempt(s). Status: ${error.response.status}. Data: ${JSON.stringify(error.response.data).substring(0, 200)}`);
            throw new Error(`Failed to scrape HTML from ${validUrl} after ${retriesDone} attempt(s). Status: ${error.response.status}. Message: ${error.message}`);
          } else if (error.request) {
            console.error(`[Scraper] Axios error scraping ${validUrl} after ${retriesDone} attempt(s). No response received. Message: ${error.message}`);
            throw new Error(`Failed to scrape HTML from ${validUrl} after ${retriesDone} attempt(s). No response received. Message: ${error.message}`);
          } else {
            console.error(`[Scraper] Axios error scraping ${validUrl} after ${retriesDone} attempt(s). Error: ${error.message}`);
            throw new Error(`Failed to scrape HTML from ${validUrl} after ${retriesDone} attempt(s). Error: ${error.message}`);
          }
        }
      } else {
        // Non-Axios error
        console.error(`[Scraper] Generic error scraping ${validUrl} with axios:`, error.message);
        throw new Error(`Failed to scrape HTML content from ${validUrl} using axios. Details: ${error.message}`);
      }
    }
  }
  // Should not be reached if logic is correct, but as a fallback:
  throw new Error(`Failed to scrape HTML from ${validUrl} after ${maxRetries + 1} attempts.`);
}