"use client";
import React, { useState } from "react";
import {
  ArrowRight,
  Flame,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import { ScaleLoader } from "react-spinners";
const CritiqueForm = () => {
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    strengths?: string[];
    weaknesses?: string[];
    suggestions?: string[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }
    if (!url) {
      setError("Please Enter a valid url.");
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch("/api/critique", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.critique);
        setError("");
      } else {
        setError("Error, Please try again later");
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setError(
        "There was an error processing your request. Please try again later."
      );
    }
  };
  const getSectionIcon = (section: string) => {
    switch (section) {
      case "strengths":
        return <CheckCircle size={18} className="text-green-600" />;
      case "weaknesses":
        return <AlertTriangle size={18} className="text-yellow-600" />;
      case "suggestions":
        return <Lightbulb size={18} className="text-blue-600" />;
      case "roast":
        return <Flame size={18} className="text-red-600" />;
    }
  };
  return (
    <section className="bg-white border border-black/10  0  p-8 w-[50%] my-20 rounded-lg shadow-lg space-y-8">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Analyze by URL</h2>
        <p className="text-gray-700">
          Enter the URL of the page you want to analyze
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="text"
          name="inputUrl"
          id="url"
          className="px-4 py-2 rounded-lg outline-none focus:ring-2 ring-gray-500 transition-all duration-300 ease-out w-full border border-black/20 "
          placeholder="https://example.com"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {result && (
          <div className="space-y-6 mt-6">
            {Object.entries(result).map(([section, items]) => (
              <div
                key={section}
                className={`${
                  section.toLocaleLowerCase() === "roast"
                    ? "bg-red-100/50 border border-red-400/30"
                    : ""
                } rounded-lg p-4 shadow-lg border border-gray-700/20`}
              >
                <h3
                  className={`flex items-center space-x-2 text-xl font-semibold capitalize my-4 rounded-lg px-4 py-2 w-fit ${
                    section === "strengths"
                      ? "bg-green-500/20 border border-green-400   text-green-700"
                      : section === "weaknesses"
                      ? "bg-yellow-500/20 border border-yellow-400 text-yellow-700"
                      : section === "suggestions"
                      ? "bg-blue-500/20 border border-blue-400 text-blue-700"
                      : section === "roast"
                      ? "bg-red-200/30 border border-red-400 text-red-700"
                      : ""
                  }`}
                >
                  <p>{getSectionIcon(section)}</p>
                  <p>{section}</p>{" "}
                </h3>
                <ul className="  text-gray-700 space-y-6">
                  {items?.map((item, i) => (
                    <li
                      key={i}
                      className={`${
                        section === "roast"
                          ? "rounded-sm pl-4 border-l-4 border-red-600"
                          : ""
                      }`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            type="reset"
            onClick={() => setResult(null)}
            className="  text-gray-500 rounded-lg px-4 py-2 hover:bg-black/5 transition-all duration-300 ease-out group cursor-pointer border-2 border-gray-800/30"
          >
            Clear
          </button>
          <button
            className={`flex items-center space-x-2  text-white rounded-lg px-4 py-2 hover:bg-blue-600/80 transition-all duration-300 ease-out group cursor-pointer  ${
              isLoading
                ? "bg-blue-600/70 cursor-not-allowed"
                : "bg-blue-600 cursor-pointer"
            } `}
          >
            <p>{isLoading ? "Analyzing..." : "Analyze"}</p>

            {isLoading ? (
              <ScaleLoader width={2} height={15} color="#ffffff" />
            ) : (
              <span className="group-hover:translate-x-1 transition-all duration-300 ease-out">
                <ArrowRight />{" "}
              </span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CritiqueForm;
