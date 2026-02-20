// 2024 Federal Income Tax Brackets (Single filer)
const FEDERAL_BRACKETS_SINGLE = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

// 2024 Federal Income Tax Brackets (Married Filing Jointly)
const FEDERAL_BRACKETS_MFJ = [
  { min: 0, max: 23200, rate: 0.10 },
  { min: 23200, max: 94300, rate: 0.12 },
  { min: 94300, max: 201050, rate: 0.22 },
  { min: 201050, max: 383900, rate: 0.24 },
  { min: 383900, max: 487450, rate: 0.32 },
  { min: 487450, max: 731200, rate: 0.35 },
  { min: 731200, max: Infinity, rate: 0.37 },
];

// 2024 Standard Deductions
const STANDARD_DEDUCTION = {
  single: 14600,
  married: 29200,
  headOfHousehold: 21900,
};

// Self-employment tax rate (Social Security + Medicare)
const SE_TAX_SOCIAL_SECURITY_WAGE_BASE = 168600; // 2024
const SOCIAL_SECURITY_RATE = 0.124;
const MEDICARE_RATE = 0.029;
const ADDITIONAL_MEDICARE_RATE = 0.009; // Additional Medicare for high earners

export type FilingStatus = "single" | "married" | "headOfHousehold";

export interface TaxInput {
  grossIncome: number;
  businessExpenses: number;
  otherIncome: number;
  filingStatus: FilingStatus;
  useStandardDeduction: boolean;
  itemizedDeductions: number;
  retirementContributions: number;
}

export interface TaxResult {
  netSelfEmploymentIncome: number;
  seSocialSecurityTax: number;
  seMedicareTax: number;
  additionalMedicareTax: number;
  totalSETax: number;
  seDeduction: number;
  adjustedGrossIncome: number;
  deduction: number;
  taxableIncome: number;
  federalIncomeTax: number;
  effectiveFederalRate: number;
  marginalFederalRate: number;
  totalTaxLiability: number;
  effectiveTotalRate: number;
  quarterlyEstimatedPayment: number;
  breakdown: { bracket: string; amount: number }[];
}

function calculateFederalTax(
  taxableIncome: number,
  filingStatus: FilingStatus
): { tax: number; marginalRate: number; breakdown: { bracket: string; amount: number }[] } {
  const brackets =
    filingStatus === "married" ? FEDERAL_BRACKETS_MFJ : FEDERAL_BRACKETS_SINGLE;
  let tax = 0;
  let marginalRate = 0;
  const breakdown: { bracket: string; amount: number }[] = [];
  let remaining = taxableIncome;

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.max - bracket.min);
    if (taxableInBracket <= 0) continue;
    const taxInBracket = taxableInBracket * bracket.rate;
    tax += taxInBracket;
    marginalRate = bracket.rate;
    breakdown.push({
      bracket: `${(bracket.rate * 100).toFixed(0)}% (up to $${bracket.max === Infinity ? "∞" : bracket.max.toLocaleString()})`,
      amount: taxInBracket,
    });
    remaining -= taxableInBracket;
  }

  return { tax, marginalRate, breakdown };
}

export function calculateTaxes(input: TaxInput): TaxResult {
  const {
    grossIncome,
    businessExpenses,
    otherIncome,
    filingStatus,
    useStandardDeduction,
    itemizedDeductions,
    retirementContributions,
  } = input;

  // Net self-employment income
  const netSelfEmploymentIncome = Math.max(0, grossIncome - businessExpenses);

  // Self-employment tax calculation
  // SE tax is on 92.35% of net SE income (the employee equivalent)
  const seTaxableIncome = netSelfEmploymentIncome * 0.9235;

  const socialSecurityBase = Math.min(seTaxableIncome, SE_TAX_SOCIAL_SECURITY_WAGE_BASE);
  const seSocialSecurityTax = socialSecurityBase * SOCIAL_SECURITY_RATE;
  const seMedicareTax = seTaxableIncome * MEDICARE_RATE;

  // Additional Medicare tax on income over $200k (single) or $250k (married)
  const additionalMedicareThreshold = filingStatus === "married" ? 250000 : 200000;
  const additionalMedicareTax = Math.max(
    0,
    (netSelfEmploymentIncome + otherIncome - additionalMedicareThreshold) * ADDITIONAL_MEDICARE_RATE
  );

  const totalSETax = seSocialSecurityTax + seMedicareTax + additionalMedicareTax;

  // Deduction for 1/2 of SE tax (above-the-line deduction)
  const seDeduction = (seSocialSecurityTax + seMedicareTax) / 2;

  // Adjusted Gross Income
  const adjustedGrossIncome = Math.max(
    0,
    netSelfEmploymentIncome + otherIncome - seDeduction - retirementContributions
  );

  // Standard or itemized deduction
  const standardDeduction =
    filingStatus === "married"
      ? STANDARD_DEDUCTION.married
      : filingStatus === "headOfHousehold"
      ? STANDARD_DEDUCTION.headOfHousehold
      : STANDARD_DEDUCTION.single;

  const deduction = useStandardDeduction
    ? standardDeduction
    : Math.max(standardDeduction, itemizedDeductions);

  // Taxable income
  const taxableIncome = Math.max(0, adjustedGrossIncome - deduction);

  // Federal income tax
  const { tax: federalIncomeTax, marginalRate: marginalFederalRate, breakdown } =
    calculateFederalTax(taxableIncome, filingStatus);

  // Effective rates
  const totalTaxLiability = federalIncomeTax + totalSETax;
  const baseIncome = netSelfEmploymentIncome + otherIncome;
  const effectiveFederalRate = baseIncome > 0 ? federalIncomeTax / baseIncome : 0;
  const effectiveTotalRate = baseIncome > 0 ? totalTaxLiability / baseIncome : 0;

  // Quarterly estimated payment (total liability / 4)
  const quarterlyEstimatedPayment = totalTaxLiability / 4;

  return {
    netSelfEmploymentIncome,
    seSocialSecurityTax,
    seMedicareTax,
    additionalMedicareTax,
    totalSETax,
    seDeduction,
    adjustedGrossIncome,
    deduction,
    taxableIncome,
    federalIncomeTax,
    effectiveFederalRate,
    marginalFederalRate,
    totalTaxLiability,
    effectiveTotalRate,
    quarterlyEstimatedPayment,
    breakdown,
  };
}
