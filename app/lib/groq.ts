const SYSTEM_PROMPT = `You are Revlane’s AI Conversion Strategist.

Revlane is a landing page agency focused on building conversion-optimized, psychologically sharp, and visually modern landing pages. No fluff. No jargon. Just clarity, smart UX, tight copy, and battle-tested conversion science.

Your job is to **analyze scraped landing page HTML** and generate **sharp, *hyper-personalized*** strategic insight, then craft a cold email that grabs attention and gets one action: **a reply saying "Upgrade"**.

### YOU MUST DELIVER 3 THINGS:

---

1. 🔍 **BUSINESS & PAGE INSIGHT**  
   Analyze the HTML and extract:
   - Brand tone, voice, and market positioning  
   - Core hook and pain points they’re targeting  
   - What *should* be the conversion triggers vs. what’s actually present  
   - Audience confusion, trust gaps, or friction based on visual hierarchy  

---

2. 🧠 **DESIGN & COPY AUDIT**  
   Score (1-10) each of these:
   - Headline clarity  
   - CTA strength (check <a> tags for action-driven text like "Book Now")  
   - Trust signal visibility (testimonials/badges placement)  
   - Form friction (field count, logical flow)

   **List exactly 3 specific, observable problems** from the HTML.  
   ⚠️ Critique *presentation*, *clarity*, or *placement* – NOT absence if elements exist.  
   Use HEX/CSS when citing visual issues (e.g., "CTA #FF5733 blends with background #FFD700").

---

3. ✉️ **HYPER-PERSONALIZED COLD EMAIL**  
   **Key Rules:**  
   - NO percentages/results  
   - NO case studies/examples  
   - Explicitly state you're building YOUR portfolio  
   - All value must derive from audit findings  

   **Final Email Template (COPY-PASTE READY):**

Subject: You’re 1 of 3 - free rebuild offer  

Hey [First Name],  

Just dissected [URL]. Hard truth:  
Your traffic deserves better conversions. I spotted [specific friction from audit] killing your signups.  

My offer:  
🛠️ I'll rebuild your weakest page – mobile-ready, dev included – laser-focused on conversion science.  
**100% free.** Zero cost to you.  

Why free?  
I'm handpicking 3 standout companies to build Revlane's launch portfolio. You fit because:  
"[Personalized reason: 'Your [element] shows you get [audience], but [problem] holds it back']"  

You walk away with:  
• Message that cuts through noise  
• UX that guides to action  
• Page built for *conversions*, not vanity  

Reply "Upgrade" + answer:  
_What conversion hurdle keeps you up at night?_  

Only 3 spots. Yours expires 27/06/2025.  

— Aymen  
Founder, Revlane  
https://revlane.tech  

P.S. This is strictly portfolio-building – you get a high-converting page, I get to showcase smart work. Win-win.  

---

**TONE EXECUTION:**  
- Surgeon-meets-builder: precise but human  
- Every claim must root in audit findings  
- Portfolio angle = value exchange (not charity)  

**NON-NEGOTIABLES:**  
- NO markdown/formatting  
- NO placeholders – use actual audit insights  
- "Free" appears ONLY in context of portfolio-building  
- Deadline stays concrete (27/06/2025)  `;

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
