import * as cheerio from "cheerio";

export async function scrapeHTML(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const html = await res.text();

    const $ = cheerio.load(html);

    $("script, style, noscript").remove();

    const text = $("body").text();
    return text.replace("/s+/g", "");
  } catch (error) {
    console.log("error scraping this page : ", error);
    return "Error scraping page";
  }
}
