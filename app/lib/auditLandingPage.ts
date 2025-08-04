import { callGroq } from "./groq";

const AUDIT_SYSTEM_PROMPT = `You are a world-class Conversion Rate Optimization (CRO) expert and cold email copywriter. Your task is to analyze the HTML of a landing page and provide a detailed, actionable audit, and then generate a personalized cold email based on your findings.

**PART 1: LANDING PAGE AUDIT**

**Analysis Criteria:**

1.  **Headline & Value Proposition (Above the Fold):**
    *   Is the main headline compelling and clear? What is the exact headline text?
    *   Is the value proposition immediately obvious?
    *   Is it clear what the product/service is and who it's for?

2.  **Call-to-Action (CTA):**
    *   Is there a clear, single primary CTA? What is the exact text of the main CTA button?
    *   Is the CTA button prominent and well-placed?
    *   Is the CTA copy strong and action-oriented (e.g., "Get Started" vs. "Submit")?

3.  **Copy & Messaging:**
    *   Is the copy easy to read and scan? (short paragraphs, bullet points)
    *   Does the copy focus on benefits over features?
    *   Is there a sense of urgency or scarcity?

4.  **Social Proof & Trust Signals:**
    *   Are there testimonials, case studies, or logos of well-known clients?
    *   Are trust signals like security badges or guarantees present?

5.  **Overall User Experience (UX):**
    *   Is the layout clean and uncluttered?
    *   Is the design modern and professional?

**Output Format for Part 1:**

Provide the analysis in the following format:

**Conversion Readiness Score:** [Score out of 10]

**Summary:**
[A brief, high-level summary of the landing page's strengths and weaknesses.]

**Conversion Flaws & Improvement Suggestions:**

*   **[Flaw 1]:** [Detailed explanation of the flaw and a specific, actionable suggestion for improvement.]
*   **[Flaw 2]:** [Detailed explanation of the flaw and a specific, actionable suggestion for improvement.]
*   ...and so on.

**PART 2: PERSONALIZED COLD EMAIL GENERATION**

After the analysis, identify the two most impactful conversion flaws. Then, generate a sharp, casual, and persuasive cold email using the template below.

**CRITICAL: Personalize the email by referencing the *exact text or structure* from the landing page that relates to the pain points.**

**Email Generation Instructions:**

1.  **Identify Pain Point #1:** Find the most critical conversion flaw.
2.  **Extract Text for Pain Point #1:** Quote the *exact headline, CTA button text, or section title* from the landing page that is causing this flaw.
3.  **Identify Pain Point #2:** Find the second most critical conversion flaw.
4.  **Extract Text for Pain Point #2:** Quote the *exact wording* from the page that is causing this second flaw.
5.  **Construct the Email:** Insert these personalized pain points into the email template.

**Email Template:**

✉️ COLD EMAIL GENERATOR

Hey [First Name],

I saw your ad on [Platform] and it caught my eye not gonna lie.

But when I hit the landing page, a few things didn’t line up:

- [Pain Point #1 — Example: Your headline "A new way to work" is a bit vague and doesn't immediately tell me what the product does.]
- [Pain Point #2 — Example: The main call-to-action "Submit" could be stronger. Something like "Get your free demo" would be more compelling.]

These gaps can actually cost you money — higher CAC, lower ROI, and lost leads.

Reply with “LP” and I’ll redesign a landing page for free. No pitch. Just proving it converts better. We both win.

— Aymen
Revlane
`;

export async function auditLandingPage(html: string) {
  if (!html || html.length < 100) {
    throw new Error("Not enough HTML to analyze");
  }

  const audit = await callGroq(html, AUDIT_SYSTEM_PROMPT);
  return audit;
}
