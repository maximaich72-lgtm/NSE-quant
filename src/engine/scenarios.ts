import { Company, FinancialFact, ScenarioAssumption, ScenarioProjections } from '../types/financial';

export function runScenarioModel(
  company: Company,
  latestFacts: FinancialFact[],
  assumptions: ScenarioAssumption
): ScenarioProjections {
  const getFact = (name: string): number =>
    latestFacts.find(f => f.metricName === name)?.value ?? 0;

  const baseRevenue = getFact('revenue') || 100_000_000_000;
  const baseOperatingIncome = getFact('operating_income') || baseRevenue * 0.25;
  const baseOperatingMargin = (baseOperatingIncome / baseRevenue) * 100;
  const baseFinanceExpense = getFact('finance_expense') || baseRevenue * 0.03;
  const baseTax = getFact('income_tax') || (baseOperatingIncome - baseFinanceExpense) * 0.30;
  const baseNetIncome = getFact('net_income') || (baseOperatingIncome - baseFinanceExpense - baseTax);
  const baseOcf = getFact('operating_cash_flow') || baseNetIncome * 1.3;
  const baseCapex = getFact('capital_expenditure') || baseRevenue * 0.12;
  const baseFcf = baseOcf - baseCapex;
  const shares = company.sharesOutstanding || 1_000_000_000;
  const baseEps = baseNetIncome / shares;

  // Scenario Case Projections:
  // 1. Projected Revenue = baseRevenue * (1 + (revenueGrowthChange / 100))
  const scenarioRevenue = baseRevenue * (1 + assumptions.revenueGrowthChange / 100);

  // 2. Projected Operating Margin = baseOperatingMargin + assumptions.operatingMarginChange
  const scenarioOperatingMargin = Math.max(1, baseOperatingMargin + assumptions.operatingMarginChange);
  const scenarioOperatingIncome = scenarioRevenue * (scenarioOperatingMargin / 100);

  // 3. Projected Finance Expense = baseFinanceExpense * (1 + assumptions.interestExpenseChange / 100)
  const scenarioFinanceExpense = baseFinanceExpense * (1 + assumptions.interestExpenseChange / 100);

  // 4. Projected PBT & Tax
  const scenarioPbt = Math.max(0, scenarioOperatingIncome - scenarioFinanceExpense);
  const effectiveTaxRate = assumptions.taxRateChange / 100;
  const scenarioTax = scenarioPbt * effectiveTaxRate;

  // 5. Projected Net Income
  const scenarioNetIncome = scenarioPbt - scenarioTax;
  const scenarioEps = scenarioNetIncome / shares;

  // 6. Projected Cash Flow
  // Operating cash flow scales with Net income + non-cash depreciation factor
  const ocfConversion = baseNetIncome > 0 ? baseOcf / baseNetIncome : 1.2;
  const scenarioOcf = scenarioNetIncome * ocfConversion;
  const scenarioCapex = baseCapex * (1 + assumptions.capexChange / 100);
  const scenarioFcf = scenarioOcf - scenarioCapex;

  // 7. Implied Valuation
  const trailingPe = company.peRatio && company.peRatio > 0 ? company.peRatio : 10;
  const baseMarketCap = company.marketCap;
  const scenarioMarketCap = scenarioNetIncome * trailingPe;
  const basePricePerShare = company.currentPrice;
  const scenarioPricePerShare = scenarioEps * trailingPe;
  const priceDeltaPct = basePricePerShare > 0 ? ((scenarioPricePerShare - basePricePerShare) / basePricePerShare) * 100 : 0;

  return {
    baseYear: 2024,
    projectionYears: [2025, 2026, 2027],
    baseCase: {
      revenue: baseRevenue,
      operatingIncome: baseOperatingIncome,
      operatingMargin: baseOperatingMargin,
      taxExpense: baseTax,
      netIncome: baseNetIncome,
      operatingCashFlow: baseOcf,
      capex: baseCapex,
      freeCashFlow: baseFcf,
      eps: baseEps
    },
    scenarioCase: {
      revenue: scenarioRevenue,
      operatingIncome: scenarioOperatingIncome,
      operatingMargin: scenarioOperatingMargin,
      taxExpense: scenarioTax,
      netIncome: scenarioNetIncome,
      operatingCashFlow: scenarioOcf,
      capex: scenarioCapex,
      freeCashFlow: scenarioFcf,
      eps: scenarioEps
    },
    variance: {
      revenuePct: baseRevenue > 0 ? ((scenarioRevenue - baseRevenue) / baseRevenue) * 100 : 0,
      operatingIncomePct: baseOperatingIncome > 0 ? ((scenarioOperatingIncome - baseOperatingIncome) / baseOperatingIncome) * 100 : 0,
      netIncomePct: baseNetIncome > 0 ? ((scenarioNetIncome - baseNetIncome) / baseNetIncome) * 100 : 0,
      fcfPct: baseFcf > 0 ? ((scenarioFcf - baseFcf) / baseFcf) * 100 : 0,
      epsPct: baseEps > 0 ? ((scenarioEps - baseEps) / baseEps) * 100 : 0
    },
    impliedValuation: {
      baseMarketCap,
      scenarioMarketCap,
      basePricePerShare,
      scenarioPricePerShare,
      priceDeltaPct
    }
  };
}
