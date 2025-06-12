import React, { useState } from "react";
import { Clipboard, FileText, AlertCircle, Users, Zap, BarChart4, Palette, Layout, Eye, CheckCircle, ArrowUpCircle, Check } from "lucide-react";

export const ResultsDisplay = ({ text }: { text: string }) => {
  // State for copy button
  const [copied, setCopied] = useState(false);
  
  // Section headers from the prompt
  const HEADERS = {
    BUSINESS_INSIGHTS: "BUSINESS INSIGHTS", // Original prompt name
    BUSINESS_SNAPSHOT: "BUSINESS SNAPSHOT", // What the component currently uses
    LIKELY_TARGET: "LIKELY TARGET CUSTOMER PERSONA:",
    DESIGN_AUDIT: "DESIGN AUDIT", // Original prompt name
    DESIGN_BREAKDOWN: "DESIGN BREAKDOWN", // What the component currently uses
    MOBILE_READINESS: "MOBILE READINESS SCORE (1-10):",
    SPECIFIC_ISSUES_HEADER: "Call out 3 specific issues.", // And suggestions
    PERFORMANCE_OVERVIEW: "PERFORMANCE OVERVIEW:",
    EMAIL_FRAMEWORK: "PERSONALIZED EMAIL FRAMEWORK", // Original prompt name
    // EMAIL_GENERATOR: "COLD EMAIL GENERATOR" // What the component currently uses - EMAIL_FRAMEWORK is more accurate from prompt
    AB_TESTING_SUGGESTIONS: "A/B TESTING SUGGESTIONS FOR EMAIL OUTREACH:"
  };

  // Function to extract a section based on a header and potential next headers
  const extractSection = (text: string, currentHeader: string, nextHeaders: string[]): string => {
    let regexString = `${currentHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)`;
    if (nextHeaders.length > 0) {
      regexString += `(?=${nextHeaders.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}|$)`;
    } else {
      regexString += `(?=$)`;
    }
    const regex = new RegExp(regexString, 'i'); // Case insensitive matching for headers
    const match = text.match(regex);
    return match && match[1] ? match[1].trim() : '';
  };

  const fullText = text; // Keep original text for reference

  // Extract all potential sections
  const businessInsightsContent = extractSection(fullText, HEADERS.BUSINESS_INSIGHTS, [HEADERS.DESIGN_AUDIT, HEADERS.PERFORMANCE_OVERVIEW, HEADERS.EMAIL_FRAMEWORK]);
  const likelyTargetPersonaContent = extractSection(businessInsightsContent, HEADERS.LIKELY_TARGET, []); // It's within Business Insights

  const designAuditContent = extractSection(fullText, HEADERS.DESIGN_AUDIT, [HEADERS.PERFORMANCE_OVERVIEW, HEADERS.EMAIL_FRAMEWORK]);
  const mobileReadinessContent = extractSection(designAuditContent, HEADERS.MOBILE_READINESS, []); // It's within Design Audit
  // For "3 specific issues and suggestions", this will be more complex and might need to be handled inside the Design Audit rendering

  const performanceOverviewContent = extractSection(fullText, HEADERS.PERFORMANCE_OVERVIEW, [HEADERS.EMAIL_FRAMEWORK, HEADERS.AB_TESTING_SUGGESTIONS]); // A/B might follow performance if email is short

  // Email section might contain A/B suggestions as a sub-section
  const rawEmailBlockContent = extractSection(fullText, HEADERS.EMAIL_FRAMEWORK, []); // Get the whole block first

  let mainEmailContent = rawEmailBlockContent;
  let abTestingSuggestionsContent = "";

  if (rawEmailBlockContent.includes(HEADERS.AB_TESTING_SUGGESTIONS)) {
    const parts = rawEmailBlockContent.split(new RegExp(HEADERS.AB_TESTING_SUGGESTIONS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    mainEmailContent = parts[0].trim();
    if (parts.length > 1) {
      abTestingSuggestionsContent = parts[1].trim();
    }
  }


  // Function to copy email content to clipboard
  const copyEmailToClipboard = () => {
    // Copy only the main email content, not A/B suggestions
    if (mainEmailContent) {
      const plainText = mainEmailContent.replace(/<[^>]*>/g, '').replace(/Subject:.*?\n\n/i, '').replace(/Hey \[First Name\],\n\n/i, '');
      navigator.clipboard.writeText(plainText.trim()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // Format the text with markdown (minor adjustments for clarity)
  const formatText = (content: string, isListItemContext = false) => {
    let formatted = content;
    // Basic formatting - bold, italic. Headers are less likely inside these smaller content blocks.
    formatted = formatted
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Handle lists carefully: only wrap if it looks like a list.
    // Preserve line breaks from input for other text.
    const lines = formatted.split(/\n|<br \/>/);
    let inList = false;
    formatted = lines.map(line => {
      line = line.trim();
      if (/^• |^\* |^\d+\. /.test(line)) {
        const listItem = `<li class="ml-4 mb-1">${line.replace(/^• |^\* |^\d+\. /, '')}</li>`;
        if (!inList) {
          inList = true;
          return `<ul class="my-1 list-disc list-inside">${listItem}`;
        }
        return listItem;
      } else {
        if (inList) {
          inList = false;
          return `</ul>${line ? `<p class="my-1">${line}</p>` : ''}`;
        }
        return line ? (isListItemContext ? line : `<p class="my-1">${line}</p>`) : ''; // Avoid empty paragraphs, unless it's a list item context
      }
    }).join('');
    if (inList) {
      formatted += '</ul>'; // Close any open list
    }
    
    // General line breaks for non-list, non-paragraph content (if any left)
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
  };

  // Helper to render a sub-section, e.g. Persona, Mobile Score
  const renderSubSection = (title: string, content: string, icon?: React.ReactNode) => {
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
  };
  
  // Enhanced function to parse and render "3 specific issues" with suggestions
  const renderDesignIssues = (designAuditText: string) => {
    // This function might need significant rework if the "TOP 3 CONVERSION KILLERS" prompt section is used,
    // as its structure is very different from "Call out 3 specific issues."
    // For now, it retains its original logic.
    const issuesHeaderText = HEADERS.SPECIFIC_ISSUES_HEADER; // This header is from the OLD prompt structure.
    // and are typically list items or numbered.
    const issuesHeaderText = HEADERS.SPECIFIC_ISSUES_HEADER;
    const issuesStartIndex = designAuditText.toLowerCase().indexOf(issuesHeaderText.toLowerCase());
    let issuesSection = designAuditText;

    if (issuesStartIndex !== -1) {
        // Try to isolate the issues part more accurately, stopping before "MOBILE READINESS SCORE" or end of section
        const mobileReadinessIndex = designAuditText.toLowerCase().indexOf(HEADERS.MOBILE_READINESS.toLowerCase());
        if (mobileReadinessIndex > issuesStartIndex) {
            issuesSection = designAuditText.substring(issuesStartIndex + issuesHeaderText.length, mobileReadinessIndex);
        } else {
            issuesSection = designAuditText.substring(issuesStartIndex + issuesHeaderText.length);
        }
    } else {
        // If specific header not found, try to render what we can from designAuditContent excluding mobile score
        issuesSection = designAuditText.replace(HEADERS.MOBILE_READINESS, "").replace(mobileReadinessContent, "").trim();
    }

    if (!issuesSection.trim()) return <p className="text-sm text-gray-500">No specific design issues detailed.</p>;

    // This is a simplified display. Actual AI output structure for issues/suggestions will determine
    // if more complex parsing (e.g. splitting each issue and its suggestion) is needed.
    // For now, we format the whole block.
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
  };

  const parseAndRenderABSuggestions = (abText: string) => {
    if (!abText.trim()) return null;

    const sections = [];

    // Helper to parse each A/B test category (Subject, Hook, CTA)
    const parseCategory = (keyPhrase: string, title: string, fullAbText: string) => {
      // Find the starting point of the category based on the key phrase
      const keyPhraseIndex = fullAbText.toLowerCase().indexOf(keyPhrase.toLowerCase());
      if (keyPhraseIndex === -1) return null;

      // Extract text from the start of the key phrase
      let relevantText = fullAbText.substring(keyPhraseIndex);

      // Remove the key phrase itself to get to the content
      relevantText = relevantText.substring(keyPhrase.length);

      // Determine the end point (start of next A/B category or end of string)
      const nextCategoryKeywords = ["Subject Line Variants", "Opening Hook Variants", "Call to Action (CTA) Phrase Variants"];
      let endPoint = relevantText.length;

      nextCategoryKeywords.forEach(nextKeyword => {
        if (nextKeyword.toLowerCase() !== keyPhrase.toLowerCase()) { // Don't use the current keyphrase to delimit itself
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
              <p className="text-sm text-gray-600 mt-1"><em>Rationale:</em> {variant.rationale}</p>
            </div>
          ))}
        </div>
      );
    };

    // Use key phrases that are less prone to markdown formatting variations for initial detection
    const subjectSuggestions = parseCategory("Subject Line Variants", "Subject Line A/B Tests", abText);
    const hookSuggestions = parseCategory("Opening Hook Variants", "Opening Hook A/B Tests", abText);
    const ctaSuggestions = parseCategory("Call to Action (CTA) Phrase Variants", "CTA Phrase A/B Tests", abText);

    if (subjectSuggestions) sections.push(subjectSuggestions);
    if (hookSuggestions) sections.push(hookSuggestions);
    if (ctaSuggestions) sections.push(ctaSuggestions);

    if (sections.length === 0) {
        // Fallback if specific parsing fails but content exists
        return (
            <div className="mt-6 pt-4 border-t border-dashed border-gray-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">A/B Testing Suggestions</h4>
                <div className="bg-gray-50 p-4 rounded-lg shadow" dangerouslySetInnerHTML={{__html: formatText(abText, true)}} />
            </div>
        )
    }
    return (
        <div className="mt-6 pt-4 border-t border-dashed border-gray-300">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Layout className="h-5 w-5 mr-2 text-blue-500" /> A/B Testing Suggestions
            </h4>
            {sections}
        </div>
    );
  };


  const hasContent = businessInsightsContent || designAuditContent || performanceOverviewContent || rawEmailBlockContent;

  if (!hasContent && text) { // Fallback if no known sections are extracted but text exists
    return (
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex gap-2 items-center text-gray-800 mb-4">
            <FileText className="text-blue-600 h-6 w-6" />
            Analysis Results
          </h2>
          <div 
            className="bg-blue-50 p-6 rounded-lg text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatText(text.trim()) }} // Use the general formatter
          />
        </div>
      </section>
    );
  }


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Business Insights Section */}
      {businessInsightsContent && (
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 transition-all hover:shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            Business Insights
          </h2>
          <div
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-gray-800 leading-relaxed border-l-4 border-blue-400 shadow-sm"
            dangerouslySetInnerHTML={{ __html: formatText(businessInsightsContent.replace(HEADERS.LIKELY_TARGET, '').replace(likelyTargetPersonaContent, '').trim()) }}
          />
          {renderSubSection("Likely Target Customer Persona", likelyTargetPersonaContent, <Users className="h-5 w-5 text-blue-500" />)}
        </section>
      )}

      {/* Design Audit Section */}
      {designAuditContent && (
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 transition-all hover:shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center gap-2">
            <Palette className="h-6 w-6 text-purple-600" />
            Design Audit
          </h2>
          <div
            className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-gray-800 leading-relaxed border-l-4 border-purple-400 shadow-sm"
            // Display general design audit text, excluding already parsed sub-sections to avoid duplication.
            // This is tricky because "3 issues" is part of the main content.
            // We will render the "3 issues" part separately using renderDesignIssues.
            dangerouslySetInnerHTML={{ __html: formatText(designAuditContent
                .replace(HEADERS.MOBILE_READINESS, '')
                .replace(mobileReadinessContent, '')
                // Heuristic: Attempt to remove the detailed issues section from the main display if it was parsed by renderDesignIssues
                .substring(0, designAuditContent.toLowerCase().indexOf(HEADERS.SPECIFIC_ISSUES_HEADER.toLowerCase()) !== -1 ? designAuditContent.toLowerCase().indexOf(HEADERS.SPECIFIC_ISSUES_HEADER.toLowerCase()) : designAuditContent.length)
                .trim()
            )}}
          />
          {renderDesignIssues(designAuditContent)}
          {renderSubSection("Mobile Readiness Score", mobileReadinessContent, <Layout className="h-5 w-5 text-purple-500" />)}
        </section>
      )}

      {/* Performance Overview Section */}
      {performanceOverviewContent && (
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 transition-all hover:shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Performance Overview
          </h2>
          <div
            className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-gray-800 leading-relaxed border-l-4 border-green-400 shadow-sm"
            dangerouslySetInnerHTML={{ __html: formatText(performanceOverviewContent) }}
          />
        </section>
      )}
      
      {/* Email Section */}
      {rawEmailBlockContent && (
        <section className="bg-white p-8 rounded-xl shadow-lg border border-emerald-200 transition-all hover:shadow-xl">
          <h2 className="text-2xl font-bold flex gap-2 items-center text-gray-800 mb-6 border-b border-emerald-100 pb-3">
            <Clipboard className="text-emerald-600 h-6 w-6" />
            Personalized Cold Email
          </h2>
          <div className="relative">
             <div className="absolute -left-3 top-3 h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
               <ArrowUpCircle className="text-white h-5 w-5" /> {/* Changed Icon */}
             </div>
            <div 
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 pl-10 rounded-xl text-gray-800 leading-relaxed border-l-4 border-emerald-500 shadow-sm"
              dangerouslySetInnerHTML={{ __html: formatText(mainEmailContent) }}
            />
          </div>
          {parseAndRenderABSuggestions(abTestingSuggestionsContent)}
          <div className="mt-6 flex justify-end"> {/* Increased margin top */}
            <button 
              onClick={copyEmailToClipboard} {/* This will now copy only mainEmailContent */}
              className={`${copied ? 'bg-green-600' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg text-sm font-medium`}
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Clipboard className="h-5 w-5" /> {/* Use Clipboard icon */}
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
