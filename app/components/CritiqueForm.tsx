"use client";
import React, { useState } from "react";
import { ArrowRight, Loader } from "lucide-react";
import { ErrorMessage } from "./ErrorMessage";
import { LoadingMessage } from "./LoadingMessage";
import { ResultsDisplay } from "./ResultsDisplay";
import { validateAndNormalizeUrl } from "@/app/lib/urlUtils";

const CritiqueForm = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalized = validateAndNormalizeUrl(url);
    if (!normalized) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // --- NEW: Call the API Route ---
      const response = await fetch("/api/analyze", {
        // <-- ADJUST PATH if needed
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: normalized }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If response is not OK, throw an error with the message from API
        throw new Error(
          data.error || `Request failed with status ${response.status}`
        );
      }
      // --- END NEW ---

      setAnalysis(data.analysis); // <-- Use data.analysis from response
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
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
              setError(null); // Clear error on input change
            }}
            placeholder="example.com"
            className="flex-1 p-4 border rounded-lg text-lg"
            required
            disabled={isLoading} // Disable input while loading
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()} // Disable if loading or no URL
            className="px-6 py-4 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader className="animate-spin h-5 w-5" />
            ) : (
              "Analyze Website"
            )}
            {!isLoading && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>

        {error && <ErrorMessage message={error} />}
        {isLoading && <LoadingMessage />}
      </form>
      {analysis && !isLoading && <ResultsDisplay text={analysis} />}{" "}
      {/* Show only when not loading */}
    </div>
  );
};

export default CritiqueForm;
