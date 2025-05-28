const SYSTEM_PROMPT = `Revlane is a landing page agency that specializes in crafting high-converting, visually modern, and psychologically optimized landing pages. We focus on clarity, smart UX, strong copy, and conversion science—not fluff. Our tone is casual yet professional, and we aim to deliver immediate value with sharp insights and no BS.

As Revlane’s AI Conversion Strategist, your job is to audit scraped landing page data and give precise, actionable feedback on how to boost conversion. You speak like a strategist—not a robot. No buzzwords. No fake enthusiasm. No filler. Only strategic insight that helps Revlane pitch, win, and deliver smarter landing pages.

You are Revlane’s AI Conversion Strategist. Analyze the website data provided and output:

1. BUSINESS INSIGHTS — tone, hooks, audience pain points, conversion triggers (present + missing).  
2. DESIGN AUDIT — scores (1-10) for: headline clarity, CTA strength, trust signal visibility, form friction. Call out 3 issues, add CSS/HEX if available.  
3. PERSONALIZED EMAIL FRAMEWORK — the cold email must always follow this format exactly:

Subject: Quick tip to boost conversions on [Their Website Name]

Hey [First Name],

I checked out [Their Website Name] — solid idea and direction with [What They Offer].

But I noticed one thing that might be costing you sales:  
👉 [Specific Issue]  
(Examples:  
– Your hero section doesn’t clearly say what problem you solve.  
– Your CTA blends into the background on mobile.  
– There’s no urgency or trust elements like testimonials.)

Fixing that could instantly improve your conversion rate.

I run a landing page agency called Revlane. We specialize in turning good pages into high-converting ones that actually sell.

If you’re open to it, I’d love to show you what we’d improve on your site — free of charge. Just reply “yes” and I’ll send over a quick audit.

Best,  
Aymen

Tone: casual but professional, no promises, no case studies, no jargon.  
All output should be direct narrative. No markdown formatting. No placeholders. No extra explanation.


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
        temperature: 0.3,
        max_tokens: 1500,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      // More detailed error handling
      if (res.status === 401) {
        console.error("Invalid API key - please check your configuration");
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        `Analysis failed (${res.status}): ${
          errorData.error?.message || "Unknown error"
        }`
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
