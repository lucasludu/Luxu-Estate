"use client";

import { useState } from "react";
import Image from "next/image";
import type { PropertyAgent } from "@/data/properties";

interface PropertyAgentCardProps {
  priceFormatted: string;
  isMonthly?: boolean;
  location: string;
  title: string;
  agent: PropertyAgent;
}

export function PropertyAgentCard({
  priceFormatted,
  isMonthly,
  location,
  title,
  agent,
}: PropertyAgentCardProps) {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-mosque/5">
      <div className="mb-4">
        <h1 className="text-4xl font-display font-light text-nordic mb-2">
          {priceFormatted}
          {isMonthly && (
            <span className="text-lg font-normal text-nordic/60">/mo</span>
          )}
        </h1>
        <p className="text-nordic/60 font-medium flex items-center gap-1">
          <span className="material-icons text-mosque text-sm">
            location_on
          </span>
          {location}
        </p>
      </div>

      <div className="h-px bg-slate-100 my-6"></div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
          <Image
            alt={agent.name}
            className="w-full h-full object-cover"
            fill
            sizes="56px"
            src={agent.avatar}
          />
        </div>
        <div>
          <h3 className="font-semibold text-nordic">{agent.name}</h3>
          <div className="flex items-center gap-1 text-xs text-mosque font-medium">
            <span className="material-icons text-[14px]">star</span>
            <span>{agent.role}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() =>
              setFeedbackMessage(
                `Starting live chat with ${agent.name} about ${title}...`
              )
            }
            aria-label={`Chat with ${agent.name}`}
            className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          >
            <span className="material-icons text-sm">chat</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setFeedbackMessage(
                `Requesting a call from ${agent.name} for ${title}...`
              )
            }
            aria-label={`Call ${agent.name}`}
            className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          >
            <span className="material-icons text-sm">call</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() =>
            setFeedbackMessage(
              `Visit request received for ${title}. ${agent.name} will confirm your appointment shortly.`
            )
          }
          className="w-full bg-mosque hover:bg-[#005544] text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span className="material-icons text-xl group-hover:scale-110 transition-transform">
            calendar_today
          </span>
          Schedule Visit
        </button>
        <button
          type="button"
          onClick={() =>
            setFeedbackMessage(
              `Inquiry sent to ${agent.name}. Expect a personalized dossier in your inbox.`
            )
          }
          className="w-full bg-transparent border border-nordic/10 hover:border-mosque text-nordic/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-icons text-xl">mail_outline</span>
          Contact Agent
        </button>
      </div>

      {feedbackMessage && (
        <div
          role="status"
          className="mt-4 p-3 rounded-lg bg-hint-of-green/60 border border-mosque/20 text-xs text-nordic flex items-start justify-between gap-2"
        >
          <span>{feedbackMessage}</span>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            aria-label="Dismiss notification"
            className="text-nordic/60 hover:text-nordic cursor-pointer"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      )}
    </div>
  );
}

