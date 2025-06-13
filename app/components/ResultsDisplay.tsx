import React, { useState } from "react";
import { Clipboard, FileText, AlertCircle, Users, Zap, BarChart4, Palette, Layout, Eye, CheckCircle, ArrowUpCircle, Check } from "lucide-react";

export const ResultsDisplay = ({ text }: { text: string }) => {
  // State for copy button
  const [copied, setCopied] = useState(false);
  
  // Section headers from the prompt
  const HEADERS = {
    BUSINESS_INSIGHTS: "BUSINESS INSIGHTS",
    LIKELY_TARGET: "LIKELY TARGET CUSTOMER PERSONA:",
    DESIGN_AUDIT: "DESIGN AUDIT",
    MOBILE_READINESS: "MOBILE READINESS SCORE (1-10):",
    SPECIFIC_ISSUES_HEADER: "Call out 3 specific issues.", // This is from the OLDER prompt for design issues.
    PERFORMANCE_OVERVIEW: "PERFORMANCE OVERVIEW:",
    EMAIL_FRAMEWORK: "PERSONALIZED EMAIL FRAMEWORK",
    AB_TESTING_SUGGESTIONS: "A/B TESTING SUGGESTIONS FOR EMAIL OUTREACH:"
  };

  // Initialize content variables
  const fullText = text || "";
  const businessInsightsContent = "";
  const likelyTargetPersonaContent = "";
  const designAuditContent = "";
  const mobileReadinessContent = "";
  const performanceOverviewContent = "";
  const rawEmailBlockContent = "";
  let mainEmailContent = "";
  let abTestingSuggestionsContent = "";
  // Note: The actual extraction logic that populates these is now commented out.
  // These are initialized to empty strings to prevent runtime errors if JSX still references them.

  // Function to extract a section based on a header and potential next headers
  const extractSection = (text: string, currentHeader: string, nextHeaders: string[]): string => {
    /*
    let regexString = `${currentHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)`;
    if (nextHeaders.length > 0) {
      regexString += `(?=${nextHeaders.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}|$)`;
    } else {
      regexString += `(?=$)`;
    }
    const regex = new RegExp(regexString, 'i'); // Case insensitive matching for headers
    const match = text.match(regex);
    return match && match[1] ? match[1].trim() : '';
    */
    return "";
  };

  // const fullText = text; // Keep original text for reference - moved up

  // const businessInsightsContent = extractSection(fullText, HEADERS.BUSINESS_INSIGHTS, [HEADERS.DESIGN_AUDIT, HEADERS.PERFORMANCE_OVERVIEW, HEADERS.EMAIL_FRAMEWORK]);
  // const likelyTargetPersonaContent = extractSection(businessInsightsContent, HEADERS.LIKELY_TARGET, []);

  // const designAuditContent = extractSection(fullText, HEADERS.DESIGN_AUDIT, [HEADERS.PERFORMANCE_OVERVIEW, HEADERS.EMAIL_FRAMEWORK]);
  // const mobileReadinessContent = extractSection(designAuditContent, HEADERS.MOBILE_READINESS, []);

  // const performanceOverviewContent = extractSection(fullText, HEADERS.PERFORMANCE_OVERVIEW, [HEADERS.EMAIL_FRAMEWORK, HEADERS.AB_TESTING_SUGGESTIONS]);

  // const rawEmailBlockContent = extractSection(fullText, HEADERS.EMAIL_FRAMEWORK, []);

  // mainEmailContent = rawEmailBlockContent; // Default assignment
  // abTestingSuggestionsContent = ""; // Default assignment

  // if (rawEmailBlockContent.includes(HEADERS.AB_TESTING_SUGGESTIONS)) {
  //   const parts = rawEmailBlockContent.split(new RegExp(HEADERS.AB_TESTING_SUGGESTIONS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  //   mainEmailContent = parts[0].trim();
  //   if (parts.length > 1) {
  //     abTestingSuggestionsContent = parts[1].trim();
  //   }
  // }


  // Function to copy email content to clipboard
  const copyEmailToClipboard = () => {
    /*
    if (mainEmailContent) {
      const plainText = mainEmailContent.replace(/<[^>]*>/g, '').replace(/Subject:.*?\n\n/i, '').replace(/Hey \[First Name\],\n\n/i, '');
      navigator.clipboard.writeText(plainText.trim()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
    */
    console.log("copyEmailToClipboard called, but implementation is commented out.");
  };

  // Format the text with markdown (minor adjustments for clarity)
  const formatText = (content: string, isListItemContext = false) => {
    return ""; // Returning an empty string for maximum safety during this debug.
  };

  // Helper to render a sub-section, e.g. Persona, Mobile Score
  const renderSubSection = (title: string, content: string, icon?: React.ReactNode) => {
    /*
    if (!content.trim()) return null;
    return (
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-700 mb-1 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h4>
        <div
          className="text-sm text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatText(content) }}
        />
      </div>
    );
    */
    return null;
  };

  // Enhanced function to parse and render "3 specific issues" with suggestions
  const renderDesignIssues = (designAuditText: string) => {
    /*
    const issuesHeaderText = HEADERS.SPECIFIC_ISSUES_HEADER;
    const issuesStartIndex = designAuditText.toLowerCase().indexOf(issuesHeaderText.toLowerCase());
    let issuesSection = designAuditText;

    if (issuesStartIndex !== -1) {
        const mobileReadinessIndex = designAuditText.toLowerCase().indexOf(HEADERS.MOBILE_READINESS.toLowerCase());
        if (mobileReadinessIndex > issuesStartIndex) {
            issuesSection = designAuditText.substring(issuesStartIndex + issuesHeaderText.length, mobileReadinessIndex);
        } else {
            issuesSection = designAuditText.substring(issuesStartIndex + issuesHeaderText.length);
        }
    } else {
        issuesSection = designAuditText.replace(HEADERS.MOBILE_READINESS, "").replace(mobileReadinessContent, "").trim();
    }

    if (!issuesSection.trim()) return <p className="text-sm text-gray-500">No specific design issues detailed.</p>;

    return (
         <div className="mt-4 pt-3 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-700 mb-1 flex items-center">
                <AlertCircle className="text-red-500 h-5 w-5 mr-2" />
                Key Areas for Improvement:
            </h4>
            <div
                className="text-sm text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatText(issuesSection, true) }}
            />
        </div>
    );
    */
    return null;
  };

  const parseAndRenderABSuggestions = (abText: string) => {
    /*
    if (!abText.trim()) return null;

    const sections = [];

    const parseCategory = (keyPhrase: string, title: string, fullAbText: string) => {
      const keyPhraseIndex = fullAbText.toLowerCase().indexOf(keyPhrase.toLowerCase());
      if (keyPhraseIndex === -1) return null;
      let relevantText = fullAbText.substring(keyPhraseIndex);
      relevantText = relevantText.substring(keyPhrase.length);
      const nextCategoryKeywords = ["Subject Line Variants", "Opening Hook Variants", "Call to Action (CTA) Phrase Variants"];
      let endPoint = relevantText.length;
      nextCategoryKeywords.forEach(nextKeyword => {
        if (nextKeyword.toLowerCase() !== keyPhrase.toLowerCase()) {
          const nextKeywordIndex = relevantText.toLowerCase().indexOf(nextKeyword.toLowerCase());
          if (nextKeywordIndex !== -1 && nextKeywordIndex < endPoint) {
            endPoint = nextKeywordIndex;
          }
        }
      });
      const content = relevantText.substring(0, endPoint).trim();
      if (!content) return null;
      const variants = [];
      const variantRegex = /\*\s*(Variant [A-Z]):\s*([\s\S]*?)\s*\*\s*(?:\*)?Rationale(?:\*)?:\s*([\s\S]*?)(?=\*\s*Variant [A-Z]:|\s*$)/gi;
      let match;
      while((match = variantRegex.exec(content)) !== null) {
        variants.push({
          name: match[1].trim(),
          text: match[2].trim(),
          rationale: match[3].trim()
        });
      }
      if (variants.length === 0) return null;
      return (
        <div key={title} className="mb-4">
          <h5 className="text-md font-semibold mt-3 mb-2 text-gray-700">{title}:</h5>
          {variants.map((variant, index) => (
            <div key={index} className="p-3 my-2 border rounded-lg bg-gray-50 shadow-sm">
              <p className="font-medium text-gray-800">{variant.name}: <span className="font-normal">{variant.text}</span></p>
              <p className="text-sm text-gray-600 mt-1"><em>Rationale:</em> {rationale}</p>
            </div>
          ))}
        </div>
      );
    };

    const subjectSuggestions = parseCategory("Subject Line Variants", "Subject Line A/B Tests", abText);
    const hookSuggestions = parseCategory("Opening Hook Variants", "Opening Hook A/B Tests", abText);
    const ctaSuggestions = parseCategory("Call to Action (CTA) Phrase Variants", "CTA Phrase A/B Tests", abText);

    if (subjectSuggestions) sections.push(subjectSuggestions);
    if (hookSuggestions) sections.push(hookSuggestions);
    if (ctaSuggestions) sections.push(ctaSuggestions);

    if (sections.length === 0) {
        return (
            <div className="mt-6 pt-4 border-t border-dashed border-gray-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">A/B Testing Suggestions</h4>
                <div className="bg-gray-50 p-4 rounded-lg shadow" dangerouslySetInnerHTML={{__html: formatText(abText, true)}} />
            </div>
        );
    }
    return (
        <div className="mt-6 pt-4 border-t border-dashed border-gray-300">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Layout className="h-5 w-5 mr-2 text-blue-500" /> A/B Testing Suggestions
            </h4>
            {sections}
        </div>
    );
    */
    return null;
  };

  // Determine if there's any text to display at all, even if it's unparsed.
  // The hasContent check now depends on the raw `text` prop if specific content vars are empty.
  const hasAnyDisplayableContent = text && text.trim().length > 0;


  if (!hasAnyDisplayableContent && (businessInsightsContent || designAuditContent || performanceOverviewContent || rawEmailBlockContent)) {
     // This case should ideally not be hit if content vars are empty strings.
     // It's a fallback for the original logic if `text` is empty but somehow old logic found content.
  } else if (!hasAnyDisplayableContent) { // If text itself is empty or only whitespace
    return (
        <section className="bg-white p-6 rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold flex gap-2 items-center text-gray-800 mb-4">
                    <FileText className="text-blue-600 h-6 w-6" />
                    Analysis Results
                </h2>
                <p className="text-gray-600">No analysis results to display. Please provide some text.</p>
            </div>
        </section>
    );
  }


  // Fallback display if specific sections are not found or parsing is disabled
  // This will show the raw text if no sections were parsed by the (now commented out) extractSection logic.
  // Or, it shows a generic message if all content variables are empty strings.
  const showFallbackDisplay = !businessInsightsContent && !designAuditContent && !performanceOverviewContent && !rawEmailBlockContent;

  if (showFallbackDisplay) {
    return (
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex gap-2 items-center text-gray-800 mb-4">
            <FileText className="text-blue-600 h-6 w-6" />
            Analysis Results (Fallback)
          </h2>
          <div 
            className="bg-blue-50 p-6 rounded-lg text-gray-800 leading-relaxed"
            // Since formatText is now returning "", this will effectively be empty.
            // To show raw text, we should use `text || ""` directly here.
            dangerouslySetInnerHTML={{ __html: text || "No content available." }}
          />
        </div>
      </section>
    );
  }; // Explicit semicolon


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Business Insights Section */}
      {businessInsightsContent && ( // This will be false if businessInsightsContent is ""
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 transition-all hover:shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            Business Insights
          </h2>
          <div
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-gray-800 leading-relaxed border-l-4 border-blue-400 shadow-sm"
            dangerouslySetInnerHTML={{ __html: formatText("") }}
          />
          {renderSubSection("Likely Target Customer Persona", likelyTargetPersonaContent, <Users className="h-5 w-5 text-blue-500" />)}
        </section>
      )}

      {/* Design Audit Section */}
      {designAuditContent && ( // This will be false
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 transition-all hover:shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center gap-2">
            <Palette className="h-6 w-6 text-purple-600" />
            Design Audit
          </h2>
          <div
            className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-gray-800 leading-relaxed border-l-4 border-purple-400 shadow-sm"
            dangerouslySetInnerHTML={{ __html: formatText("") }}
          />
          {renderDesignIssues(designAuditContent)}
          {renderSubSection("Mobile Readiness Score", mobileReadinessContent, <Layout className="h-5 w-5 text-purple-500" />)}
        </section>
      )}

      {/* Performance Overview Section */}
      {performanceOverviewContent && ( // This will be false
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 transition-all hover:shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Performance Overview
          </h2>
          <div
            className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-gray-800 leading-relaxed border-l-4 border-green-400 shadow-sm"
            dangerouslySetInnerHTML={{ __html: formatText("") }}
          />
        </section>
      )}

      {/* Email Section */}
      {rawEmailBlockContent && ( // This will be false, unless text was only email framework
        <section className="bg-white p-8 rounded-xl shadow-lg border border-emerald-200 transition-all hover:shadow-xl">
          <h2 className="text-2xl font-bold flex gap-2 items-center text-gray-800 mb-6 border-b border-emerald-100 pb-3">
            <Clipboard className="text-emerald-600 h-6 w-6" />
            Personalized Cold Email
          </h2>
          <div className="relative">
             <div className="absolute -left-3 top-3 h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
               <ArrowUpCircle className="text-white h-5 w-5" />
             </div>
            <div 
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 pl-10 rounded-xl text-gray-800 leading-relaxed border-l-4 border-emerald-500 shadow-sm"
              dangerouslySetInnerHTML={{ __html: formatText("") }}
            />
          </div>
          {parseAndRenderABSuggestions(abTestingSuggestionsContent)}
          <div className="mt-6 flex justify-end">
            <button 
              onClick={copyEmailToClipboard}
              className={`${copied ? 'bg-green-600' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg text-sm font-medium`}
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Clipboard className="h-5 w-5" />
                  Copy Email
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* Fallback: If all specific content vars are empty, but `text` prop has data, show it unparsed. */}
      {!(businessInsightsContent || designAuditContent || performanceOverviewContent || rawEmailBlockContent) && text && text.trim().length > 0 && (
         <section className="bg-white p-6 rounded-lg shadow-lg">
           <div className="mb-6">
             <h2 className="text-2xl font-bold flex gap-2 items-center text-gray-800 mb-4">
               <FileText className="text-blue-600 h-6 w-6" />
               Raw Analysis Output
             </h2>
             <div
               className="bg-gray-100 p-6 rounded-lg text-gray-800 leading-relaxed whitespace-pre-wrap"
             >
              {text}
             </div>
           </div>
         </section>
      )}

    </div>
  );
};
