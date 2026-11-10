"use client";

import { useState } from "react";

interface PropertyAboutProps {
  description: string[];
  title: string;
  location: string;
}

export function PropertyAbout({
  description,
  title,
  location,
}: PropertyAboutProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
      <h2 className="text-lg font-semibold mb-4 text-nordic">
        About this home
      </h2>
      <div className="prose prose-slate max-w-none text-nordic/70 leading-relaxed space-y-4">
        {description.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
        {expanded && (
          <p>
            Situated in a prime enclave of {location}, {title} combines timeless
            architectural craftsmanship with sustainable modern engineering,
            offering private landscaped grounds, acoustic-grade glazing, and
            effortless access to fine dining, parks, and cultural landmarks.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-4 text-mosque font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
      >
        {expanded ? "Read less" : "Read more"}
        <span className="material-icons text-sm">
          {expanded ? "arrow_upward" : "arrow_forward"}
        </span>
      </button>
    </div>
  );
}

