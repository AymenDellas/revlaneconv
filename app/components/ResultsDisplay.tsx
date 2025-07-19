import React, { useState } from "react";
import { Clipboard, FileText, AlertCircle, Zap, BarChart4, Palette, Check } from "lucide-react";

export const ResultsDisplay = ({ text }: { text: string }) => {
  // State for copy button
  const [copied, setCopied] = useState(false);
  
  // Function to copy email content to clipboard
  const copyEmailToClipboard = () => {
    const emailContent = extractEmailSection(text);
    if (emailContent) {
      // Remove HTML tags for clean copy
      const plainText = emailContent.replace(/<[^>]*>/g, '');
      navigator.clipboard.writeText(plainText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  // Extract the email section separately for better formatting
  const extractEmailSection = (fullText: string) => {
    const emailSectionRegex = /(?:✉️ COLD EMAIL GENERATOR|COLD EMAIL GENERATOR)([\s\S]*?)(?=$|(?:🔍 BUSINESS SNAPSHOT|BUSINESS SNAPSHOT|🎨 DESIGN BREAKDOWN|DESIGN BREAKDOWN))/;
    const match = fullText.match(emailSectionRegex);
    return match ? match[1].trim() : '';
  };
  
  // Extract the business and design sections
  const extractBusinessAndDesign = (fullText: string) => {
    // Remove the email section if it exists
    return fullText.replace(/(?:✉️ COLD EMAIL GENERATOR|COLD EMAIL GENERATOR)[\s\S]*?(?=$)/, '').trim();
  };
  // Format the text with markdown
  const formatText = (content: string) => {
    // Add line breaks first
    let formatted = content
      // Preserve line breaks
      .replace(/\n/g, '<br />');
      
    // Replace markdown-style headers and lists with HTML
    formatted = formatted
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*([^*]+)\*/g, '<em>$1</em>') // Italic text
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>') // H1
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-3 mb-2">$1</h2>') // H2
      .replace(/^### (.+)$/gm, '<h3 class="text-md font-bold mt-2 mb-1">$1</h3>'); // H3
    
    // Handle bullet points and numbered lists
    // First, identify list items
    formatted = formatted
      .replace(/• (.+?)(?=<br \/>|$)/g, '<li class="ml-4 mb-1">$1</li>') // Bullet points with actual bullet character
      .replace(/^\* (.+?)(?=<br \/>|$)/gm, '<li class="ml-4 mb-1">$1</li>') // Asterisk bullet points
      .replace(/^\d+\. (.+?)(?=<br \/>|$)/gm, '<li class="ml-4 mb-1">$1</li>'); // Numbered list items
    
    // Wrap lists in ul tags with proper spacing
    if (formatted.includes('<li')) {
      formatted = formatted.replace(/(<li[^>]*>.+?<\/li>\s*)+/g, '<ul class="my-2 list-disc">$&</ul>');
    }
    
    // Add paragraph spacing for text blocks
    formatted = formatted.replace(/(<br \/>){2,}/g, '<div class="my-4"></div>');
    
    // Add spacing between sections
    formatted = formatted.replace(/(Subject:)/g, '<div class="mt-4 font-bold">$1</div>');
    
    return formatted;
  };
  
  // Extract email section and business/design sections
  const emailSection = extractEmailSection(text);
  const businessAndDesignSection = extractBusinessAndDesign(text);
  
  // Check if the text contains the expected sections from the new prompt
  const hasBusinessSnapshot = text.includes("BUSINESS SNAPSHOT") || text.includes("🔍 BUSINESS SNAPSHOT");
  const hasDesignBreakdown = text.includes("DESIGN BREAKDOWN") || text.includes("🎨 DESIGN BREAKDOWN");
  const hasEmailGenerator = text.includes("COLD EMAIL GENERATOR") || text.includes("✉️ COLD EMAIL GENERATOR");
  
  // If none of the expected sections are found, display the entire text as general analysis
  if (!hasBusinessSnapshot && !hasDesignBreakdown && !hasEmailGenerator) {
    return (
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex gap-2 items-center text-gray-800 mb-4">
            <FileText className="text-blue-600 h-6 w-6" />
            Analysis Results
          </h2>
          <div 
            className="bg-blue-50 p-6 rounded-lg text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatText(text.trim()) }}
          />
        </div>
      </section>
    );
  }

  // Split the business and design sections for individual rendering
  const businessDesignSections = businessAndDesignSection.split(/(?=🔍 BUSINESS SNAPSHOT|BUSINESS SNAPSHOT|🎨 DESIGN BREAKDOWN|DESIGN BREAKDOWN)/g);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Business and Design Analysis Section */}
      <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 transition-all hover:shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center gap-2">
          <BarChart4 className="h-6 w-6 text-blue-600" />
          Website Analysis
        </h2>
        
        {businessDesignSections.map((section: string, i: number) => {
          if (section.includes("BUSINESS SNAPSHOT") || section.includes("🔍 BUSINESS SNAPSHOT")) {
            const cleanedSection = section
              .replace("BUSINESS SNAPSHOT", "")
              .replace("🔍 BUSINESS SNAPSHOT", "")
              .trim();
              
            return (
              <div key={`business-${i}`} className="mb-8">
                <h3 className="text-xl font-bold flex gap-2 items-center text-gray-800 mb-4">
                  <Zap className="text-blue-600 h-6 w-6" />
                  Business Snapshot
                </h3>
                <div 
                  className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-gray-800 leading-relaxed border-l-4 border-blue-400 shadow-sm"
                  dangerouslySetInnerHTML={{ __html: formatText(cleanedSection) }}
                />
              </div>
            );
          }
          if (section.includes("DESIGN BREAKDOWN") || section.includes("🎨 DESIGN BREAKDOWN")) {
            const cleanedSection = section
              .replace("DESIGN BREAKDOWN", "")
              .replace("🎨 DESIGN BREAKDOWN", "")
              .trim();
              
            return (
              <div key={`design-${i}`} className="mb-8">
                <h3 className="text-xl font-bold flex gap-2 items-center text-gray-800 mb-4">
                  <Palette className="text-purple-600 h-6 w-6" />
                  Design Breakdown
                </h3>
                <div 
                  className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-gray-800 leading-relaxed border-l-4 border-purple-400 shadow-sm"
                  dangerouslySetInnerHTML={{ __html: formatText(cleanedSection) }}
                />
              </div>
            );
          }
          // Handle any other content that might be in the business/design sections
          if (i === 0 && 
              !section.includes("BUSINESS SNAPSHOT") && 
              !section.includes("🔍 BUSINESS SNAPSHOT") && 
              !section.includes("DESIGN BREAKDOWN") && 
              !section.includes("🎨 DESIGN BREAKDOWN")
          ) {
            return (
              <div key={`other-${i}`} className="mb-8">
                <h3 className="text-xl font-bold flex gap-2 items-center text-gray-800 mb-4">
                  <AlertCircle className="text-gray-600 h-6 w-6" />
                  Additional Information
                </h3>
                <div 
                  className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl text-gray-800 leading-relaxed border-l-4 border-gray-400 shadow-sm"
                  dangerouslySetInnerHTML={{ __html: formatText(section.trim()) }}
                />
              </div>
            );
          }
          return null;
        })}
      </section>
      
      {/* Email Section - Completely Separate */}
      {emailSection && (
        <section className="bg-white p-8 rounded-xl shadow-lg border border-emerald-200 transition-all hover:shadow-xl">
          <h2 className="text-2xl font-bold flex gap-2 items-center text-gray-800 mb-6 border-b border-emerald-100 pb-3">
            <Clipboard className="text-emerald-600 h-6 w-6" />
            Personalized Cold Email
          </h2>
          <div className="relative">
            <div className="absolute -left-3 top-3 h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <Clipboard className="text-white h-4 w-4" />
            </div>
            <div 
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 pl-10 rounded-xl text-gray-800 leading-relaxed border-l-4 border-emerald-500 shadow-sm"
              dangerouslySetInnerHTML={{ __html: formatText(emailSection) }}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={copyEmailToClipboard}
              className={`${copied ? 'bg-green-500' : 'bg-emerald-500 hover:bg-emerald-600'} text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Email
                </>
              )}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
