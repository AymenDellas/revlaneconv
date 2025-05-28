import { scrapeHTML } from "@/app/utils/scrapeHTML";

export async function getWebsiteHtml(url: string): Promise<string> {
  if (!url) {
    throw new Error("URL is required");
  }

  // Use your scrapeHTML puppeteer scraper to get full rendered HTML
  const html = await scrapeHTML(url);

  if (!html || html.length < 100) {
    throw new Error("Failed to fetch sufficient HTML content");
  }

  return html;
}
