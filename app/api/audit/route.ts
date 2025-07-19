import { NextRequest, NextResponse } from "next/server";
import { auditWebsite } from "@/app/lib/auditWebsite";
import { getWebsiteHtml } from "@/app/lib/getWebsiteHtml";

export async function POST(req: NextRequest) {
  try {
    // Check if the request is valid JSON
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request format. Please provide a valid JSON body." },
        { status: 400 }
      );
    }

    const { url } = body;

    // Validate URL
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          error: "Invalid or missing URL. Please provide a valid website URL.",
        },
        { status: 400 }
      );
    }

    // No timeout - allow the operation to run as long as needed
    console.log(`[API] Fetching HTML for: ${url}`);
    const html = await getWebsiteHtml(url);

    console.log(`[API] Auditing HTML for: ${url}`);
    const analysis = await auditWebsite(html);

    console.log(`[API] Audit successful for: ${url}`);
    return NextResponse.json({ analysis }, { status: 200 });
  } catch (err: unknown) {
    console.error("[API] Error:", err);

    let message = "An unknown error occurred.";
    if (err instanceof Error) {
      message = err.message;
    }

    // More specific error responses based on error message
    if (
      message.includes("API key") ||
      message.includes("configuration")
    ) {
      return NextResponse.json(
        { error: "Service configuration error. Please try again later." },
        { status: 500 }
      );
    }

    if (message.includes("Status: 403")) {
      return NextResponse.json(
        {
          error: "Website blocked the request",
          details: "The target website has anti-bot protection. Solutions:",
          solutions: [
            "Try again later",
            "Use a professional scraping service",
            "Implement proxy rotation",
          ],
          technicalDetails: message,
        },
        { status: 403 }
      );
    }
    if (
      message.includes("fetch") ||
      message.includes("not found") ||
      message.includes("connection")
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
      message.includes("HTML") ||
      message.includes("content") ||
      message.includes("empty") ||
      message.includes("protected")
    ) {
      return NextResponse.json(
        {
          error: "Could not extract sufficient content from the website.",
          details:
            "This could happen if the website is using advanced protection, requires JavaScript that we can't execute, or has very little content. You might want to try a different URL or a simpler website.",
          originalError: message,
        },
        { status: 422 }
      );
    }

    // Generic error handler for all other cases
    return NextResponse.json(
      {
        error:
          message ||
          "An unexpected error occurred during analysis. Please try again.",
      },
      { status: 500 }
    );
  }
}
