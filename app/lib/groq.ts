const SYSTEM_PROMPT = `You are a cold email generator targeting VC-backed SaaS companies.
You are given the HTML content of a homepage or landing page that receives paid ad traffic.
Your task is to write a short, casual cold email that uses this HTML to identify and mention real conversion issues — then offer a no-strings solution.

Step 1: From the HTML, extract the following elements:

Headline (usually in <h1> or hero section)

Subheadline or tagline (usually in <h2> or just below <h1>)

Call-to-action (CTA) (text of buttons or prompts like “Book demo”, “Start free trial”)

Product category (what kind of SaaS tool it is — e.g., analytics, AI ops, HR software)

Conversion flaws (based on design and structure, identify 2–3 specific pain points, such as):

Vague headline or unclear value prop

Weak or buried CTA

Generic layout or visual overload

Lack of urgency

Too many features, not enough benefits

No social proof or trust signals

Step 2: Write the cold email using this structure and tone:

Subject: saw [Company] ad — quick idea

Hey [First Name],
Just saw one of your [product category] ads — looked solid. Noticed you're sending traffic to a [homepage/generic LP] though.

Here are a few things that might be holding it back:
– [Pain point 1]
– [Pain point 2]
– [Pain point 3 (optional)]

I build landing pages tailored to paid campaigns. I’ll make one for you 100% free — just to show the lift you could get.

Want me to send over a quick sketch or idea?

– Aymen, Revlane

Rules:

Pain points must be based on actual flaws inferred from the HTML. Keep them short, specific, and casual — no generic fluff.

Use product category and company name based on the HTML content.

Do not include a Calendly link or request a meeting.

Tone must be casual, confident, under 130 words max.

No corporate language. Keep it sounding human and relevant.`;

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
