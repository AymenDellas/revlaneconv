import axios from 'axios';
import { validateAndNormalizeUrl } from "@/app/lib/urlUtils";

/**
 * Scrapes HTML content from a given URL using axios
 * @param url The URL to scrape
 * @returns Promise with the HTML content
 */
export async function scrapeHTML(url: string): Promise<string> {
  // Validate URL first before attempting to scrape
  const validUrl = validateAndNormalizeUrl(url);
  if (!validUrl) {
    throw new Error("Invalid URL format - please check the URL");
  }

  console.log(`[Scraper] Starting to fetch content from: ${validUrl} using axios`);
  
  try {
    const response = await axios.get(validUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', // Modern user-agent
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br', // Request compressed content
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 30000 // 30 seconds timeout
    });

    const htmlContent = response.data;
    
    // Basic check for content type and length
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('text/html')) {
      console.warn(`[Scraper] Content from ${validUrl} may not be HTML. Content-Type: ${contentType}`);
    }

    if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.trim().length < 100) {
      const contentLength = htmlContent ? String(htmlContent).length : 0;
      const snippet = htmlContent ? String(htmlContent).substring(0, 200) : "";
      // Log a warning but still return the content. The calling function can decide if it's sufficient.
      console.warn(`[Scraper] Potentially insufficient content from ${validUrl} using axios. Length: ${contentLength}. Snippet: \"${snippet}\"`);
    }
    
    return htmlContent;

  } catch (error: any) {
    console.error(`[Scraper] Error scraping ${validUrl} with axios:`, error.message);
    let errorMessage = `Failed to scrape HTML content from ${validUrl} using axios.`;
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage += ` Status: ${error.response.status} - ${error.response.statusText}.`;
      } else if (error.request) {
        errorMessage += ` No response received from server.`;
      } else {
        errorMessage += ` Error setting up request: ${error.message}.`;
      }
    } else {
      errorMessage += ` Details: ${error.message}.`;
    }
    throw new Error(errorMessage);
  }
}

