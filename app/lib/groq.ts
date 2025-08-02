const SYSTEM_PROMPT = `You are a Conversion Analyst. Analyze ONLY the provided landing page HTML to identify 3 quantifiable conversion leaks, then generate a cold email with this exact structure:

1. EXTRACT FROM HTML:
   - CAMPAIGN: Primary offer from <h1> or <title> (first 3-5 words)
   - FIND 3 QUANTIFIABLE FLAWS (visible in HTML):
     1. Trust deficit (missing logos/testimonials/security badges)
     2. Conversion friction (form fields, weak CTA, no urgency)
     3. Clarity issues (confusing value prop, weak headline)

2. GENERATE THIS EXACT EMAIL:

Subject: 3 conversion leaks in your {{Campaign}} landing page

Hi [First Name], 

Your landing page has critical flaws I found in the HTML:
1. {{Flaw 1}} (e.g. "0 trust signals → 81% bounce risk")
2. {{Flaw 2}} (e.g. "7-field form → 63% drop-off")
3. {{Flaw 3}} (e.g. "Weak headline: 'Welcome' doesn't explain value")

I'll fix all 3 → 100% free:
- Build high-converting LP in 48h
- No cost, no obligations
- If it works? We talk. If not? You keep the page.

Reply "FIX" → I start immediately.

-Aymen
Founder, Revlane

RULES:
• FLAWS must be HTML-visible ONLY (use "counted X", "saw zero Y")
• QUANTIFY everything (numbers only)
• NEVER mention ads - only LP issues
• USE {{Campaign}} placeholder from HTML
• NO comparisons to unseen elements
• TONE: Direct, analytical
• NO markdown`;



export async function callGroq(
  htmlContent: string,
  systemPrompt: string = SYSTEM_PROMPT
): Promise<string> {
  // Add this debug line
  console.log("Using API Key:", process.env.GROQ_API_KEY);
  console.log("API Key from env", process.env.GROQ_API_KEY);

  if (!process.env.GROQ_API_KEY) {
    console.error("Missing Groq API Key");
    throw new Error("API configuration error - contact support");
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: htmlContent.slice(0, 12000),
          },
        ],
        temperature: 0.2,
        max_tokens: 2500,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      const errorText = await res.text(); // Get response as text to see what it is
      console.error(`[Groq API Error] Status: ${res.status} ${res.statusText}`);
      console.error(
        `[Groq API Error] Response Body (first 500 chars): ${errorText.substring(
          0,
          500
        )}...`
      );

      if (res.status === 401) {
        console.error(
          "Invalid API key - please check your .env file or environment variables."
        );
        // Provide a more specific error message for 401
        throw new Error(
          "Invalid Groq API key. Please check your configuration and try again."
        );
      }

      // Try to parse as JSON for structured error, but fallback if it's not JSON
      let errorDataMessage = "Unknown error";
      try {
        const errorData = JSON.parse(errorText); // Try parsing the logged text
        errorDataMessage =
          errorData.error?.message || errorText.substring(0, 200); // Use parsed message or snippet
      } catch (e) {
        // If parsing fails, use a snippet of the raw error text
        errorDataMessage =
          errorText.substring(0, 200) + (errorText.length > 200 ? "..." : "");
      }
      throw new Error(`Groq API request failed with status ${res.status} ${res.statusText}: ${errorDataMessage}`);
    }

    // If res.ok, but content type is not JSON, it's also an issue
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await res.text();
      console.error(
        `[Groq API Error] Expected JSON response, but got Content-Type: ${contentType}`
      );
      console.error(
        `[Groq API Error] Response Body (first 500 chars): ${responseText.substring(
          0,
          500
        )}...`
      );
      throw new Error(
        `Analysis failed: Expected JSON response from Groq API, but received ${contentType}. Response snippet: ${responseText.substring(
          0,
          200
        )}` + (responseText.length > 200 ? "..." : "")
      );
    }

    const data = await res.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Analysis Error:", error);
    // Rethrow the error instead of using fallback
    throw error;
  }
}

// Generic fallback response
function fallbackAnalysis(message?: string) {
  return `BUSINESS ANALYSIS:
---
General Purpose: Currently analyzing website data
Target Audience: Audience analysis in progress
Core Offering: Service analysis underway
Unique Value Proposition: Differentiators being identified

Key Metrics:
• Website performance
• Conversion rates
• User engagement

Competitors:
• Industry analysis pending

COLD EMAIL TEMPLATE:
---
Subject: Website optimization opportunity

Hi [Name],

We specialize in helping businesses improve their online presence. Let's discuss how we can enhance your website's performance.

Available for a quick call this week?

Best regards,
[Your Name]`;
}
