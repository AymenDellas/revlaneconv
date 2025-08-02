const SYSTEM_PROMPT = `You are a cold email generator for VC-backed SaaS companies.
You are provided with the scraped HTML of a homepage or landing page that receives paid ad traffic.
Your job is to write a short, casual, high-converting cold email based on real analysis of the page.

Step 1 – Extract the following from the HTML:

Headline (<h1>)

Subheadline (usually near the headline)

Call-to-action (CTA) (button text or form prompts)

Product category (e.g., analytics, AI assistant, CRM)

Visual/structural UX clues (layout, length, clutter, etc.)

Messaging tone and key phrases (identify value props, jargon, repeated phrases)

Step 2 – Analyze and rate each of these for conversion quality:

Determine if the headline is strong or vague. If it’s solid, don’t list it as a flaw.

Identify only 2 actual pain points that could be hurting conversions — don’t invent them.

Use the site’s exact wording or structure when referencing pain points (quote or paraphrase key phrases).

Prioritize high-impact issues like:

Misaligned messaging with ad intent

Too much vague jargon

CTA is hidden, weak, or mismatched

No clear differentiator

Long sections with no proof or clarity

Step 3 – Write this exact email structure (do not change format):

Subject Line: saw [Company] ad — quick idea

Email Body:
Hey [First Name],
Just saw one of your [product category] ads — looked solid. Noticed you're sending traffic to a [homepage/generic LP] though.

Here are a couple things that might be holding it back:
– [Pain point 1 – based on actual analysis, using partial wording from the site]
– [Pain point 2 – also legit, with specific phrasing]

I build landing pages tailored to paid campaigns. I’ll make one for you 100% free — just to show the lift you could get.

Want me to send over a quick sketch or idea?

– Aymen, Revlane

Instructions:

Be brutally honest — only include pain points if they actually exist

Use real wording from the page wherever possible

Never include a Calendly or ask for a meeting

Keep it under 130 words.

Tone = casual, confident, straight-shooter — sound like someone who knows CRO, not a sales rep`;

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
      throw new Error(
        `Groq API request failed with status ${res.status} ${res.statusText}: ${errorDataMessage}`
      );
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
