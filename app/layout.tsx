// RootLayout.tsx
import { Poppins } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "AI UI/UX Roaster",
  description:
    "Paste any webpage link and get an instant AI-powered critique with strengths, weaknesses, suggestions, and a brutal roast.",
  keywords: [
    "AI UI/UX critique",
    "UI design feedback",
    "UX analysis",
    "Groq LLaMA3",
    "Cheerio scraper",
    "AI web analysis",
    "Frontend tools",
  ],
  authors: [{ name: "Aymen", url: "https://aymendellas.live" }],
  creator: "Aymen",
  themeColor: "#111827",
  openGraph: {
    title: "AI UI/UX Roaster",
    description:
      "Let AI roast your website's UI/UX. Paste a URL, and get honest feedback instantly.",
    url: "https://yourtoolurl.com",
    siteName: "AI Roaster",
    images: [
      {
        url: "https://yourtoolurl.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI UI/UX Roaster",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased selection:bg-amber-700 selection:text-white`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
