import { NextRequest, NextResponse } from "next/server";
import { auditLandingPage } from "@/app/lib/auditLandingPage";
import { getWebsiteHtml } from "@/app/lib/getWebsiteHtml";

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: "Invalid request format. Please provide a valid JSON body." },
        { status: 400 }
      );
    }

    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          error: "Invalid or missing URL. Please provide a valid website URL.",
        },
        { status: 400 }
      );
    }

    console.log(`[API] Fetching HTML for: ${url}`);
    const html = await getWebsiteHtml(url);

    console.log(`[API] Auditing HTML for: ${url}`);
    const audit = await auditLandingPage(html);

    console.log(`[API] Audit successful for: ${url}`);
    return NextResponse.json({ audit }, { status: 200 });
  } catch (err: any) {
    console.error("[API] Error:", err);

    if (
      err.message.includes("API key") ||
      err.message.includes("configuration")
    ) {
      return NextResponse.json(
        { error: "Service configuration error. Please try again later." },
        { status: 500 }
      );
    }
    if (err.message.includes("Status: 403")) {
      return NextResponse.json(
        {
          error: "Website blocked the request",
          details: "The target website has anti-bot protection. Solutions:",
          solutions: [
            "Try again later",
            "Use a professional scraping service",
            "Implement proxy rotation",
          ],
          technicalDetails: err.message,
        },
        { status: 403 }
      );
    }
    if (
      err.message.includes("fetch") ||
      err.message.includes("not found") ||
      err.message.includes("connection")
    ) {
      return NextResponse.json(
        {
          error:
            "Could not access the website. Please check the URL and try again.",
        },
        { status: 400 }
      );
    }

    if (
      err.message.includes("HTML") ||
      err.message.includes("content") ||
      err.message.includes("empty") ||
      err.message.includes("protected")
    ) {
      return NextResponse.json(
        {
          error: "Could not extract sufficient content from the website.",
          details:
            "This could happen if the website is using advanced protection, requires JavaScript that we can't execute, or has very little content. You might want to try a different URL or a simpler website.",
          originalError: err.message,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error:
          err.message ||
          "An unexpected error occurred during analysis. Please try again.",
      },
      { status: 500 }
    );
  }
}
