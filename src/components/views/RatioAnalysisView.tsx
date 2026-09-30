import React, { useState } from 'react';
import { Company, FinancialFact, MetricCalculationResult } from '../../types/financial';
import { calculateCompanyRatios } from '../../engine/ratios';
import { calculateBankMetrics } from '../../engine/bankAnalytics';
import { formatPercent, formatMultiple, formatKES } from '../../engine/formatters';
import { ShieldCheck, Info, Landmark, HelpCircle, AlertCircle, ArrowUpRight } from 'lucide-react';

interface RatioAnalysisViewProps {
  company: Company;
  facts: FinancialFact[];
}

export const RatioAnalysisView: React.FC<RatioAnalysisViewProps> = ({ company, facts }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [activeInspector, setActiveInspector] = useState<MetricCalculationResult | null>(null);

  const companyFacts = facts.filter(f => f.companyId === company.id);
  const years = [2024, 2023, 2022, 2021, 2020];

  const factsForYear = companyFacts.filter(f => f.fiscalYear === selectedYear);
  const factsForPrior = companyFacts.filter(f => f.fiscalYear === selectedYear - 1);
  const factsForBase = companyFacts.filter(f => f.fiscalYear === 2020);

  const ratios = calculateCompanyRatios(
    factsForYear,
    factsForPrior.length > 0 ? factsForPrior : null,
    factsForBase.length > 0 ? factsForBase : null,
    company,
    selectedYear
  );

  const bankMetrics = calculateBankMetrics(
    factsForYear,
    factsForPrior.length > 0 ? factsForPrior : null,
    company,
    selectedYear
  );

  const categories: { title: string; category: string; keys: string[] }[] = [
    {
      title: 'Profitability Ratios',
      category: 'PROFITABILITY',
      keys: ['net_margin', 'operating_margin', 'roe', 'roa']
    },
    {
      title: 'Growth Dynamics',
      category: 'GROWTH',
      keys: ['revenue_growth', 'revenue_cagr']
    },
    {
      title: 'Leverage & Solvency',
      category: 'LEVERAGE',
      keys: ['debt_to_equity', 'debt_to_assets']
    },
    {
      title: 'Liquidity & Cash Flow',
      category: 'LIQUIDITY',
      keys: ['current_ratio', 'free_cash_flow']
    },
    {
      title: 'Operating Efficiency',
      category: 'EFFICIENCY',
      keys: ['asset_turnover']
    },
    {
      title: 'Valuation & Distributions',
      category: 'VALUATION',
      keys: ['eps', 'dividend_yield']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Selector & Explanatory Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121622] border border-white/8 rounded p-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Deterministic Financial Ratio Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict programmatic calculations via validated TypeScript functions using audited source data
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Fiscal Year:</span>
          <div className="flex items-center gap-1 p-1 bg-[#0b0e14] rounded border border-white/5 text-xs font-mono">
            {years.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  selectedYear === y
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                FY{y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bank Specific Analytics Panel (for KCB & Equity) */}
      {company.companyType === 'BANK' && bankMetrics && (
        <div className="bg-[#121624] border border-sky-500/30 rounded p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Commercial Banking Prudential & Credit Analytics (FY{selectedYear})
                </h3>
                <p className="text-xs text-slate-400">
                  Specialized CBK regulatory metrics: Asset quality, capital adequacy & liquidity
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              CBK Prudential Guidelines
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              bankMetrics.nplRatio,
              bankMetrics.nplCoverage,
              bankMetrics.costOfRisk,
              bankMetrics.tier1CapitalAdequacy,
              bankMetrics.totalCapitalAdequacy,
              bankMetrics.statutoryLiquidityRatio,
              bankMetrics.netInterestMargin,
              bankMetrics.costToIncomeRatio,
              bankMetrics.loanGrowth,
              bankMetrics.depositGrowth
            ].map(m => (
              <div
                key={m.metricName}
                onClick={() => setActiveInspector(m)}
                className="bg-[#0b0e14] border border-white/5 rounded p-3 hover:border-sky-500/40 transition-colors cursor-pointer"
              >
                <div className="text-[10px] text-slate-400 uppercase font-mono truncate">{m.label}</div>
                <div className="text-base font-bold font-mono text-white mt-1">
                  {m.formattedValue}
                </div>
                {m.benchmark && (
                  <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                    {m.benchmark}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Ratio Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.title} className="bg-[#121622] border border-white/8 rounded p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  {cat.title}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">FY{selectedYear}</span>
              </div>

              <div className="space-y-3">
                {cat.keys.map(key => {
                  const metric = ratios[key];
                  if (!metric) return null;

                  return (
                    <div
                      key={key}
                      onClick={() => setActiveInspector(metric)}
                      className="p-2.5 rounded bg-[#0b0e14] border border-white/5 hover:border-emerald-500/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300 font-medium group-hover:text-emerald-400 transition-colors">
                          {metric.label}
                        </span>
                        <span
                          className={`font-mono font-bold text-xs tabular-nums ${
                            metric.isAvailable ? 'text-white' : 'text-slate-500 text-[11px]'
                          }`}
                        >
                          {metric.formattedValue}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                        <span className="truncate max-w-[200px]">{metric.formula}</span>
                        <Info className="w-3 h-3 text-slate-400 group-hover:text-slate-200" />
                      </div>

                      {!metric.isAvailable && metric.missingReason && (
                        <div className="mt-1 text-[10px] text-amber-400/90 font-sans flex items-start gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{metric.missingReason}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Metric Mathematical Breakdown Inspector Modal */}
      {activeInspector && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141824] border border-white/15 rounded-lg max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Deterministic Arithmetic Inspector
                </span>
                <h3 className="text-base font-bold text-white mt-1">{activeInspector.label}</h3>
              </div>
              <button
                onClick={() => setActiveInspector(null)}
                className="text-slate-400 hover:text-white p-1 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#0b0e14] p-3.5 rounded border border-white/5 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Calculated Value:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {activeInspector.formattedValue}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Calculation Formula:</span>
                <span className="text-slate-200 font-medium">{activeInspector.formula}</span>
              </div>

              {activeInspector.benchmark && (
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Benchmark Reference:</span>
                  <span className="text-sky-400">{activeInspector.benchmark}</span>
                </div>
              )}

              {activeInspector.inputFacts.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] text-slate-400 mb-1.5">Input Financial Facts Used:</div>
                  <div className="space-y-1">
                    {activeInspector.inputFacts.map((fact, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] bg-white/5 px-2 py-1 rounded">
                        <span className="text-slate-300">{fact.name}:</span>
                        <span className="text-white font-bold">{fact.formatted}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!activeInspector.isAvailable && activeInspector.missingReason && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-300 text-xs font-sans mt-2">
                  <strong>Missing Input Reason:</strong> {activeInspector.missingReason}
                </div>
              )}
            </div>

            {activeInspector.interpretation && (
              <div className="p-3 bg-white/5 rounded border border-white/5 text-xs text-slate-300 font-sans">
                <strong>Analytical Insight:</strong> {activeInspector.interpretation}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveInspector(null)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
