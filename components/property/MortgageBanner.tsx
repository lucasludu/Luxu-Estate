"use client";

import { useState } from "react";
import { formatMessage, type Dictionary } from "@/i18n";

interface MortgageBannerProps {
  price: number;
  isMonthly?: boolean;
  estimatedMonthlyPayment: string;
  dict: Dictionary;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function MortgageBanner({
  price,
  isMonthly,
  estimatedMonthlyPayment,
  dict,
}: MortgageBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(5.1);
  const [years, setYears] = useState(30);

  const principal = price * (1 - downPaymentPct / 100);
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = years * 12;
  const monthlyCalculated = isMonthly
    ? price
    : monthlyRate > 0
      ? (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1)
      : principal / totalPayments;

  const displayPayment = isOpen
    ? `${currencyFormatter.format(Math.round(monthlyCalculated))}${dict.card.perMonth}`
    : estimatedMonthlyPayment.replace(/\/mo$/, dict.card.perMonth);

  return (
    <div className="bg-mosque/5 p-6 rounded-xl border border-mosque/10 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-full text-mosque shadow-sm">
            <span className="material-icons">calculate</span>
          </div>
          <div>
            <h3 className="font-semibold text-nordic">
              {dict.property.mortgage.title}
            </h3>
            <p className="text-sm text-nordic/60">
              {dict.property.mortgage.startingFrom}{" "}
              <strong className="text-mosque">{displayPayment}</strong>{" "}
              {isMonthly
                ? dict.property.mortgage.monthlyRentalLease
                : formatMessage(dict.property.mortgage.withDownPayment, {
                    pct: downPaymentPct,
                  })}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="whitespace-nowrap px-4 py-2 bg-white border border-nordic/10 rounded-lg text-sm font-semibold hover:border-mosque transition-colors text-nordic cursor-pointer"
        >
          {isOpen
            ? dict.property.mortgage.hideCalculator
            : dict.property.mortgage.calculateMortgage}
        </button>
      </div>

      {isOpen && !isMonthly && (
        <div className="pt-4 border-t border-mosque/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-nordic/70 flex justify-between mb-1">
              <span>{dict.property.mortgage.downPayment}</span>
              <span className="font-semibold text-nordic">
                {downPaymentPct}% (
                {currencyFormatter.format(
                  Math.round((price * downPaymentPct) / 100)
                )}
                )
              </span>
            </span>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full accent-mosque cursor-pointer"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-nordic/70 flex justify-between mb-1">
              <span>{dict.property.mortgage.interestRate}</span>
              <span className="font-semibold text-nordic">{interestRate}%</span>
            </span>
            <input
              type="range"
              min={2.5}
              max={9.0}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-mosque cursor-pointer"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-nordic/70 block mb-1">
              {dict.property.mortgage.loanTerm}
            </span>
            <div className="flex gap-2">
              {[15, 20, 30].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setYears(term)}
                  className={
                    years === term
                      ? "flex-1 py-1.5 rounded-md text-xs font-semibold bg-mosque text-white cursor-pointer"
                      : "flex-1 py-1.5 rounded-md text-xs font-medium bg-white border border-nordic/10 text-nordic hover:border-mosque cursor-pointer"
                  }
                >
                  {formatMessage(dict.property.mortgage.yearsShort, {
                    years: term,
                  })}
                </button>
              ))}
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
