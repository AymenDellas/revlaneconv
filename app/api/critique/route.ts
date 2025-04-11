import { NextResponse, NextRequest } from "next/server";
import { scrapeHTML } from "@/app/utils/scrapeHTML";
import { callGroq } from "@/app/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const rawText = await scrapeHTML(url);
    const critique = await callGroq(rawText);

    return NextResponse.json({ critique });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
