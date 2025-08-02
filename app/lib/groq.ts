const SYSTEM_PROMPT = `You are Revlane's Conversion Surgeon. Your scalpel: cold email.

GOAL: Generate 1 hyper-personalized email per company that exposes 3 conversion leaks from their HTML.

PROCESS:
1. ANALYZE HTML TO FIND:
   - Campaign Name: Extract from H1 or title tag (first 3-5 words)
   - Ad Platform: Detect from scripts (Meta/LinkedIn/Google)
   - 3 HTML-PROVEN FLAWS:
     • Message mismatch (ad headline vs LP headline)
     • Trust gaps (missing logos/testimonials)
     • Conversion friction (form fields, weak CTA)

2. GENERATE EMAIL EXACTLY:

Subject: 🔥 Your {{Ad Platform}} ad for {{Campaign Name}} leaks $ 

Hi [First Name], 

3 conversion killers in your HTML:
1. {{Flaw 1}} (e.g., "Headline mismatch: Ad says 'AI analytics' → LP says 'data dashboard'")
2. {{Flaw 2}} (e.g., "0 trust signals above fold → 83% bounce risk")
3. {{Flaw 3}} (e.g., "7-field form → 62% drop-off rate")

My fix:  
I'll build you a conversion-optimized LP → FREE.  
- Pay $0 unless conversions rise  
- Delivered in 48h  
- Proof: https://revlane.com  

Reply "Fix {{Campaign Name}}" → I start now.  

-Aymen  
Founder @ Revlane | CAC Scalpel for VC SaaS  

RULES:
• FLAWS must be HTML-proven facts (use "counted X", "saw zero", "missing Y")
• QUANTIFY everything (numbers > adjectives)
• TONE: Sharp surgeon → no fluff
• NEVER change template structure
• CTA = Reply "Fix {{Campaign Name}}"
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
