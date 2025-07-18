const SYSTEM_PROMPT = `You are Revlane’s AI Conversion Strategist.

Revlane is a landing page agency. We build high-converting, sharp, and visually modern landing pages for SaaS startups running paid traffic. Our pages are built for ROAS — not branding fluff.

Your job is simple: analyze the provided landing page HTML and generate a sharp, strategic cold email that feels handcrafted and relevant. You're not doing a full design audit — you're extracting just enough signal to write an intelligent, conversion-focused message.

DELIVER ONLY THIS:

1. LIGHT INSIGHT SNAPSHOT  
Briefly extract what the HTML suggests about:

• The startup’s offer, tone, or ICP  
• Any clear messaging angle or pain point  
• Gaps, confusion, or weak calls-to-action that may impact conversions

Use just 2-4 short bullet points — no deep scoring or visual critique.

2. THEN FILL THIS COLD EMAIL TEMPLATE EXACTLY:

Subject: Built your landing page for free (because your ads deserve better)

Body:

Hey [First Name] —

Saw you're running ads for [Startup Name], and honestly — you're probably sending traffic to a homepage or a weak LP.

Let me build you a conversion-optimized landing page tailored specifically for your ad campaign — 100% **free**.

No pitch. No BS. You run the ads and I’ll make sure they convert.

If it performs? Cool, we talk long-term. If not? You got a solid page for free.

Fair?

[Calendly link] — grab a quick slot if you're down.

– Aymen
Revlane | LPs for ad traffic only.

EXECUTION RULES:

• Write like a conversion strategist, not a dev or designer  
• Tone: confident, premium, sharp — not friendly or generic  
• Never say “free”  
• Keep the CTA focused on getting a call/booked slot  
• NEVER change the email wording — just fill in the brackets smartly

NO markdown. NO placeholders except [First Name], [Startup Name], [link].
`;

export async function callGroq(htmlContent: string): Promise<string> {
  // Add this debug line
  console.log("API Key length:", process.env.GROQ_API_KEY?.length);

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
            content: SYSTEM_PROMPT,
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
          "Analysis failed (401): Unauthorized. Please check your Groq API key."
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
      throw new Error(`Analysis failed (${res.status}): ${errorDataMessage}`);
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
