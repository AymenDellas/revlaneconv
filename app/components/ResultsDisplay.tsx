import React, { useState } from "react";
import { Clipboard, Check } from "lucide-react";

export const ResultsDisplay = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const extractEmailContent = (fullText: string) => {
    const match = fullText.match(/✉️ COLD EMAIL GENERATOR([\s\S]*)/);
    return match ? match[1].trim() : fullText;
  };

  const emailContent = extractEmailContent(text);

  const copyEmailToClipboard = () => {
    if (emailContent) {
      const plainText = emailContent.replace(/<[^>]*>/g, '');
      navigator.clipboard.writeText(plainText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  
  const formatText = (content: string) => {
    let formatted = content.replace(/\n/g, '<br />');
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/• (.+?)(?=<br \/>|$)/g, '<li class="ml-4 mb-1">$1</li>');
    formatted = formatted.replace(/^\* (.+?)(?=<br \/>|$)/gm, '<li class="ml-4 mb-1">$1</li>');
    if (formatted.includes('<li')) {
      formatted = formatted.replace(/(<li[^>]*>.+?<\/li>\s*)+/g, '<ul class="my-2 list-disc">$&</ul>');
    }
    return formatted;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <section className="bg-white p-8 rounded-xl shadow-lg border border-emerald-200 transition-all hover:shadow-xl">
        <h2 className="text-2xl font-bold flex gap-2 items-center text-gray-800 mb-6 border-b border-emerald-100 pb-3">
          <Clipboard className="text-emerald-600 h-6 w-6" />
          Personalized Cold Email
        </h2>
        <div className="relative">
          <div
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-xl text-gray-800 leading-relaxed border-l-4 border-emerald-500 shadow-sm"
            dangerouslySetInnerHTML={{ __html: formatText(emailContent) }}
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
                <Clipboard className="h-4 w-4" />
                Copy Email
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};
