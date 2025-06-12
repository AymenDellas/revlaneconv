import { callGroq } from "./groq";
import * as cheerio from "cheerio";

interface PageSpeedData {
  performanceScore?: number;
  fcp?: string;
  lcp?: string;
  cls?: string;
  error?: string;
}

export async function analyzeWebsite(html: string, pageSpeedData: PageSpeedData | null) {
  if (!html || html.length < 100) {
    throw new Error("Not enough HTML to analyze");
  }

  const $ = cheerio.load(html);

  const title = $("title").text();
  const metaDescription = $('meta[name="description"]').attr("content") || "";

  const headings: string[] = [];
  $("h1, h2, h3").each((_, el) => {
    headings.push($(el).text());
  });

  let mainContent: string[] = [];
  $("main p, main li, main span, article p, article li, article span, section p, section li, section span").each((_, el) => {
    // Avoid grabbing script/style content if spans are used broadly
    if (!$(el).closest("script, style").length) {
      mainContent.push($(el).text());
    }
  });

  const ctas: { text: string; href: string }[] = [];
  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href");
    if (href) {
      ctas.push({ text, href });
    }
  });

  const imageAlts: string[] = [];
  $("img").each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt) {
      imageAlts.push(alt);
    }
  });

  let structuredData = `Page Title: ${title}\n\n`;
  structuredData += `Meta Description: ${metaDescription}\n\n`;

  structuredData += "Headings:\n";
  headings.forEach(h => structuredData += `- ${h}\n`);
  structuredData += "\n";

  structuredData += "Main Content Snippets:\n";
  mainContent.filter(snippet => snippet.trim().length > 10).slice(0, 15).forEach(snippet => structuredData += `- ${snippet.trim()}\n`); // Limiting snippets for brevity
  structuredData += "\n";

  structuredData += "Calls to Action:\n";
  ctas.slice(0, 10).forEach(cta => structuredData += `- Text: ${cta.text}, Link: ${cta.href}\n`); // Limiting CTAs for brevity
  structuredData += "\n";

  structuredData += "Image Descriptions (Alt Text):\n";
  imageAlts.slice(0, 10).forEach(alt => structuredData += `- ${alt}\n`);
  structuredData += "\n";

  if (pageSpeedData && !pageSpeedData.error) {
    structuredData += "Page Performance Metrics (from Google PageSpeed Insights):\n";
    structuredData += `- Overall Performance Score: ${pageSpeedData.performanceScore}/100\n`;
    structuredData += `- First Contentful Paint (FCP): ${pageSpeedData.fcp}\n`;
    structuredData += `- Largest Contentful Paint (LCP): ${pageSpeedData.lcp}\n`;
    structuredData += `- Cumulative Layout Shift (CLS): ${pageSpeedData.cls}\n\n`;
  } else if (pageSpeedData && pageSpeedData.error) {
    // Optionally, log that PageSpeed data was attempted but resulted in an error,
    // or include a note in structuredData itself. For now, omitting if error.
    console.warn(`[analyzeWebsite] PageSpeed data had an error: ${pageSpeedData.error}, so it won't be included in structuredData.`);
  }

  // Check if structuredData is too short (e.g. if all fields were empty)
  // Adjusted threshold slightly to account for base structure even if pageSpeedData is missing.
  if (structuredData.length < 60 && (!pageSpeedData || pageSpeedData.error)) {
    throw new Error("Not enough structured data to analyze from the HTML");
  }

  const analysis = await callGroq(structuredData);
  return analysis;
}
