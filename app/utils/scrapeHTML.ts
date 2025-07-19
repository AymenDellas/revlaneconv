import axios from "axios";
import axiosRetry from "axios-retry";
import { HttpsProxyAgent } from "https-proxy-agent";
import { validateAndNormalizeUrl } from "@/app/lib/urlUtils";

// Configure axios retry globally
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) =>
    error.response?.status === 403 ||
    error.response?.status === 429 ||
    error.code === "ECONNABORTED",
});

const PROXY_URL = process.env.SCRAPING_PROXY;
const proxyAgent = PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : undefined;

export async function scrapeHTML(url: string): Promise<string> {
  const validUrl = validateAndNormalizeUrl(url);
  if (!validUrl) {
    throw new Error("Invalid URL format - please check the URL");
  }

  console.log(
    `[Scraper] Starting to fetch content from: ${validUrl} using axios`
  );

  const headers = {
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
    Referer: "https://google.com/",
  };

  try {
    const response = await axios.get(validUrl, {
      headers,
      timeout: 15000,
      httpsAgent: proxyAgent,
    });

    const htmlContent = response.data;

    if (
      !htmlContent ||
      typeof htmlContent !== "string" ||
      htmlContent.trim().length < 100
    ) {
      const contentLength = htmlContent ? String(htmlContent).length : 0;
      const snippet = htmlContent ? String(htmlContent).substring(0, 200) : "";
      console.warn(
        `[Scraper] Potentially insufficient content from ${validUrl} using axios. Length: ${contentLength}. Snippet: \"${snippet}\"`
      );
    }

    return htmlContent;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        `[Scraper] Axios error scraping ${validUrl}: ${error.message}`
      );
      if (error.response) {
        console.error(
          `[Scraper] Status: ${error.response.status}, Data: ${JSON.stringify(
            error.response.data
          ).substring(0, 200)}`
        );
      }

      let errorMsg = `Failed to scrape HTML content from ${validUrl} using axios. `;
      errorMsg += `Status: ${error.response?.status || "No response"}. `;

      if (error.response?.status === 403) {
        errorMsg += "The website is blocking our requests due to:";
        errorMsg += "\n- Bot detection mechanisms";
        errorMsg += "\n- Geographic restrictions";
        errorMsg += "\n- WAF (Web Application Firewall) rules";
        errorMsg += "\n\nConsider using a professional proxy service.";
      }

      throw new Error(errorMsg);
    } else if (error instanceof Error) {
      console.error(
        `[Scraper] Generic error scraping ${validUrl} with axios:`,
        error.message
      );
      throw new Error(
        `Failed to scrape HTML content from ${validUrl} using axios. Details: ${error.message}`
      );
    } else {
      console.error(
        `[Scraper] Unknown error scraping ${validUrl} with axios:`,
        error
      );
      throw new Error(
        `An unknown error occurred while scraping HTML from ${validUrl}`
      );
    }
  }
}
