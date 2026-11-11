"use client";

import { useState } from "react";
import {
  formatMessage,
  translateDescriptionParagraph,
  type Dictionary,
} from "@/i18n";

interface PropertyAboutProps {
  description: string[];
  title: string;
  location: string;
  dict: Dictionary;
}

export function PropertyAbout({
  description,
  title,
  location,
  dict,
}: PropertyAboutProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
      <h2 className="text-lg font-semibold mb-4 text-nordic">
        {dict.property.about.title}
      </h2>
      <div className="prose prose-slate max-w-none text-nordic/70 leading-relaxed space-y-4">
        {description.map((paragraph, idx) => (
          <p key={idx}>{translateDescriptionParagraph(dict, paragraph)}</p>
        ))}
        {expanded && (
          <p>
            {formatMessage(dict.property.about.expandedParagraph, {
              location,
              title,
            })}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-4 text-mosque font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
      >
        {expanded ? dict.property.about.readLess : dict.property.about.readMore}
        <span className="material-icons text-sm">
          {expanded ? "arrow_upward" : "arrow_forward"}
        </span>
      </button>
    </div>
  );
}
