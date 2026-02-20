"use client";

import TaxCalculator from "@/components/TaxCalculator";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">
            Freelancer Tax Calculator
          </h1>
          <p className="text-gray-600 text-lg">
            Estimate your self-employment taxes, federal income tax, and quarterly payments
          </p>
        </header>
        <TaxCalculator />
      </div>
    </main>
  );
}
