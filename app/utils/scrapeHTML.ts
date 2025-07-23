import axios from "axios";
import * as cheerio from "cheerio";
import { validateAndNormalizeUrl } from "@/app/lib/urlUtils";

export async function scrapeHTML(url: string): Promise<string> {
  const validUrl = validateAndNormalizeUrl(url);
  if (!validUrl) {
    throw new Error("Invalid URL format - please check the URL");
  }

  console.log(
    `[Scraper] Starting to fetch content from: ${validUrl} using axios and cheerio`
  );

  try {
    const response = await axios.get(validUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
      },
    });
    const html = response.data;
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $("nav, footer, script, style, [aria-hidden='true']").remove();

    // Extract text from relevant elements
    const selectors = [
      "h1",
      "h2",
      "h3",
      "p",
      "a",
      "li",
      "span",
      "div[class*='content']",
      "div[class*='main']",
      "div[id*='content']",
      "div[id*='main']",
    ];
    let extractedText = "";
    $(selectors.join(",")).each((i, elem) => {
      const text = $(elem).text().trim();
      if (text) {
        extractedText += text + "\\n";
      }
    });

    if (extractedText.trim().length < 100) {
      console.log("Extracted content was less than 100 characters long.");
      throw new Error("Could not extract sufficient content from the website.");
    }

    return extractedText;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error(
        `[Scraper] Axios error scraping ${validUrl}: ${error.message}`
      );
      throw new Error(
        `Failed to scrape HTML content from ${validUrl} using axios. Details: ${error.message}`
      );
    } else {
      console.error(
        `[Scraper] Generic error scraping ${validUrl}: ${error.message}`
      );
      throw new Error(
        `Failed to scrape HTML content from ${validUrl}. Details: ${error.message}`
      );
    }
  }
}
