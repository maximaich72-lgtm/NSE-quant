/**
 * NSE Quant & Valuation Terminal
 * Institutional Financial Data Types & Schema
 */

export type CompanyType = 'BANK' | 'TELECOM' | 'FMCG' | 'MANUFACTURING' | 'OTHER';

export interface Company {
  id: string;
  ticker: string;
  name: string;
  legalName: string;
  sector: string;
  industry: string;
  companyType: CompanyType;
  countryCode: string;
  currencyCode: 'KES';
  isin: string;
  website: string;
  irUrl: string;
  currentPrice: number;
  dayChange: number;
  dayChangePct: number;
  sharesOutstanding: number; // in shares
  marketCap: number; // in KES
  peRatio: number | null;
  pbRatio: number | null;
  dividendYield: number | null;
  beta: number;
  description: string;
  primaryExchange: string;
  fiscalYearEnd: string; // e.g. "31 March", "31 December", "30 June"
}

export type PeriodType = 'ANNUAL' | 'QUARTERLY' | 'HALF_YEAR';

export interface FinancialPeriod {
  id: string;
  companyId: string;
  fiscalYear: number;
  periodType: PeriodType;
  periodStart: string;
  periodEnd: string;
  reportingDate: string;
  currencyCode: 'KES';
  isAudited: boolean;
  sourceDocId: string;
}

export type StatementType =
  | 'INCOME_STATEMENT'
  | 'BALANCE_SHEET'
  | 'CASH_FLOW'
  | 'BANKING'
  | 'TELECOM'
  | 'FMCG';

export interface FinancialFact {
  id: string;
  companyId: string;
  periodId: string;
  fiscalYear: number;
  statementType: StatementType;
  metricName: string;
  metricLabel: string;
  category?: string;
  value: number; // Stored in exact KES base units
  unit: 'KES' | 'SHARES' | 'RATIO' | 'PERCENT' | 'COUNT';
  currencyCode: 'KES';
  sourceDocId: string;
  sourceDocTitle?: string;
  sourcePage?: number | null;
  sourceSection?: string;
  sourceText?: string;
  isVerified: boolean;
  verificationStatus: 'VERIFIED' | 'DEMO' | 'REQUIRES_REVIEW';
}

export interface MetricCalculationResult {
  metricName: string;
  label: string;
  category: 'PROFITABILITY' | 'GROWTH' | 'LEVERAGE' | 'LIQUIDITY' | 'EFFICIENCY' | 'VALUATION' | 'BANKING';
  value: number | null;
  formattedValue: string;
  unit: '%' | 'x' | 'KES' | 'ratio' | 'days';
  formula: string;
  isAvailable: boolean;
  missingReason?: string;
  inputFacts: { name: string; value: number | null; formatted: string }[];
  benchmark?: string;
  interpretation?: string;
}

export interface BankSpecificMetrics {
  loanGrowth: MetricCalculationResult;
  depositGrowth: MetricCalculationResult;
  nplRatio: MetricCalculationResult;
  nplCoverage: MetricCalculationResult;
  costOfRisk: MetricCalculationResult;
  tier1CapitalAdequacy: MetricCalculationResult;
  totalCapitalAdequacy: MetricCalculationResult;
  statutoryLiquidityRatio: MetricCalculationResult;
  netInterestMargin: MetricCalculationResult;
  costToIncomeRatio: MetricCalculationResult;
}

export interface SourceDocument {
  id: string;
  companyId: string;
  documentType: 'ANNUAL_REPORT' | 'INTEGRATED_REPORT' | 'FINANCIAL_STATEMENTS' | 'RESULTS_BOOKLET' | 'CBK_REPORT' | 'NSE_DATA';
  title: string;
  publicationDate: string;
  fiscalYear: number;
  sourceOrganization: string;
  auditor?: string;
  opinion?: 'UNQUALIFIED' | 'QUALIFIED' | 'UNAUDITED';
  url: string;
  fileHash: string;
  pageCount: number;
  verificationStatus: 'VERIFIED' | 'DEMO';
}

export interface DataQualityCheck {
  id: string;
  companyId: string;
  companyTicker: string;
  fiscalYear: number;
  checkType:
    | 'BALANCE_SHEET_RECONCILIATION'
    | 'MISSING_REQUIRED_FIELD'
    | 'DUPLICATE_RECORD'
    | 'CURRENCY_CHECK'
    | 'PERIOD_CHECK'
    | 'SOURCE_CHECK'
    | 'FORMULA_CHECK'
    | 'OUTLIER_CHECK';
  status: 'PASS' | 'WARNING' | 'FAIL';
  metric: string;
  expectedValue?: number;
  actualValue?: number;
  difference?: number;
  message: string;
  details?: string;
  checkedAt: string;
}

export interface ScenarioAssumption {
  revenueGrowthChange: number; // e.g. 5 for +5%
  operatingMarginChange: number; // e.g. 2 for +2%
  interestExpenseChange: number; // e.g. -5 for -5%
  taxRateChange: number; // target tax rate, e.g. 30%
  capexChange: number; // e.g. 10 for +10% capex
}

export interface ScenarioProjections {
  baseYear: number;
  projectionYears: number[];
  baseCase: {
    revenue: number;
    operatingIncome: number;
    operatingMargin: number;
    taxExpense: number;
    netIncome: number;
    operatingCashFlow: number;
    capex: number;
    freeCashFlow: number;
    eps: number;
  };
  scenarioCase: {
    revenue: number;
    operatingIncome: number;
    operatingMargin: number;
    taxExpense: number;
    netIncome: number;
    operatingCashFlow: number;
    capex: number;
    freeCashFlow: number;
    eps: number;
  };
  variance: {
    revenuePct: number;
    operatingIncomePct: number;
    netIncomePct: number;
    fcfPct: number;
    epsPct: number;
  };
  impliedValuation: {
    baseMarketCap: number;
    scenarioMarketCap: number;
    basePricePerShare: number;
    scenarioPricePerShare: number;
    priceDeltaPct: number;
  };
}

export interface AIStructuredResponse {
  observation: string;
  evidence: string[];
  interpretation: string;
  source: string;
  pageReferences: string[];
}

export interface AIResearchSession {
  id: string;
  companyId: string;
  question: string;
  response: string;
  structured?: AIStructuredResponse;
  sources: { title: string; page?: number; link?: string }[];
  createdAt: string;
  model: string;
}
