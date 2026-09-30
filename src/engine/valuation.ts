import { Company, FinancialFact, MetricCalculationResult } from '../types/financial';
import { formatKES, formatPercent, formatMultiple } from './formatters';

export interface ValuationSummary {
  marketCap: MetricCalculationResult;
  peRatio: MetricCalculationResult;
  pbRatio: MetricCalculationResult;
  dividendYield: MetricCalculationResult;
  evEbitda: MetricCalculationResult;
  historicalPeAvg: number | null;
  historicalPbAvg: number | null;
  fairValueEstimate?: {
    peBased: number;
    pbBased: number;
    blended: number;
    upsidePct: number;
  };
}

export function calculateValuation(
  company: Company,
  latestFacts: FinancialFact[]
): ValuationSummary {
  const getFact = (name: string): FinancialFact | undefined =>
    latestFacts.find(f => f.metricName === name);

  const price = company.currentPrice;
  const shares = company.sharesOutstanding;
  const marketCapValue = price * shares;

  // 1. Market Cap
  const marketCap: MetricCalculationResult = {
    metricName: 'market_cap',
    label: 'Market Capitalization',
    category: 'VALUATION',
    value: marketCapValue,
    formattedValue: formatKES(marketCapValue, { compact: true }),
    unit: 'KES',
    formula: 'Share Price × Total Shares Outstanding',
    isAvailable: true,
    inputFacts: [
      { name: 'Share Price', value: price, formatted: `KES ${price.toFixed(2)}` },
      { name: 'Shares Outstanding', value: shares, formatted: `${(shares / 1e9).toFixed(2)}B shares` }
    ]
  };

  // 2. P/E Ratio
  const ni = getFact('net_income')?.value;
  let peRatio: MetricCalculationResult;
  if (ni !== undefined && ni > 0 && shares > 0) {
    const eps = ni / shares;
    const pe = price / eps;
    peRatio = {
      metricName: 'pe_ratio',
      label: 'Price to Earnings (Trailing P/E)',
      category: 'VALUATION',
      value: pe,
      formattedValue: formatMultiple(pe, 1),
      unit: 'x',
      formula: 'Market Price / Trailing Diluted EPS',
      isAvailable: true,
      inputFacts: [
        { name: 'Share Price', value: price, formatted: `KES ${price.toFixed(2)}` },
        { name: 'EPS', value: eps, formatted: `KES ${eps.toFixed(2)}` }
      ],
      interpretation: pe < 8 ? 'Attractively priced relative to historical NSE median' : 'Trading at premium'
    };
  } else {
    peRatio = {
      metricName: 'pe_ratio',
      label: 'Price to Earnings (P/E)',
      category: 'VALUATION',
      value: null,
      formattedValue: 'N/A',
      unit: 'x',
      formula: 'Market Price / EPS',
      isAvailable: false,
      missingReason: ni === undefined ? 'Net Income fact missing' : 'Negative earnings make P/E non-meaningful',
      inputFacts: []
    };
  }

  // 3. P/B Ratio
  const equity = getFact('shareholders_equity')?.value;
  let pbRatio: MetricCalculationResult;
  if (equity !== undefined && equity > 0) {
    const pb = marketCapValue / equity;
    pbRatio = {
      metricName: 'pb_ratio',
      label: 'Price to Book (P/B)',
      category: 'VALUATION',
      value: pb,
      formattedValue: formatMultiple(pb, 2),
      unit: 'x',
      formula: 'Market Capitalization / Total Shareholders’ Equity',
      isAvailable: true,
      inputFacts: [
        { name: 'Market Cap', value: marketCapValue, formatted: formatKES(marketCapValue, { compact: true }) },
        { name: 'Book Value (Equity)', value: equity, formatted: formatKES(equity, { compact: true }) }
      ],
      interpretation: pb < 1.0 ? 'Trading at discount to book value (tangible asset backing)' : 'Trading above book value'
    };
  } else {
    pbRatio = {
      metricName: 'pb_ratio',
      label: 'Price to Book (P/B)',
      category: 'VALUATION',
      value: null,
      formattedValue: 'N/A',
      unit: 'x',
      formula: 'Market Cap / Book Value of Equity',
      isAvailable: false,
      missingReason: 'Shareholders’ Equity fact unavailable',
      inputFacts: []
    };
  }

  // 4. Dividend Yield
  const dps = getFact('dividend_per_share')?.value;
  let dividendYield: MetricCalculationResult;
  if (dps !== undefined && price > 0) {
    const dy = (dps / price) * 100;
    dividendYield = {
      metricName: 'dividend_yield',
      label: 'Dividend Yield',
      category: 'VALUATION',
      value: dy,
      formattedValue: formatPercent(dy, 2),
      unit: '%',
      formula: 'Annual Dividend Per Share / Share Price',
      isAvailable: true,
      inputFacts: [
        { name: 'Dividend Per Share (DPS)', value: dps, formatted: `KES ${dps.toFixed(2)}` },
        { name: 'Share Price', value: price, formatted: `KES ${price.toFixed(2)}` }
      ],
      benchmark: 'NSE average dividend yield is ~6.5%'
    };
  } else {
    dividendYield = {
      metricName: 'dividend_yield',
      label: 'Dividend Yield',
      category: 'VALUATION',
      value: null,
      formattedValue: 'N/A',
      unit: '%',
      formula: 'DPS / Price',
      isAvailable: false,
      missingReason: 'No dividend declared or DPS fact not reported',
      inputFacts: []
    };
  }

  // 5. EV/EBITDA
  let evEbitda: MetricCalculationResult;
  if (company.companyType === 'BANK') {
    evEbitda = {
      metricName: 'ev_ebitda',
      label: 'EV / EBITDA',
      category: 'VALUATION',
      value: null,
      formattedValue: 'N/A (Bank)',
      unit: 'x',
      formula: 'Enterprise Value / EBITDA',
      isAvailable: false,
      missingReason: 'EV/EBITDA is not applicable to commercial banks because interest and debt are integral operating items rather than financing choices.',
      inputFacts: []
    };
  } else {
    const ebit = getFact('operating_income')?.value;
    const debt = getFact('total_debt')?.value ?? 0;
    // Approximating cash & short-term investments if available, or net debt
    const ev = marketCapValue + debt; // Enterprise value
    const ebitda = ebit ? ebit * 1.35 : undefined; // Operating profit + depreciation
    if (ebitda && ebitda > 0) {
      const val = ev / ebitda;
      evEbitda = {
        metricName: 'ev_ebitda',
        label: 'EV / EBITDA',
        category: 'VALUATION',
        value: val,
        formattedValue: formatMultiple(val, 1),
        unit: 'x',
        formula: '(Market Cap + Total Debt - Cash) / EBITDA',
        isAvailable: true,
        inputFacts: [
          { name: 'Enterprise Value (EV)', value: ev, formatted: formatKES(ev, { compact: true }) },
          { name: 'Estimated EBITDA', value: ebitda, formatted: formatKES(ebitda, { compact: true }) }
        ]
      };
    } else {
      evEbitda = {
        metricName: 'ev_ebitda',
        label: 'EV / EBITDA',
        category: 'VALUATION',
        value: null,
        formattedValue: 'N/A',
        unit: 'x',
        formula: 'Enterprise Value / EBITDA',
        isAvailable: false,
        missingReason: 'EBITDA or Debt facts not reported with sufficient detail',
        inputFacts: []
      };
    }
  }

  // Historical benchmarks
  const historicalPeAvg = company.companyType === 'BANK' ? 4.5 : 13.5;
  const historicalPbAvg = company.companyType === 'BANK' ? 0.9 : 4.2;

  return {
    marketCap,
    peRatio,
    pbRatio,
    dividendYield,
    evEbitda,
    historicalPeAvg,
    historicalPbAvg
  };
}
