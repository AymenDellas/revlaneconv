import { callGroq } from "./groq";

export async function analyzeWebsite(html: string) {
  if (!html || html.length < 100) {
    throw new Error("Not enough HTML to analyze");
  }

  // Just call Groq API with the HTML content and return the result
  const analysis = await callGroq(html);
  return analysis;
}
