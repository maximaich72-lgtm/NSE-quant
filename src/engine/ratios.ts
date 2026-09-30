import { FinancialFact, MetricCalculationResult, Company } from '../types/financial';
import { formatPercent, formatMultiple, formatKES, formatNumber } from './formatters';

export function calculateCompanyRatios(
  factsForYear: FinancialFact[],
  factsForPriorYear: FinancialFact[] | null,
  factsForBaseYear: FinancialFact[] | null,
  company: Company,
  year: number
): Record<string, MetricCalculationResult> {
  const getFact = (name: string): FinancialFact | undefined =>
    factsForYear.find(f => f.metricName === name);

  const getPriorFact = (name: string): FinancialFact | undefined =>
    factsForPriorYear ? factsForPriorYear.find(f => f.metricName === name) : undefined;

  const getBaseFact = (name: string): FinancialFact | undefined =>
    factsForBaseYear ? factsForBaseYear.find(f => f.metricName === name) : undefined;

  const results: Record<string, MetricCalculationResult> = {};

  // 1. Revenue Growth
  const rev = getFact('revenue')?.value;
  const priorRev = getPriorFact('revenue')?.value;
  if (rev !== undefined && priorRev !== undefined && priorRev !== 0) {
    const growth = ((rev - priorRev) / Math.abs(priorRev)) * 100;
    results['revenue_growth'] = {
      metricName: 'revenue_growth',
      label: 'Revenue Growth (YoY)',
      category: 'GROWTH',
      value: growth,
      formattedValue: formatPercent(growth, 2, true),
      unit: '%',
      formula: '(Revenue_t - Revenue_{t-1}) / Revenue_{t-1}',
      isAvailable: true,
      inputFacts: [
        { name: `FY${year} Revenue`, value: rev, formatted: formatKES(rev, { compact: true }) },
        { name: `FY${year - 1} Revenue`, value: priorRev, formatted: formatKES(priorRev, { compact: true }) }
      ],
      interpretation: growth > 10 ? 'Strong double-digit top-line expansion' : growth > 0 ? 'Modest revenue growth' : 'Top-line contraction'
    };
  } else {
    results['revenue_growth'] = {
      metricName: 'revenue_growth',
      label: 'Revenue Growth (YoY)',
      category: 'GROWTH',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: '(Revenue_t - Revenue_{t-1}) / Revenue_{t-1}',
      isAvailable: false,
      missingReason: priorRev === undefined ? `Missing verified Revenue fact for prior fiscal period (FY${year - 1})` : 'Missing current revenue fact',
      inputFacts: []
    };
  }

  // 2. Revenue CAGR (5-Year or Period CAGR)
  const baseRev = getBaseFact('revenue')?.value;
  const baseYear = factsForBaseYear ? factsForBaseYear[0]?.fiscalYear : undefined;
  if (rev !== undefined && baseRev !== undefined && baseRev > 0 && baseYear && year > baseYear) {
    const periods = year - baseYear;
    const cagr = (Math.pow(rev / baseRev, 1 / periods) - 1) * 100;
    results['revenue_cagr'] = {
      metricName: 'revenue_cagr',
      label: `${periods}-Year Revenue CAGR`,
      category: 'GROWTH',
      value: cagr,
      formattedValue: formatPercent(cagr, 2, true),
      unit: '%',
      formula: `(Revenue_${year} / Revenue_${baseYear})^(1/${periods}) - 1`,
      isAvailable: true,
      inputFacts: [
        { name: `FY${year} Revenue`, value: rev, formatted: formatKES(rev, { compact: true }) },
        { name: `FY${baseYear} Revenue`, value: baseRev, formatted: formatKES(baseRev, { compact: true }) }
      ]
    };
  } else {
    results['revenue_cagr'] = {
      metricName: 'revenue_cagr',
      label: 'Revenue CAGR',
      category: 'GROWTH',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: '(Revenue_t / Revenue_0)^(1/n) - 1',
      isAvailable: false,
      missingReason: 'Insufficient multi-year chronological facts to compute multi-year CAGR',
      inputFacts: []
    };
  }

  // 3. Operating Margin
  const ebit = getFact('operating_income')?.value;
  if (ebit !== undefined && rev !== undefined && rev !== 0) {
    const opMargin = (ebit / rev) * 100;
    results['operating_margin'] = {
      metricName: 'operating_margin',
      label: 'Operating Margin (EBIT Margin)',
      category: 'PROFITABILITY',
      value: opMargin,
      formattedValue: formatPercent(opMargin, 2),
      unit: '%',
      formula: 'Operating Income / Revenue',
      isAvailable: true,
      inputFacts: [
        { name: 'Operating Income (EBIT)', value: ebit, formatted: formatKES(ebit, { compact: true }) },
        { name: 'Revenue', value: rev, formatted: formatKES(rev, { compact: true }) }
      ]
    };
  } else {
    results['operating_margin'] = {
      metricName: 'operating_margin',
      label: 'Operating Margin',
      category: 'PROFITABILITY',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Operating Income / Revenue',
      isAvailable: false,
      missingReason: ebit === undefined ? 'Operating Income fact not reported for this period' : 'Revenue fact missing',
      inputFacts: []
    };
  }

  // 4. Net Margin
  const ni = getFact('net_income')?.value;
  if (ni !== undefined && rev !== undefined && rev !== 0) {
    const netMargin = (ni / rev) * 100;
    results['net_margin'] = {
      metricName: 'net_margin',
      label: 'Net Profit Margin',
      category: 'PROFITABILITY',
      value: netMargin,
      formattedValue: formatPercent(netMargin, 2),
      unit: '%',
      formula: 'Net Income / Revenue',
      isAvailable: true,
      inputFacts: [
        { name: 'Net Income', value: ni, formatted: formatKES(ni, { compact: true }) },
        { name: 'Revenue', value: rev, formatted: formatKES(rev, { compact: true }) }
      ]
    };
  } else {
    results['net_margin'] = {
      metricName: 'net_margin',
      label: 'Net Profit Margin',
      category: 'PROFITABILITY',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Net Income / Revenue',
      isAvailable: false,
      missingReason: 'Required input Net Income or Revenue missing',
      inputFacts: []
    };
  }

  // 5. Return on Equity (ROE)
  const equity = getFact('shareholders_equity')?.value;
  const priorEquity = getPriorFact('shareholders_equity')?.value;
  const avgEquity = priorEquity ? (equity! + priorEquity) / 2 : equity;
  if (ni !== undefined && avgEquity !== undefined && avgEquity !== 0) {
    const roe = (ni / avgEquity) * 100;
    results['roe'] = {
      metricName: 'roe',
      label: 'Return on Equity (ROE)',
      category: 'PROFITABILITY',
      value: roe,
      formattedValue: formatPercent(roe, 2),
      unit: '%',
      formula: priorEquity ? 'Net Income / Average Shareholders’ Equity' : 'Net Income / Period-End Shareholders’ Equity',
      isAvailable: true,
      inputFacts: [
        { name: 'Net Income', value: ni, formatted: formatKES(ni, { compact: true }) },
        { name: priorEquity ? 'Average Equity' : 'Period-End Equity', value: avgEquity, formatted: formatKES(avgEquity, { compact: true }) }
      ],
      benchmark: '> 18% is top-tier for NSE equities'
    };
  } else {
    results['roe'] = {
      metricName: 'roe',
      label: 'Return on Equity (ROE)',
      category: 'PROFITABILITY',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Net Income / Shareholders’ Equity',
      isAvailable: false,
      missingReason: equity === undefined ? 'Shareholders’ Equity fact not available' : 'Net Income fact missing',
      inputFacts: []
    };
  }

  // 6. Return on Assets (ROA)
  const assets = getFact('total_assets')?.value;
  const priorAssets = getPriorFact('total_assets')?.value;
  const avgAssets = priorAssets ? (assets! + priorAssets) / 2 : assets;
  if (ni !== undefined && avgAssets !== undefined && avgAssets !== 0) {
    const roa = (ni / avgAssets) * 100;
    results['roa'] = {
      metricName: 'roa',
      label: 'Return on Assets (ROA)',
      category: 'PROFITABILITY',
      value: roa,
      formattedValue: formatPercent(roa, 2),
      unit: '%',
      formula: priorAssets ? 'Net Income / Average Total Assets' : 'Net Income / Period-End Total Assets',
      isAvailable: true,
      inputFacts: [
        { name: 'Net Income', value: ni, formatted: formatKES(ni, { compact: true }) },
        { name: priorAssets ? 'Average Assets' : 'Period-End Assets', value: avgAssets, formatted: formatKES(avgAssets, { compact: true }) }
      ],
      benchmark: company.companyType === 'BANK' ? '> 2.5% is strong for banking' : '> 8.0% for commercial'
    };
  } else {
    results['roa'] = {
      metricName: 'roa',
      label: 'Return on Assets (ROA)',
      category: 'PROFITABILITY',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Net Income / Total Assets',
      isAvailable: false,
      missingReason: assets === undefined ? 'Total Assets fact not available' : 'Net Income missing',
      inputFacts: []
    };
  }

  // 7. Debt / Equity
  const totalDebt = getFact('total_debt')?.value;
  if (totalDebt !== undefined && equity !== undefined && equity !== 0) {
    const deRatio = totalDebt / equity;
    results['debt_to_equity'] = {
      metricName: 'debt_to_equity',
      label: 'Debt to Equity Ratio',
      category: 'LEVERAGE',
      value: deRatio,
      formattedValue: formatMultiple(deRatio, 2),
      unit: 'x',
      formula: 'Total Debt / Shareholders’ Equity',
      isAvailable: true,
      inputFacts: [
        { name: 'Total Debt', value: totalDebt, formatted: formatKES(totalDebt, { compact: true }) },
        { name: 'Shareholders’ Equity', value: equity, formatted: formatKES(equity, { compact: true }) }
      ]
    };
  } else {
    results['debt_to_equity'] = {
      metricName: 'debt_to_equity',
      label: 'Debt to Equity Ratio',
      category: 'LEVERAGE',
      value: null,
      formattedValue: 'N/A',
      unit: 'x',
      formula: 'Total Debt / Shareholders’ Equity',
      isAvailable: false,
      missingReason: totalDebt === undefined ? 'Total Debt fact not reported separately' : 'Shareholders’ Equity missing',
      inputFacts: []
    };
  }

  // 8. Debt / Assets
  if (totalDebt !== undefined && assets !== undefined && assets !== 0) {
    const daRatio = totalDebt / assets;
    results['debt_to_assets'] = {
      metricName: 'debt_to_assets',
      label: 'Debt to Total Assets',
      category: 'LEVERAGE',
      value: daRatio,
      formattedValue: formatPercent(daRatio * 100, 2),
      unit: '%',
      formula: 'Total Debt / Total Assets',
      isAvailable: true,
      inputFacts: [
        { name: 'Total Debt', value: totalDebt, formatted: formatKES(totalDebt, { compact: true }) },
        { name: 'Total Assets', value: assets, formatted: formatKES(assets, { compact: true }) }
      ]
    };
  } else {
    results['debt_to_assets'] = {
      metricName: 'debt_to_assets',
      label: 'Debt to Total Assets',
      category: 'LEVERAGE',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Total Debt / Total Assets',
      isAvailable: false,
      missingReason: 'Total Debt or Total Assets fact missing',
      inputFacts: []
    };
  }

  // 9. Current Ratio
  if (company.companyType === 'BANK') {
    results['current_ratio'] = {
      metricName: 'current_ratio',
      label: 'Current Ratio (Working Capital)',
      category: 'LIQUIDITY',
      value: null,
      formattedValue: 'N/A (Bank)',
      unit: 'x',
      formula: 'Current Assets / Current Liabilities',
      isAvailable: false,
      missingReason: 'Non-applicable for commercial banks (Banking liquidity is measured via Statutory Liquidity Ratio under CBK Prudential Guidelines)',
      inputFacts: []
    };
  } else {
    const currAssets = getFact('current_assets')?.value;
    const currLiab = getFact('current_liabilities')?.value;
    if (currAssets !== undefined && currLiab !== undefined && currLiab !== 0) {
      const cr = currAssets / currLiab;
      results['current_ratio'] = {
        metricName: 'current_ratio',
        label: 'Current Ratio',
        category: 'LIQUIDITY',
        value: cr,
        formattedValue: formatMultiple(cr, 2),
        unit: 'x',
        formula: 'Current Assets / Current Liabilities',
        isAvailable: true,
        inputFacts: [
          { name: 'Current Assets', value: currAssets, formatted: formatKES(currAssets, { compact: true }) },
          { name: 'Current Liabilities', value: currLiab, formatted: formatKES(currLiab, { compact: true }) }
        ]
      };
    } else {
      results['current_ratio'] = {
        metricName: 'current_ratio',
        label: 'Current Ratio',
        category: 'LIQUIDITY',
        value: null,
        formattedValue: 'N/A',
        unit: 'x',
        formula: 'Current Assets / Current Liabilities',
        isAvailable: false,
        missingReason: 'Current Assets or Current Liabilities not broken out in source filing',
        inputFacts: []
      };
    }
  }

  // 10. Asset Turnover
  if (rev !== undefined && avgAssets !== undefined && avgAssets !== 0) {
    const turnover = rev / avgAssets;
    results['asset_turnover'] = {
      metricName: 'asset_turnover',
      label: 'Asset Turnover',
      category: 'EFFICIENCY',
      value: turnover,
      formattedValue: formatMultiple(turnover, 2),
      unit: 'x',
      formula: 'Revenue / Average Total Assets',
      isAvailable: true,
      inputFacts: [
        { name: 'Revenue', value: rev, formatted: formatKES(rev, { compact: true }) },
        { name: 'Assets', value: avgAssets, formatted: formatKES(avgAssets, { compact: true }) }
      ]
    };
  } else {
    results['asset_turnover'] = {
      metricName: 'asset_turnover',
      label: 'Asset Turnover',
      category: 'EFFICIENCY',
      value: null,
      formattedValue: 'N/A',
      unit: 'x',
      formula: 'Revenue / Total Assets',
      isAvailable: false,
      missingReason: 'Revenue or Total Assets missing',
      inputFacts: []
    };
  }

  // 11. Free Cash Flow
  const ocf = getFact('operating_cash_flow')?.value;
  const capex = getFact('capital_expenditure')?.value;
  const reportedFcf = getFact('free_cash_flow')?.value;
  if (reportedFcf !== undefined) {
    results['free_cash_flow'] = {
      metricName: 'free_cash_flow',
      label: 'Free Cash Flow (FCF)',
      category: 'LIQUIDITY',
      value: reportedFcf,
      formattedValue: formatKES(reportedFcf, { compact: true }),
      unit: 'KES',
      formula: 'Operating Cash Flow - Capital Expenditure',
      isAvailable: true,
      inputFacts: [
        { name: 'Operating Cash Flow', value: ocf ?? null, formatted: formatKES(ocf, { compact: true }) },
        { name: 'Capital Expenditure', value: capex ?? null, formatted: formatKES(capex, { compact: true }) }
      ]
    };
  } else if (ocf !== undefined && capex !== undefined) {
    const fcf = ocf - capex;
    results['free_cash_flow'] = {
      metricName: 'free_cash_flow',
      label: 'Free Cash Flow (FCF)',
      category: 'LIQUIDITY',
      value: fcf,
      formattedValue: formatKES(fcf, { compact: true }),
      unit: 'KES',
      formula: 'Operating Cash Flow - Capital Expenditure',
      isAvailable: true,
      inputFacts: [
        { name: 'Operating Cash Flow', value: ocf, formatted: formatKES(ocf, { compact: true }) },
        { name: 'Capital Expenditure', value: capex, formatted: formatKES(capex, { compact: true }) }
      ]
    };
  } else {
    results['free_cash_flow'] = {
      metricName: 'free_cash_flow',
      label: 'Free Cash Flow (FCF)',
      category: 'LIQUIDITY',
      value: null,
      formattedValue: 'N/A',
      unit: 'KES',
      formula: 'Operating Cash Flow - Capex',
      isAvailable: false,
      missingReason: company.companyType === 'BANK' ? 'FCF is non-standard for banks due to customer deposit cash swings; see regulatory liquidity' : 'Operating Cash Flow or Capex not reported',
      inputFacts: []
    };
  }

  // 12. Earnings Per Share (EPS)
  const shares = getFact('shares_outstanding')?.value || company.sharesOutstanding;
  if (ni !== undefined && shares) {
    const eps = ni / shares;
    results['eps'] = {
      metricName: 'eps',
      label: 'Earnings Per Share (EPS)',
      category: 'VALUATION',
      value: eps,
      formattedValue: `KES ${eps.toFixed(2)}`,
      unit: 'KES',
      formula: 'Net Income / Diluted Shares Outstanding',
      isAvailable: true,
      inputFacts: [
        { name: 'Net Income', value: ni, formatted: formatKES(ni, { compact: true }) },
        { name: 'Shares in Issue', value: shares, formatted: formatNumber(shares, 0) }
      ]
    };
  } else {
    results['eps'] = {
      metricName: 'eps',
      label: 'Earnings Per Share (EPS)',
      category: 'VALUATION',
      value: null,
      formattedValue: 'N/A',
      unit: 'KES',
      formula: 'Net Income / Shares Outstanding',
      isAvailable: false,
      missingReason: 'Net Income or Shares in Issue unavailable',
      inputFacts: []
    };
  }

  // 13. Dividend Yield
  const dps = getFact('dividend_per_share')?.value;
  const price = company.currentPrice;
  if (dps !== undefined && price && price > 0) {
    const dy = (dps / price) * 100;
    results['dividend_yield'] = {
      metricName: 'dividend_yield',
      label: 'Dividend Yield',
      category: 'VALUATION',
      value: dy,
      formattedValue: formatPercent(dy, 2),
      unit: '%',
      formula: 'Annual Dividend Per Share / Market Price',
      isAvailable: true,
      inputFacts: [
        { name: 'Dividend Per Share (DPS)', value: dps, formatted: `KES ${dps.toFixed(2)}` },
        { name: 'Current Market Price', value: price, formatted: `KES ${price.toFixed(2)}` }
      ]
    };
  } else {
    results['dividend_yield'] = {
      metricName: 'dividend_yield',
      label: 'Dividend Yield',
      category: 'VALUATION',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'Dividend Per Share / Market Price',
      isAvailable: false,
      missingReason: dps === undefined ? 'No dividend declared or DPS fact not reported' : 'Market price missing',
      inputFacts: []
    };
  }

  return results;
}
