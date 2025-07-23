"use client";
import React, { useState, useRef } from "react";
import { ArrowRight, Loader, Download } from "lucide-react";
import { ErrorMessage } from "./ErrorMessage";
import { LoadingMessage } from "./LoadingMessage";
import { ResultsDisplay } from "./ResultsDisplay";
import { validateAndNormalizeUrl } from "@/app/lib/urlUtils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const AuditForm = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audit, setAudit] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalized = validateAndNormalizeUrl(url);
    if (!normalized) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAudit(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: normalized }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Request failed with status ${response.status}`
        );
      }

      setAudit(data.audit);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (resultsRef.current) {
      html2canvas(resultsRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth;
        const height = width / ratio;
        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.save("audit-report.pdf");
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 shadow-lg rounded-lg"
      >
        <label className="block text-lg font-semibold text-gray-800">
          Website URL
          <span className="text-sm text-gray-500 ml-2">
            (e.g., https://example.com)
          </span>
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder="example.com"
            className="flex-1 p-4 border rounded-lg text-lg"
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-6 py-4 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader className="animate-spin h-5 w-5" />
            ) : (
              "Audit Website"
            )}
            {!isLoading && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>

        {error && <ErrorMessage message={error} />}
        {isLoading && <LoadingMessage />}
      </form>
      {audit && !isLoading && (
        <div ref={resultsRef}>
          <ResultsDisplay text={audit} />
        </div>
      )}
      {audit && !isLoading && (
        <button
          onClick={handleExport}
          className="mt-4 px-6 py-4 bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition hover:bg-gray-700"
        >
          <Download className="h-5 w-5" />
          Export as PDF
        </button>
      )}
    </div>
  );
};

export default AuditForm;
