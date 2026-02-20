"use client";

import { useState, useMemo } from "react";
import { calculateTaxes, FilingStatus, TaxInput } from "@/lib/taxCalculations";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}

function CurrencyInput({ label, value, onChange, hint }: InputFieldProps) {
  const [raw, setRaw] = useState(value === 0 ? "" : String(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9.]/g, "");
    setRaw(cleaned);
    const parsed = parseFloat(cleaned);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-1">{hint}</p>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={raw}
          onChange={handleChange}
          onBlur={() => setRaw(value === 0 ? "" : String(value))}
          placeholder="0"
          className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

interface ResultRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  indent?: boolean;
}

function ResultRow({ label, value, highlight, indent }: ResultRowProps) {
  return (
    <div
      className={`flex justify-between items-center py-2 ${
        highlight ? "font-semibold text-indigo-800" : "text-gray-700"
      } ${indent ? "pl-4 text-sm" : ""}`}
    >
      <span>{label}</span>
      <span className={highlight ? "text-lg" : ""}>{value}</span>
    </div>
  );
}

export default function TaxCalculator() {
  const [input, setInput] = useState<TaxInput>({
    grossIncome: 0,
    businessExpenses: 0,
    otherIncome: 0,
    filingStatus: "single",
    useStandardDeduction: true,
    itemizedDeductions: 0,
    retirementContributions: 0,
  });

  const result = useMemo(() => calculateTaxes(input), [input]);

  const set = <K extends keyof TaxInput>(key: K, value: TaxInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Income &amp; Expenses</h2>

        <CurrencyInput
          label="Freelance / Self-Employment Gross Income"
          value={input.grossIncome}
          onChange={(v) => set("grossIncome", v)}
          hint="Total revenue before expenses"
        />

        <CurrencyInput
          label="Business Expenses"
          value={input.businessExpenses}
          onChange={(v) => set("businessExpenses", v)}
          hint="Home office, equipment, software, mileage, etc."
        />

        <CurrencyInput
          label="Other Income (W-2, interest, etc.)"
          value={input.otherIncome}
          onChange={(v) => set("otherIncome", v)}
        />

        <CurrencyInput
          label="Retirement Contributions (SEP-IRA, Solo 401k)"
          value={input.retirementContributions}
          onChange={(v) => set("retirementContributions", v)}
          hint="Reduces your AGI"
        />

        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 pt-2">Filing Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filing Status</label>
          <select
            value={input.filingStatus}
            onChange={(e) => set("filingStatus", e.target.value as FilingStatus)}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="single">Single</option>
            <option value="married">Married Filing Jointly</option>
            <option value="headOfHousehold">Head of Household</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deduction Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={input.useStandardDeduction}
                onChange={() => set("useStandardDeduction", true)}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-700">Standard Deduction</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!input.useStandardDeduction}
                onChange={() => set("useStandardDeduction", false)}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-700">Itemize</span>
            </label>
          </div>
        </div>

        {!input.useStandardDeduction && (
          <CurrencyInput
            label="Itemized Deductions"
            value={input.itemizedDeductions}
            onChange={(v) => set("itemizedDeductions", v)}
          />
        )}

        <p className="text-xs text-gray-400 pt-2">
          * Estimates based on 2024 federal tax law. Does not include state taxes.
          Consult a tax professional for personalized advice.
        </p>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-indigo-600 text-white rounded-2xl shadow-md p-4 text-center">
            <p className="text-sm opacity-80">Total Tax Liability</p>
            <p className="text-2xl font-bold mt-1">{fmt(result.totalTaxLiability)}</p>
            <p className="text-xs opacity-70 mt-1">Effective rate: {pct(result.effectiveTotalRate)}</p>
          </div>
          <div className="bg-orange-500 text-white rounded-2xl shadow-md p-4 text-center">
            <p className="text-sm opacity-80">Quarterly Payment</p>
            <p className="text-2xl font-bold mt-1">{fmt(result.quarterlyEstimatedPayment)}</p>
            <p className="text-xs opacity-70 mt-1">Due Apr · Jun · Sep · Jan</p>
          </div>
        </div>

        {/* Detailed breakdown */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Tax Breakdown</h2>

          <div className="divide-y divide-gray-100">
            <ResultRow label="Gross Self-Employment Income" value={fmt(input.grossIncome)} />
            <ResultRow label="Business Expenses" value={`− ${fmt(input.businessExpenses)}`} indent />
            <ResultRow label="Net Self-Employment Income" value={fmt(result.netSelfEmploymentIncome)} highlight />

            <div className="pt-2 pb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Self-Employment Tax (15.3%)</p>
            </div>
            <ResultRow label="Social Security (12.4%)" value={fmt(result.seSocialSecurityTax)} indent />
            <ResultRow label="Medicare (2.9%)" value={fmt(result.seMedicareTax)} indent />
            {result.additionalMedicareTax > 0 && (
              <ResultRow label="Additional Medicare (0.9%)" value={fmt(result.additionalMedicareTax)} indent />
            )}
            <ResultRow label="Total SE Tax" value={fmt(result.totalSETax)} highlight />

            <div className="pt-2 pb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Federal Income Tax</p>
            </div>
            <ResultRow label="½ SE Tax Deduction" value={`− ${fmt(result.seDeduction)}`} indent />
            <ResultRow label="Retirement Contributions" value={`− ${fmt(input.retirementContributions)}`} indent />
            <ResultRow label="Adjusted Gross Income" value={fmt(result.adjustedGrossIncome)} indent />
            <ResultRow
              label={input.useStandardDeduction ? "Standard Deduction" : "Itemized Deduction"}
              value={`− ${fmt(result.deduction)}`}
              indent
            />
            <ResultRow label="Taxable Income" value={fmt(result.taxableIncome)} highlight />

            {result.breakdown.map((b, i) => (
              <ResultRow key={i} label={`  ${b.bracket}`} value={fmt(b.amount)} indent />
            ))}

            <ResultRow
              label={`Federal Income Tax (${pct(result.effectiveFederalRate)} eff. / ${pct(result.marginalFederalRate)} marginal)`}
              value={fmt(result.federalIncomeTax)}
              highlight
            />

            <div className="mt-3 pt-3 border-t-2 border-indigo-200">
              <ResultRow label="Total Tax Liability" value={fmt(result.totalTaxLiability)} highlight />
              <ResultRow
                label="Effective Total Rate"
                value={pct(result.effectiveTotalRate)}
                highlight
              />
            </div>
          </div>
        </div>

        {/* Quarterly dates */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
            2024 Quarterly Due Dates
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { q: "Q1", date: "April 15, 2024" },
              { q: "Q2", date: "June 17, 2024" },
              { q: "Q3", date: "September 16, 2024" },
              { q: "Q4", date: "January 15, 2025" },
            ].map(({ q, date }) => (
              <div key={q} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="font-medium text-indigo-700">{q}</p>
                  <p className="text-gray-500 text-xs">{date}</p>
                </div>
                <p className="font-semibold text-gray-800">{fmt(result.quarterlyEstimatedPayment)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
