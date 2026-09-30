import React, { useState } from 'react';
import { Company, FinancialFact, ScenarioAssumption } from '../../types/financial';
import { runScenarioModel } from '../../engine/scenarios';
import { formatKES, formatPercent, formatMultiple } from '../../engine/formatters';
import { SlidersHorizontal, RotateCcw, TrendingUp, TrendingDown, ShieldCheck, Zap } from 'lucide-react';

interface ScenarioAnalysisViewProps {
  company: Company;
  facts: FinancialFact[];
}

export const ScenarioAnalysisView: React.FC<ScenarioAnalysisViewProps> = ({ company, facts }) => {
  const latestFacts = facts.filter(f => f.companyId === company.id && f.fiscalYear === 2024);

  const defaultAssumptions: ScenarioAssumption = {
    revenueGrowthChange: 10, // +10%
    operatingMarginChange: 1.5, // +1.5%
    interestExpenseChange: 0,
    taxRateChange: 30, // 30% statutory
    capexChange: 5 // +5%
  };

  const [assumptions, setAssumptions] = useState<ScenarioAssumption>(defaultAssumptions);

  const projections = runScenarioModel(company, latestFacts, assumptions);

  const applyPreset = (preset: 'bull' | 'bear' | 'efficiency' | 'base') => {
    switch (preset) {
      case 'bull':
        setAssumptions({
          revenueGrowthChange: 20,
          operatingMarginChange: 3.0,
          interestExpenseChange: -10,
          taxRateChange: 30,
          capexChange: 15
        });
        break;
      case 'bear':
        setAssumptions({
          revenueGrowthChange: -10,
          operatingMarginChange: -4.0,
          interestExpenseChange: 25,
          taxRateChange: 30,
          capexChange: -20
        });
        break;
      case 'efficiency':
        setAssumptions({
          revenueGrowthChange: 5,
          operatingMarginChange: 4.5,
          interestExpenseChange: -15,
          taxRateChange: 30,
          capexChange: -10
        });
        break;
      case 'base':
        setAssumptions({
          revenueGrowthChange: 0,
          operatingMarginChange: 0,
          interestExpenseChange: 0,
          taxRateChange: 30,
          capexChange: 0
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Presets */}
      <div className="bg-[#121622] border border-white/8 rounded p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Quantitative Scenario & Sensitivity Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Project pro-forma income statement, free cash flow conversion, and implied valuation for {company.name} ({company.ticker}).
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-mono">Macro Presets:</span>
            <button
              onClick={() => applyPreset('bull')}
              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded border border-emerald-500/30 transition-colors cursor-pointer"
            >
              Bull Case (+20% Rev)
            </button>
            <button
              onClick={() => applyPreset('bear')}
              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-mono rounded border border-rose-500/30 transition-colors cursor-pointer"
            >
              Bear Case (-10% Rev)
            </button>
            <button
              onClick={() => applyPreset('efficiency')}
              className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-mono rounded border border-sky-500/30 transition-colors cursor-pointer"
            >
              Cost Optimization
            </button>
            <button
              onClick={() => applyPreset('base')}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-mono rounded border border-white/5 transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sliders for Assumptions */}
        <div className="bg-[#121622] border border-white/8 rounded p-5 space-y-5 lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Model Assumption Parameters
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">Real-time Recalculation</span>
          </div>

          {/* 1. Revenue Growth */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300">Revenue Growth Delta:</span>
              <span className="text-emerald-400 font-bold">
                {assumptions.revenueGrowthChange > 0 ? '+' : ''}{assumptions.revenueGrowthChange}%
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="40"
              step="1"
              value={assumptions.revenueGrowthChange}
              onChange={e =>
                setAssumptions({ ...assumptions, revenueGrowthChange: parseInt(e.target.value) })
              }
              className="w-full accent-emerald-500 h-1.5 bg-[#0b0e14] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>-20% (Contraction)</span>
              <span>0% (Flat)</span>
              <span>+40% (Surge)</span>
            </div>
          </div>

          {/* 2. Operating Margin Change */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300">Operating Margin Shift:</span>
              <span className="text-sky-400 font-bold">
                {assumptions.operatingMarginChange > 0 ? '+' : ''}{assumptions.operatingMarginChange}%
              </span>
            </div>
            <input
              type="range"
              min="-8"
              max="12"
              step="0.5"
              value={assumptions.operatingMarginChange}
              onChange={e =>
                setAssumptions({ ...assumptions, operatingMarginChange: parseFloat(e.target.value) })
              }
              className="w-full accent-sky-500 h-1.5 bg-[#0b0e14] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>-8% (Margin Compression)</span>
              <span>+12% (Expansion)</span>
            </div>
          </div>

          {/* 3. Interest Expense Change */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300">Finance Costs / Debt Service:</span>
              <span className="text-amber-400 font-bold">
                {assumptions.interestExpenseChange > 0 ? '+' : ''}{assumptions.interestExpenseChange}%
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="60"
              step="5"
              value={assumptions.interestExpenseChange}
              onChange={e =>
                setAssumptions({ ...assumptions, interestExpenseChange: parseInt(e.target.value) })
              }
              className="w-full accent-amber-500 h-1.5 bg-[#0b0e14] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>-40% (Rate Cuts)</span>
              <span>+60% (Tightening)</span>
            </div>
          </div>

          {/* 4. Tax Rate Change */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300">Effective Corporate Tax Rate:</span>
              <span className="text-white font-bold">{assumptions.taxRateChange}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="35"
              step="1"
              value={assumptions.taxRateChange}
              onChange={e =>
                setAssumptions({ ...assumptions, taxRateChange: parseInt(e.target.value) })
              }
              className="w-full accent-slate-400 h-1.5 bg-[#0b0e14] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>15% (Concessional)</span>
              <span>30% (Standard KE)</span>
              <span>35%</span>
            </div>
          </div>

          {/* 5. Capex Change */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300">Capital Expenditure Delta:</span>
              <span className="text-purple-400 font-bold">
                {assumptions.capexChange > 0 ? '+' : ''}{assumptions.capexChange}%
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="40"
              step="5"
              value={assumptions.capexChange}
              onChange={e =>
                setAssumptions({ ...assumptions, capexChange: parseInt(e.target.value) })
              }
              className="w-full accent-purple-500 h-1.5 bg-[#0b0e14] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>-30% (Capex Holiday)</span>
              <span>+40% (Expansion Rollout)</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Base vs Scenario Pro-Forma Comparison */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary Implied Impact Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#121622] border border-white/8 rounded p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Scenario Revenue</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {formatKES(projections.scenarioCase.revenue, { compact: true })}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">
                {projections.variance.revenuePct >= 0 ? '+' : ''}{projections.variance.revenuePct.toFixed(1)}% vs Base
              </div>
            </div>

            <div className="bg-[#121622] border border-white/8 rounded p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Scenario Net Income</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {formatKES(projections.scenarioCase.netIncome, { compact: true })}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">
                {projections.variance.netIncomePct >= 0 ? '+' : ''}{projections.variance.netIncomePct.toFixed(1)}% vs Base
              </div>
            </div>

            <div className="bg-[#121622] border border-white/8 rounded p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Scenario Free Cash Flow</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {formatKES(projections.scenarioCase.freeCashFlow, { compact: true })}
              </div>
              <div className="text-[10px] text-sky-400 font-mono">
                {projections.variance.fcfPct >= 0 ? '+' : ''}{projections.variance.fcfPct.toFixed(1)}% vs Base
              </div>
            </div>

            <div className="bg-[#121622] border border-white/8 rounded p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Implied Share Price</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                KES {projections.impliedValuation.scenarioPricePerShare.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Current: KES {company.currentPrice.toFixed(2)} ({projections.impliedValuation.priceDeltaPct >= 0 ? '+' : ''}{projections.impliedValuation.priceDeltaPct.toFixed(1)}%)
              </div>
            </div>
          </div>

          {/* Full Pro-Forma Comparison Table */}
          <div className="bg-[#121622] border border-white/8 rounded overflow-hidden">
            <div className="p-3.5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                Pro-Forma Deterministic Financial Statement Comparison
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Amounts in KES Billions</span>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#0b0e14] text-slate-400 font-mono text-[11px] border-b border-white/5 uppercase">
                  <th className="py-2.5 px-4">Financial Metric</th>
                  <th className="py-2.5 px-4 text-right">Base FY24</th>
                  <th className="py-2.5 px-4 text-right">Scenario Projection</th>
                  <th className="py-2.5 px-4 text-right">Variance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                <tr>
                  <td className="py-2.5 px-4 font-sans text-slate-300 font-medium">Revenue</td>
                  <td className="py-2.5 px-4 text-right">{formatKES(projections.baseCase.revenue, { compact: true })}</td>
                  <td className="py-2.5 px-4 text-right text-white font-bold">{formatKES(projections.scenarioCase.revenue, { compact: true })}</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400">+{projections.variance.revenuePct.toFixed(1)}%</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-4 font-sans text-slate-300 font-medium">Operating Income (EBIT)</td>
                  <td className="py-2.5 px-4 text-right">{formatKES(projections.baseCase.operatingIncome, { compact: true })}</td>
                  <td className="py-2.5 px-4 text-right text-white font-bold">{formatKES(projections.scenarioCase.operatingIncome, { compact: true })}</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400">+{projections.variance.operatingIncomePct.toFixed(1)}%</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-4 font-sans text-slate-300">Operating Margin</td>
                  <td className="py-2.5 px-4 text-right">{formatPercent(projections.baseCase.operatingMargin, 2)}</td>
                  <td className="py-2.5 px-4 text-right text-sky-400">{formatPercent(projections.scenarioCase.operatingMargin, 2)}</td>
                  <td className="py-2.5 px-4 text-right text-slate-400">
                    {(projections.scenarioCase.operatingMargin - projections.baseCase.operatingMargin).toFixed(1)} bps
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-4 font-sans text-slate-300 font-medium">Net Profit (Net Income)</td>
                  <td className="py-2.5 px-4 text-right">{formatKES(projections.baseCase.netIncome, { compact: true })}</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">{formatKES(projections.scenarioCase.netIncome, { compact: true })}</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400">+{projections.variance.netIncomePct.toFixed(1)}%</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-4 font-sans text-slate-300">Operating Cash Flow</td>
                  <td className="py-2.5 px-4 text-right">{formatKES(projections.baseCase.operatingCashFlow, { compact: true })}</td>
                  <td className="py-2.5 px-4 text-right text-white">{formatKES(projections.scenarioCase.operatingCashFlow, { compact: true })}</td>
                  <td className="py-2.5 px-4 text-right text-slate-300">+{projections.variance.netIncomePct.toFixed(1)}%</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-4 font-sans text-slate-300">Capital Expenditure</td>
                  <td className="py-2.5 px-4 text-right text-slate-400">{formatKES(projections.baseCase.capex, { compact: true })}</td>
                  <td className="py-2.5 px-4 text-right text-purple-400">{formatKES(projections.scenarioCase.capex, { compact: true })}</td>
                  <td className="py-2.5 px-4 text-right text-slate-400">+{assumptions.capexChange}%</td>
                </tr>

                <tr className="bg-white/[0.02]">
                  <td className="py-2.5 px-4 font-sans text-white font-medium">Free Cash Flow (FCF)</td>
                  <td className="py-2.5 px-4 text-right">{formatKES(projections.baseCase.freeCashFlow, { compact: true })}</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">{formatKES(projections.scenarioCase.freeCashFlow, { compact: true })}</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400">+{projections.variance.fcfPct.toFixed(1)}%</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-4 font-sans text-slate-300">Diluted EPS</td>
                  <td className="py-2.5 px-4 text-right">KES {projections.baseCase.eps.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-right text-white font-bold">KES {projections.scenarioCase.eps.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400">+{projections.variance.epsPct.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
