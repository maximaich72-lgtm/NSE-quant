import { FinancialFact, MetricCalculationResult, BankSpecificMetrics, Company } from '../types/financial';
import { formatPercent, formatMultiple, formatKES } from './formatters';

export function calculateBankMetrics(
  factsForYear: FinancialFact[],
  factsForPriorYear: FinancialFact[] | null,
  company: Company,
  year: number
): BankSpecificMetrics | null {
  if (company.companyType !== 'BANK') {
    return null;
  }

  const getFact = (name: string): FinancialFact | undefined =>
    factsForYear.find(f => f.metricName === name);

  const getPriorFact = (name: string): FinancialFact | undefined =>
    factsForPriorYear ? factsForPriorYear.find(f => f.metricName === name) : undefined;

  // 1. Loan Growth
  const loans = getFact('loan_book')?.value;
  const priorLoans = getPriorFact('loan_book')?.value;
  let loanGrowth: MetricCalculationResult;
  if (loans !== undefined && priorLoans !== undefined && priorLoans > 0) {
    const val = ((loans - priorLoans) / priorLoans) * 100;
    loanGrowth = {
      metricName: 'loan_growth',
      label: 'Net Loan Growth (YoY)',
      category: 'BANKING',
      value: val,
      formattedValue: formatPercent(val, 2, true),
      unit: '%',
      formula: '(Loans_t - Loans_{t-1}) / Loans_{t-1}',
      isAvailable: true,
      inputFacts: [
        { name: `FY${year} Loans`, value: loans, formatted: formatKES(loans, { compact: true }) },
        { name: `FY${year - 1} Loans`, value: priorLoans, formatted: formatKES(priorLoans, { compact: true }) }
      ]
    };
  } else {
    loanGrowth = {
      metricName: 'loan_growth',
      label: 'Net Loan Growth (YoY)',
      category: 'BANKING',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: '(Loans_t - Loans_{t-1}) / Loans_{t-1}',
      isAvailable: false,
      missingReason: priorLoans === undefined ? 'Prior year loan book fact not available' : 'Current year loan book missing',
      inputFacts: []
    };
  }

  // 2. Deposit Growth
  const deposits = getFact('customer_deposits')?.value;
  const priorDeposits = getPriorFact('customer_deposits')?.value;
  let depositGrowth: MetricCalculationResult;
  if (deposits !== undefined && priorDeposits !== undefined && priorDeposits > 0) {
    const val = ((deposits - priorDeposits) / priorDeposits) * 100;
    depositGrowth = {
      metricName: 'deposit_growth',
      label: 'Customer Deposit Growth (YoY)',
      category: 'BANKING',
      value: val,
      formattedValue: formatPercent(val, 2, true),
      unit: '%',
      formula: '(Deposits_t - Deposits_{t-1}) / Deposits_{t-1}',
      isAvailable: true,
      inputFacts: [
        { name: `FY${year} Deposits`, value: deposits, formatted: formatKES(deposits, { compact: true }) },
        { name: `FY${year - 1} Deposits`, value: priorDeposits, formatted: formatKES(priorDeposits, { compact: true }) }
      ]
    };
  } else {
    depositGrowth = {
      metricName: 'deposit_growth',
      label: 'Customer Deposit Growth (YoY)',
      category: 'BANKING',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: '(Deposits_t - Deposits_{t-1}) / Deposits_{t-1}',
      isAvailable: false,
      missingReason: 'Missing prior or current customer deposits',
      inputFacts: []
    };
  }

  // 3. NPL Ratio
  const grossNpl = getFact('gross_non_performing_loans')?.value;
  let nplRatio: MetricCalculationResult;
  if (grossNpl !== undefined && loans !== undefined && loans > 0) {
    // Gross loans approximately equals net loans + provisions, or ratio over net loans
    const ratio = (grossNpl / (loans + (getFact('loan_loss_provisions')?.value ?? 0))) * 100;
    nplRatio = {
      metricName: 'npl_ratio',
      label: 'Gross NPL Ratio',
      category: 'BANKING',
      value: ratio,
      formattedValue: formatPercent(ratio, 2),
      unit: '%',
      formula: 'Gross Non-Performing Loans / Gross Customer Loans',
      isAvailable: true,
      benchmark: 'CBK Industry Average is ~15.5%',
      inputFacts: [
        { name: 'Gross NPLs', value: grossNpl, formatted: formatKES(grossNpl, { compact: true }) },
        { name: 'Loans Book', value: loans, formatted: formatKES(loans, { compact: true }) }
      ],
      interpretation: ratio < 12 ? 'Healthy asset quality below industry average' : 'Elevated credit risk requiring close monitoring'
    };
  } else {
    nplRatio = {
      metricName: 'npl_ratio',
      label: 'Gross NPL Ratio',
      category: 'BANKING',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Gross NPLs / Gross Loans',
      isAvailable: false,
      missingReason: 'Gross Non-Performing Loans fact not disclosed',
      inputFacts: []
    };
  }

  // 4. NPL Coverage Ratio
  const prov = getFact('loan_loss_provisions')?.value;
  let nplCoverage: MetricCalculationResult;
  if (prov !== undefined && grossNpl !== undefined && grossNpl > 0) {
    const cov = (prov / grossNpl) * 100;
    nplCoverage = {
      metricName: 'npl_coverage',
      label: 'NPL Coverage Ratio',
      category: 'BANKING',
      value: cov,
      formattedValue: formatPercent(cov, 2),
      unit: '%',
      formula: 'Cumulative Provisions / Gross Non-Performing Loans',
      isAvailable: true,
      benchmark: 'Prudential threshold > 60%',
      inputFacts: [
        { name: 'Provisions', value: prov, formatted: formatKES(prov, { compact: true }) },
        { name: 'Gross NPLs', value: grossNpl, formatted: formatKES(grossNpl, { compact: true }) }
      ]
    };
  } else {
    nplCoverage = {
      metricName: 'npl_coverage',
      label: 'NPL Coverage Ratio',
      category: 'BANKING',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Provisions / Gross NPL',
      isAvailable: false,
      missingReason: 'Provisioning or Gross NPL data not reported',
      inputFacts: []
    };
  }

  // 5. Cost of Risk
  let costOfRisk: MetricCalculationResult;
  if (prov !== undefined && loans !== undefined && loans > 0) {
    const cor = (prov / loans) * 100;
    costOfRisk = {
      metricName: 'cost_of_risk',
      label: 'Cost of Risk (CoR)',
      category: 'BANKING',
      value: cor,
      formattedValue: formatPercent(cor, 2),
      unit: '%',
      formula: 'Annual Loan Impairment Charges / Average Customer Loans',
      isAvailable: true,
      inputFacts: [
        { name: 'Impairment Charge', value: prov, formatted: formatKES(prov, { compact: true }) },
        { name: 'Loans Book', value: loans, formatted: formatKES(loans, { compact: true }) }
      ]
    };
  } else {
    costOfRisk = {
      metricName: 'cost_of_risk',
      label: 'Cost of Risk',
      category: 'BANKING',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Impairment Charge / Average Loans',
      isAvailable: false,
      missingReason: 'Impairment charges fact not isolated',
      inputFacts: []
    };
  }

  // 6. Tier 1 Capital Adequacy
  const tier1 = getFact('capital_adequacy_tier1')?.value;
  let tier1CapitalAdequacy: MetricCalculationResult;
  if (tier1 !== undefined) {
    tier1CapitalAdequacy = {
      metricName: 'capital_adequacy_tier1',
      label: 'Core Capital / TRWA (Tier 1)',
      category: 'BANKING',
      value: tier1,
      formattedValue: formatPercent(tier1, 1),
      unit: '%',
      formula: 'Core Capital / Total Risk-Weighted Assets',
      isAvailable: true,
      benchmark: 'CBK Statutory Minimum: 10.5%',
      inputFacts: [{ name: 'Reported Tier 1 CAR', value: tier1, formatted: `${tier1}%` }],
      interpretation: tier1 >= 10.5 ? `Surplus of +${(tier1 - 10.5).toFixed(1)}% above CBK minimum` : 'Breach of CBK minimum'
    };
  } else {
    tier1CapitalAdequacy = {
      metricName: 'capital_adequacy_tier1',
      label: 'Tier 1 Capital Adequacy',
      category: 'BANKING',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Core Capital / TRWA',
      isAvailable: false,
      missingReason: 'Regulatory CAR disclosure not extracted for this period',
      inputFacts: []
    };
  }

  // 7. Total Capital Adequacy
  const totalCar = getFact('capital_adequacy_total')?.value;
  let totalCapitalAdequacy: MetricCalculationResult;
  if (totalCar !== undefined) {
    totalCapitalAdequacy = {
      metricName: 'capital_adequacy_total',
      label: 'Total Capital / TRWA',
      category: 'BANKING',
      value: totalCar,
      formattedValue: formatPercent(totalCar, 1),
      unit: '%',
      formula: 'Total Regulatory Capital / Total Risk-Weighted Assets',
      isAvailable: true,
      benchmark: 'CBK Statutory Minimum: 14.5%',
      inputFacts: [{ name: 'Reported Total CAR', value: totalCar, formatted: `${totalCar}%` }],
      interpretation: totalCar >= 14.5 ? `Buffer of +${(totalCar - 14.5).toFixed(1)}% above statutory requirement` : 'Below requirement'
    };
  } else {
    totalCapitalAdequacy = {
      metricName: 'capital_adequacy_total',
      label: 'Total Capital Adequacy',
      category: 'BANKING',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Total Capital / TRWA',
      isAvailable: false,
      missingReason: 'Total CAR disclosure not available',
      inputFacts: []
    };
  }

  // 8. Statutory Liquidity Ratio
  const liq = getFact('statutory_liquidity_ratio')?.value;
  let statutoryLiquidityRatio: MetricCalculationResult;
  if (liq !== undefined) {
    statutoryLiquidityRatio = {
      metricName: 'statutory_liquidity_ratio',
      label: 'Statutory Liquidity Ratio',
      category: 'BANKING',
      value: liq,
      formattedValue: formatPercent(liq, 1),
      unit: '%',
      formula: 'Liquid Assets / Total Deposit Liabilities',
      isAvailable: true,
      benchmark: 'CBK Statutory Minimum: 20.0%',
      inputFacts: [{ name: 'Reported Liquidity Ratio', value: liq, formatted: `${liq}%` }],
      interpretation: `Substantial buffer of +${(liq - 20.0).toFixed(1)}% above CBK minimum 20.0%`
    };
  } else {
    statutoryLiquidityRatio = {
      metricName: 'statutory_liquidity_ratio',
      label: 'Statutory Liquidity Ratio',
      category: 'BANKING',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Liquid Assets / Deposits',
      isAvailable: false,
      missingReason: 'Statutory liquidity ratio note not available for this period',
      inputFacts: []
    };
  }

  // 9. Net Interest Margin (NIM)
  const nii = getFact('net_interest_income')?.value;
  const assets = getFact('total_assets')?.value;
  let netInterestMargin: MetricCalculationResult;
  if (nii !== undefined && assets !== undefined && assets > 0) {
    const nim = (nii / (assets * 0.85)) * 100; // Average earning assets ~85% of total assets
    netInterestMargin = {
      metricName: 'net_interest_margin',
      label: 'Net Interest Margin (NIM)',
      category: 'BANKING',
      value: nim,
      formattedValue: formatPercent(nim, 2),
      unit: '%',
      formula: 'Net Interest Income / Average Earning Assets',
      isAvailable: true,
      benchmark: 'Kenyan banking sector average is ~7.0%',
      inputFacts: [
        { name: 'Net Interest Income', value: nii, formatted: formatKES(nii, { compact: true }) },
        { name: 'Total Assets', value: assets, formatted: formatKES(assets, { compact: true }) }
      ]
    };
  } else {
    netInterestMargin = {
      metricName: 'net_interest_margin',
      label: 'Net Interest Margin (NIM)',
      category: 'BANKING',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Net Interest Income / Earning Assets',
      isAvailable: false,
      missingReason: 'Net interest income or earning assets missing',
      inputFacts: []
    };
  }

  // 10. Cost to Income Ratio (CIR)
  const totalRev = getFact('revenue')?.value;
  const ebit = getFact('operating_income')?.value;
  let costToIncomeRatio: MetricCalculationResult;
  if (totalRev !== undefined && ebit !== undefined && totalRev > 0) {
    const opex = totalRev - ebit;
    const cir = (opex / totalRev) * 100;
    costToIncomeRatio = {
      metricName: 'cost_to_income_ratio',
      label: 'Cost-to-Income Ratio (CIR)',
      category: 'BANKING',
      value: cir,
      formattedValue: formatPercent(cir, 2),
      unit: '%',
      formula: 'Operating Expenses / Total Operating Income',
      isAvailable: true,
      benchmark: 'Optimal target < 50%',
      inputFacts: [
        { name: 'Estimated Operating Expenses', value: opex, formatted: formatKES(opex, { compact: true }) },
        { name: 'Operating Income', value: totalRev, formatted: formatKES(totalRev, { compact: true }) }
      ],
      interpretation: cir < 50 ? 'Efficient cost structure' : 'Higher cost-to-income relative to regional peers'
    };
  } else {
    costToIncomeRatio = {
      metricName: 'cost_to_income_ratio',
      label: 'Cost-to-Income Ratio (CIR)',
      category: 'BANKING',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Operating Expenses / Total Income',
      isAvailable: false,
      missingReason: 'Operating expenses or total operating income missing',
      inputFacts: []
    };
  }

  return {
    loanGrowth,
    depositGrowth,
    nplRatio,
    nplCoverage,
    costOfRisk,
    tier1CapitalAdequacy,
    totalCapitalAdequacy,
    statutoryLiquidityRatio,
    netInterestMargin,
    costToIncomeRatio
  };
}
