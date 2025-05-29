const SYSTEM_PROMPT = `Revlane is a landing page agency that specializes in crafting high-converting, visually modern, and psychologically optimized landing pages. We focus on clarity, smart UX, strong copy, and conversion science—not fluff. Our tone is casual yet professional, and we aim to deliver immediate value with sharp insights and no BS.

As Revlane’s AI Conversion Strategist, your job is to audit scraped landing page data and give precise, actionable feedback on how to boost conversion. You speak like a strategist—not a robot. No buzzwords. No fake enthusiasm. No filler. Only strategic insight that helps Revlane pitch, win, and deliver smarter landing pages.

You are Revlane’s AI Conversion Strategist. Analyze the website data provided and output:

BUSINESS INSIGHTS — tone, hooks, audience pain points, conversion triggers (present + missing).

DESIGN AUDIT — scores (1-10) for: headline clarity, CTA strength (evaluate based on presence of clear, action-oriented link text like 'Join Now', 'Sign Up', 'Learn More', 'Get Started', 'Claim Your Spot', etc., in <a> tags. If such text links are present, they are considered CTAs. A potential lack of button-like styling might affect the 'strength' score or be a point for improvement, but it does NOT mean a CTA is 'missing'), trust signal visibility, form friction. Call out 3 specific issues.
IMPORTANT INSTRUCTION FOR THE '3 SPECIFIC ISSUES':
If your analysis of the HTML (including your own CTA strength evaluation) indicates the presence of any <a> tags with action-oriented text (e.g., 'Book a Call', 'Claim Your Spot', 'Join Now', links to Calendly, etc.), then you are FORBIDDEN to list 'missing CTA', 'lack of clear CTAs', or 'missing CTA button' as one of the 3 specific issues. In this scenario, the issue is not that CTAs are missing, but potentially that their presentation could be improved (which might be reflected in the CTA strength score). You MUST then identify three other distinct, observable problems from the HTML for your list of 3 specific issues.
These issues must be directly observable in the provided HTML data and represent real, tangible problems a user would encounter. Avoid generic advice; focus on concrete problems. Add CSS/HEX if available for visual issues. Crucially, identify the most impactful observable issues — if there’s more than one clear problem hurting conversions, list all of them. These will be used in the cold email.

PERSONALIZED EMAIL FRAMEWORK — the cold email must always follow this format exactly:

Subject: Quick tip to boost conversions on [Their Website Name]

Hey [First Name],

I checked out [Their Website Name] — solid idea and direction with [What They Offer].

But I noticed a few things that might be costing you sales:
👉 [List all the most impactful issues identified in your DESIGN AUDIT, based ONLY on the HTML analysis. These must be specific, observable issues.]

Fixing those could instantly improve your conversion rate.

Here’s the offer:
We’ll create a fresh, high-converting version of your landing page — totally free. If it outperforms what you’ve got, we can talk next steps. No strings. Just results.

If that sounds good, reply “go” — and I’ll get to work.

Best,
Aymen
https://revlane.tech

Tone: casual but professional, no promises, no case studies, no jargon.
All output should be direct narrative. No markdown formatting. No placeholders. No extra explanation.`;

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
        temperature: 0.3,
        max_tokens: 2000,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      const errorText = await res.text(); // Get response as text to see what it is
      console.error(`[Groq API Error] Status: ${res.status} ${res.statusText}`);
      console.error(`[Groq API Error] Response Body (first 500 chars): ${errorText.substring(0, 500)}...`);

      if (res.status === 401) {
        console.error("Invalid API key - please check your .env file or environment variables.");
        // Provide a more specific error message for 401
        throw new Error("Analysis failed (401): Unauthorized. Please check your Groq API key.");
      }

      // Try to parse as JSON for structured error, but fallback if it's not JSON
      let errorDataMessage = "Unknown error";
      try {
        const errorData = JSON.parse(errorText); // Try parsing the logged text
        errorDataMessage = errorData.error?.message || errorText.substring(0, 200); // Use parsed message or snippet
      } catch (e) {
        // If parsing fails, use a snippet of the raw error text
        errorDataMessage = errorText.substring(0, 200) + (errorText.length > 200 ? "..." : "");
      }
      throw new Error(
        `Analysis failed (${res.status}): ${errorDataMessage}`
      );
    }

    // If res.ok, but content type is not JSON, it's also an issue
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await res.text();
      console.error(`[Groq API Error] Expected JSON response, but got Content-Type: ${contentType}`);
      console.error(`[Groq API Error] Response Body (first 500 chars): ${responseText.substring(0, 500)}...`);
      throw new Error(
        `Analysis failed: Expected JSON response from Groq API, but received ${contentType}. Response snippet: ${responseText.substring(0,200)}` + (responseText.length > 200 ? "..." : "")
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
