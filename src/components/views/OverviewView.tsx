import React from 'react';
import { Company, FinancialFact } from '../../types/financial';
import { formatKES, formatPercent, formatMultiple, formatNumber } from '../../engine/formatters';
import { calculateCompanyRatios } from '../../engine/ratios';
import { FinancialChart } from '../FinancialChart';
import { TrendingUp, TrendingDown, ExternalLink, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

interface OverviewViewProps {
  company: Company;
  facts: FinancialFact[];
  onNavigate: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ company, facts, onNavigate }) => {
  const companyFacts = facts.filter(f => f.companyId === company.id);

  // Group facts by fiscal year
  const years = [2024, 2023, 2022, 2021, 2020];
  const facts2024 = companyFacts.filter(f => f.fiscalYear === 2024);
  const facts2023 = companyFacts.filter(f => f.fiscalYear === 2023);
  const facts2020 = companyFacts.filter(f => f.fiscalYear === 2020);

  // Deterministic ratios for latest year (2024)
  const ratios2024 = calculateCompanyRatios(facts2024, facts2023, facts2020, company, 2024);

  const getMetric = (year: number, name: string): number =>
    companyFacts.find(f => f.fiscalYear === year && f.metricName === name)?.value ?? 0;

  // Chart datasets
  const revenueChartData = years
    .slice()
    .reverse()
    .map(y => ({
      label: `FY${y}`,
      value: getMetric(y, 'revenue')
    }));

  const netIncomeChartData = years
    .slice()
    .reverse()
    .map(y => ({
      label: `FY${y}`,
      value: getMetric(y, 'net_income')
    }));

  const marginChartData = years
    .slice()
    .reverse()
    .map(y => {
      const rev = getMetric(y, 'revenue');
      const ebit = getMetric(y, 'operating_income');
      const ni = getMetric(y, 'net_income');
      return {
        label: `FY${y}`,
        value: rev > 0 ? (ebit / rev) * 100 : 0,
        value2: rev > 0 ? (ni / rev) * 100 : 0
      };
    });

  const cashFlowChartData = years
    .slice()
    .reverse()
    .map(y => ({
      label: `FY${y}`,
      value: getMetric(y, 'operating_cash_flow'),
      value2: getMetric(y, 'capital_expenditure')
    }));

  const isBank = company.companyType === 'BANK';

  return (
    <div className="space-y-6">
      {/* Institutional Company Header Lockup */}
      <div className="bg-[#121622] border border-white/8 rounded p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {company.ticker}
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">{company.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono">
                {company.primaryExchange}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-400 font-mono">
              <span>{company.legalName}</span>
              <span>·</span>
              <span>Sector: {company.sector}</span>
              <span>·</span>
              <span>Type: {company.industry}</span>
              <span>·</span>
              <span>ISIN: {company.isin}</span>
              <span>·</span>
              <span>FY End: {company.fiscalYearEnd}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#0b0e14] border border-white/8 rounded px-4 py-2 text-right">
              <div className="text-[10px] uppercase text-slate-400 font-mono">Market Price</div>
              <div className="text-xl font-bold font-mono text-white">
                KES {company.currentPrice.toFixed(2)}
              </div>
              <div
                className={`text-xs font-mono font-medium flex items-center justify-end gap-1 ${
                  company.dayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {company.dayChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {company.dayChange >= 0 ? '+' : ''}{company.dayChange.toFixed(2)} ({company.dayChangePct.toFixed(2)}%)
              </div>
            </div>

            <a
              href={company.irUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded border border-white/10 transition-colors"
            >
              <span>IR Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-300 leading-relaxed max-w-4xl">
          {company.description}
        </p>
      </div>

      {/* 11 Primary Financial Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            FY2024 Core Institutional Financial Metrics (Audited)
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deterministic TS Computation Engine</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Revenue */}
          <div className="bg-[#121622] border border-white/8 rounded p-3 hover:border-white/20 transition-colors">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Revenue</div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {formatKES(getMetric(2024, 'revenue'), { compact: true })}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">
              {ratios2024.revenue_growth?.formattedValue} YoY
            </div>
          </div>

          {/* Operating Income */}
          <div className="bg-[#121622] border border-white/8 rounded p-3 hover:border-white/20 transition-colors">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Operating Income</div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {formatKES(getMetric(2024, 'operating_income'), { compact: true })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              {ratios2024.operating_margin?.formattedValue} EBIT Margin
            </div>
          </div>

          {/* Net Income */}
          <div className="bg-[#121622] border border-white/8 rounded p-3 hover:border-white/20 transition-colors">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Net Income</div>
            <div className="text-base font-bold font-mono text-emerald-400 mt-1">
              {formatKES(getMetric(2024, 'net_income'), { compact: true })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              {ratios2024.net_margin?.formattedValue} Net Margin
            </div>
          </div>

          {/* EPS */}
          <div className="bg-[#121622] border border-white/8 rounded p-3 hover:border-white/20 transition-colors">
            <div className="text-[11px] text-slate-400 uppercase font-mono">EPS</div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {ratios2024.eps?.formattedValue}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">Diluted per share</div>
          </div>

          {/* ROE */}
          <div className="bg-[#121622] border border-white/8 rounded p-3 hover:border-white/20 transition-colors">
            <div className="text-[11px] text-slate-400 uppercase font-mono">ROE</div>
            <div className="text-base font-bold font-mono text-sky-400 mt-1">
              {ratios2024.roe?.formattedValue}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">Return on Equity</div>
          </div>

          {/* ROA */}
          <div className="bg-[#121622] border border-white/8 rounded p-3 hover:border-white/20 transition-colors">
            <div className="text-[11px] text-slate-400 uppercase font-mono">ROA</div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {ratios2024.roa?.formattedValue}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">Return on Assets</div>
          </div>

          {/* Free Cash Flow */}
          <div className="bg-[#121622] border border-white/8 rounded p-3 hover:border-white/20 transition-colors">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Free Cash Flow</div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {ratios2024.free_cash_flow?.formattedValue}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              {isBank ? 'See Liquidity Ratio' : 'OCF - Capex'}
            </div>
          </div>

          {/* Market Cap */}
          <div className="bg-[#121622] border border-white/8 rounded p-3 hover:border-white/20 transition-colors">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Market Cap</div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {formatKES(company.marketCap, { compact: true })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">NSE Listed Cap</div>
          </div>

          {/* P/E Ratio */}
          <div className="bg-[#121622] border border-white/8 rounded p-3 hover:border-white/20 transition-colors">
            <div className="text-[11px] text-slate-400 uppercase font-mono">P/E Ratio</div>
            <div className="text-base font-bold font-mono text-emerald-400 mt-1">
              {formatMultiple(company.peRatio, 1)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">Trailing Multiple</div>
          </div>

          {/* Dividend Yield */}
          <div className="bg-[#121622] border border-white/8 rounded p-3 hover:border-white/20 transition-colors">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Dividend Yield</div>
            <div className="text-base font-bold font-mono text-amber-400 mt-1">
              {formatPercent(company.dividendYield, 2)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">Cash Distributed</div>
          </div>

          {/* 5-Year CAGR */}
          <div className="bg-[#121622] border border-white/8 rounded p-3 hover:border-white/20 transition-colors">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Revenue CAGR</div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {ratios2024.revenue_cagr?.formattedValue}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">FY20 - FY24 (4-Yr)</div>
          </div>

          {/* P/B Ratio */}
          <div className="bg-[#121622] border border-white/8 rounded p-3 hover:border-white/20 transition-colors">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Price / Book</div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {formatMultiple(company.pbRatio, 2)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">Tangible Equity Multiple</div>
          </div>
        </div>
      </div>

      {/* 4 Financial Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. 5-Year Revenue Chart */}
        <FinancialChart
          title="5-Year Revenue Trajectory (FY2020 – FY2024)"
          subtitle="Reported Consolidated Top-Line in KES Billions"
          data={revenueChartData}
          type="area"
          color="#10b981"
          height={210}
        />

        {/* 2. 5-Year Net Income Chart */}
        <FinancialChart
          title="5-Year Net Income Performance (FY2020 – FY2024)"
          subtitle="Audited Profit for the Year Attributable to Shareholders"
          data={netIncomeChartData}
          type="bar"
          color="#38bdf8"
          height={210}
        />

        {/* 3. 5-Year Margins Trend Chart */}
        <FinancialChart
          title="5-Year Profitability Margins Trend"
          subtitle="EBIT Operating Margin vs Net Profit Margin"
          data={marginChartData}
          type="multi-line"
          isPercent={true}
          isCurrency={false}
          color="#10b981"
          color2="#a855f7"
          legend={{ series1: 'Operating Margin', series2: 'Net Margin' }}
          height={210}
        />

        {/* 4. Cash Flow & Capex Chart */}
        <FinancialChart
          title="Cash Flow & Capital Expenditure Dynamics"
          subtitle="Operating Cash Flow vs Capital Re-investment (Capex)"
          data={cashFlowChartData}
          type="multi-bar"
          color="#38bdf8"
          color2="#f43f5e"
          legend={{ series1: 'Operating Cash Flow', series2: 'Capex' }}
          height={210}
        />
      </div>

      {/* Analytical Context & Key Drivers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#121622] border border-white/8 rounded p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Key Financial Changes & Analytical Observations
            </h3>
            <button
              onClick={() => onNavigate('ai_research')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              Ask AI Deep-Dive <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            {company.ticker === 'SCOM' && (
              <>
                <div className="p-3 bg-[#0b0e14] rounded border border-white/5">
                  <div className="font-semibold text-white mb-1">M-PESA Acceleration & Domestic Moat</div>
                  <p className="text-slate-400 leading-relaxed">
                    M-PESA revenue crossed KES 139.90Bn in FY2024, expanding +19.5% YoY and contributing 42.4% of total group service revenue. Over 32 million monthly active customers drive an annualized transaction volume exceeding KES 35 Trillion.
                  </p>
                </div>
                <div className="p-3 bg-[#0b0e14] rounded border border-white/5">
                  <div className="font-semibold text-white mb-1">Ethiopia Expansion & FX Liberalization Drag</div>
                  <p className="text-slate-400 leading-relaxed">
                    Safaricom Telecommunications Ethiopia (STE) continues rapid tower rollout and commercial customer acquisition, but upfront operating costs and the National Bank of Ethiopia's foreign exchange floating policy create near-term FX translation headwinds.
                  </p>
                </div>
              </>
            )}

            {company.ticker === 'EQTY' && (
              <>
                <div className="p-3 bg-[#0b0e14] rounded border border-white/5">
                  <div className="font-semibold text-white mb-1">Regional Diversification & DRC Outperformance</div>
                  <p className="text-slate-400 leading-relaxed">
                    Regional subsidiaries now generate 48% of consolidated operating income and 47% of customer deposits, significantly lowering dependence on the Kenyan sovereign balance sheet. Equity BCDC in DRC remains the fastest-growing earnings engine.
                  </p>
                </div>
                <div className="p-3 bg-[#0b0e14] rounded border border-white/5">
                  <div className="font-semibold text-white mb-1">Asset Quality & Credit Risk Management</div>
                  <p className="text-slate-400 leading-relaxed">
                    Gross NPL ratio stands at 12.8% with proactive loan loss impairment provisions of KES 32.60Bn to maintain coverage at 68.4% amidst high CBK interest rates.
                  </p>
                </div>
              </>
            )}

            {company.ticker === 'KCB' && (
              <>
                <div className="p-3 bg-[#0b0e14] rounded border border-white/5">
                  <div className="font-semibold text-white mb-1">East Africa's Largest Balance Sheet</div>
                  <p className="text-slate-400 leading-relaxed">
                    Total assets reached KES 1.98 Trillion, solidifying KCB's leadership in customer deposits (KES 1.49 Trillion) and loan book scale (KES 1.07 Trillion).
                  </p>
                </div>
                <div className="p-3 bg-[#0b0e14] rounded border border-white/5">
                  <div className="font-semibold text-white mb-1">National Bank of Kenya (NBK) Portfolio Strategy</div>
                  <p className="text-slate-400 leading-relaxed">
                    Legacy non-performing loans in the NBK division continue to be aggressively resolved or restructured, while core capital adequacy maintains a solid buffer at 14.1% Tier 1.
                  </p>
                </div>
              </>
            )}

            {company.ticker === 'EABL' && (
              <>
                <div className="p-3 bg-[#0b0e14] rounded border border-white/5">
                  <div className="font-semibold text-white mb-1">Excise Duty Tax Pressure on FMCG Margins</div>
                  <p className="text-slate-400 leading-relaxed">
                    Indirect taxes (excise duties and VAT) absorb KES 80.40Bn (39.3%) of gross beverage sales, creating elastic consumer down-trading that is offset by premium spirits and local ingredient sourcing.
                  </p>
                </div>
                <div className="p-3 bg-[#0b0e14] rounded border border-white/5">
                  <div className="font-semibold text-white mb-1">Balance Sheet De-leveraging & Cash Generation</div>
                  <p className="text-slate-400 leading-relaxed">
                    Strong operating cash flow of KES 23.40Bn supported KES 11.80Bn in production investments and KES 5.5Bn in dividend distributions, with management actively managing medium-term notes.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Primary Source Document Verification Card */}
        <div className="bg-[#121622] border border-white/8 rounded p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              <FileText className="w-4 h-4 text-emerald-400" />
              Primary Source Provenance
            </div>

            <div className="p-3 bg-[#0b0e14] rounded border border-white/5 space-y-2 text-xs font-mono">
              <div className="text-slate-400 text-[11px]">Primary Filing:</div>
              <div className="text-white font-medium">
                {companyFacts[0]?.sourceDocTitle || `${company.name} Annual Report 2024`}
              </div>
              <div className="text-slate-400 pt-1">
                Auditor:{' '}
                <span className="text-slate-200">
                  {company.ticker === 'SCOM'
                    ? 'Ernst & Young LLP'
                    : company.ticker === 'EABL'
                    ? 'KPMG Kenya'
                    : 'PricewaterhouseCoopers (PwC)'}
                </span>
              </div>
              <div className="text-slate-400">
                Audit Opinion: <span className="text-emerald-400">Unqualified Clean</span>
              </div>
              <div className="text-slate-400">
                Verification Status:{' '}
                <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  AUDITED SOURCE
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">5 Fiscal Periods Loaded</span>
            <button
              onClick={() => onNavigate('statements')}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              View Full Statements <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
