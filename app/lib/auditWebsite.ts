import { callGroqAudit } from "./groq";

export async function auditWebsite(html: string) {
  if (!html || html.length < 100) {
    throw new Error("Not enough HTML to analyze");
  }

  // Just call Groq API with the HTML content and return the result
  const analysis = await callGroqAudit(html);
  return analysis;
}
