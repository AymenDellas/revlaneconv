import { validateAndNormalizeUrl } from "./urlUtils";

interface PageSpeedMetrics {
  performanceScore?: number;
  fcp?: string;
  lcp?: string;
  cls?: string;
  error?: string;
}

export async function fetchPageSpeedInsights(url: string): Promise<PageSpeedMetrics> {
  const apiKey = process.env.PAGESPEED_API_KEY;

  if (!apiKey) {
    console.warn("[PageSpeed] API key (PAGESPEED_API_KEY) is not configured in environment variables.");
    return { error: "PageSpeed API key not configured. Performance insights will be unavailable." };
  }

  const normalizedUrl = validateAndNormalizeUrl(url);
  if (!normalizedUrl) {
    return { error: "Invalid URL for PageSpeed Insights." };
  }

  const apiCategory = "PERFORMANCE";
  const apiStrategy = "MOBILE";
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&key=${apiKey}&strategy=${apiStrategy}&category=${apiCategory}`;

  try {
    console.log(`[PageSpeed] Fetching insights for ${normalizedUrl} (Strategy: ${apiStrategy}, Category: ${apiCategory})`);
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(20000), // 20 seconds timeout for PageSpeed API
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[PageSpeed] API error for ${normalizedUrl}: ${response.status} ${response.statusText}. Body: ${errorBody.substring(0,500)}`);
      if (response.status === 400) { // Often due to bad URL for PageSpeed or other request malformation
         return { error: `PageSpeed API request failed (400): Could not fetch insights for the provided URL. It might be invalid or inaccessible.` };
      } else if (response.status === 403) { // Often API key issue
         return { error: `PageSpeed API request failed (403): Forbidden. Check your PageSpeed API key and its restrictions.` };
      }
      return { error: `PageSpeed API request failed (${response.status}): ${response.statusText}` };
    }

    const data = await response.json();

    if (data.error) {
        console.error(`[PageSpeed] API returned an error for ${normalizedUrl}: ${data.error.message}`);
        return { error: `PageSpeed API returned an error: ${data.error.message}` };
    }

    if (!data.lighthouseResult || !data.lighthouseResult.categories || !data.lighthouseResult.categories.performance) {
        console.warn(`[PageSpeed] Performance category not found in API response for ${normalizedUrl}. Full response keys: ${Object.keys(data.lighthouseResult || {}).join(', ')}`);
        return { error: "Could not retrieve performance score from PageSpeed API response." };
    }


    const performanceScore = data.lighthouseResult.categories.performance.score !== null ? Math.round(data.lighthouseResult.categories.performance.score * 100) : undefined;
    const fcp = data.lighthouseResult.audits['first-contentful-paint']?.displayValue;
    const lcp = data.lighthouseResult.audits['largest-contentful-paint']?.displayValue;
    const cls = data.lighthouseResult.audits['cumulative-layout-shift']?.displayValue;

    if (performanceScore === undefined || !fcp || !lcp || cls === undefined) {
        console.warn(`[PageSpeed] One or more key metrics missing in PageSpeed response for ${normalizedUrl}.`);
        // Log what was actually received for debugging
        console.log(`[PageSpeed] Received metrics - Score: ${performanceScore}, FCP: ${fcp}, LCP: ${lcp}, CLS: ${cls}`);
        return { error: "One or more key PageSpeed metrics were missing in the API response."};
    }

    console.log(`[PageSpeed] Successfully fetched insights for ${normalizedUrl}: Score ${performanceScore}`);
    return { performanceScore, fcp, lcp, cls };

  } catch (error: any) {
    console.error(`[PageSpeed] Network or other error fetching PageSpeed Insights for ${normalizedUrl}:`, error.message);
    if (error.name === 'TimeoutError') {
      return { error: "PageSpeed API request timed out." };
    }
    return { error: `Failed to fetch PageSpeed Insights: ${error.message}` };
  }
}
