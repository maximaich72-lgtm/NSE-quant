import React, { useState } from 'react';
import { Company, FinancialFact } from '../../types/financial';
import { calculateValuation } from '../../engine/valuation';
import { formatKES, formatPercent, formatMultiple } from '../../engine/formatters';
import { Calculator, TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';

interface ValuationViewProps {
  company: Company;
  facts: FinancialFact[];
}

export const ValuationView: React.FC<ValuationViewProps> = ({ company, facts }) => {
  const latestFacts = facts.filter(f => f.companyId === company.id && f.fiscalYear === 2024);
  const valuation = calculateValuation(company, latestFacts);

  // Target multiple sensitivity state
  const basePe = company.peRatio || 8.0;
  const [targetPe, setTargetPe] = useState<number>(basePe);

  const basePb = company.pbRatio || 1.5;
  const [targetPb, setTargetPb] = useState<number>(basePb);

  const netIncome = latestFacts.find(f => f.metricName === 'net_income')?.value || 50_000_000_000;
  const equity = latestFacts.find(f => f.metricName === 'shareholders_equity')?.value || 100_000_000_000;
  const shares = company.sharesOutstanding || 1_000_000_000;

  const currentEps = netIncome / shares;
  const currentBvps = equity / shares;

  // Implied share prices under target multiples
  const impliedPricePe = currentEps * targetPe;
  const impliedPricePb = currentBvps * targetPb;
  const blendedPrice = (impliedPricePe + impliedPricePb) / 2;
  const upsidePct = ((blendedPrice - company.currentPrice) / company.currentPrice) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#121622] border border-white/8 rounded p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs border border-emerald-500/20">
                {company.ticker} VALUATION
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {company.name} Multiple Valuation & Sensitivity
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Current Market Price: <span className="text-white font-mono font-bold">KES {company.currentPrice.toFixed(2)}</span> ·
              Market Cap: <span className="text-white font-mono font-bold">{formatKES(company.marketCap, { compact: true })}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#0b0e14] px-3 py-2 rounded border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audited FY2024 Source Basis</span>
          </div>
        </div>
      </div>

      {/* 5 Core Valuation Multiples Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Trailing P/E */}
        <div className="bg-[#121622] border border-white/8 rounded p-4">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Trailing P/E</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {valuation.peRatio.formattedValue}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Historical Avg: {formatMultiple(valuation.historicalPeAvg, 1)}
          </div>
        </div>

        {/* 2. Price to Book (P/B) */}
        <div className="bg-[#121622] border border-white/8 rounded p-4">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Price to Book (P/B)</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {valuation.pbRatio.formattedValue}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Historical Avg: {formatMultiple(valuation.historicalPbAvg, 1)}
          </div>
        </div>

        {/* 3. Dividend Yield */}
        <div className="bg-[#121622] border border-white/8 rounded p-4">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Dividend Yield</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {valuation.dividendYield.formattedValue}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Cash dividend yield</div>
        </div>

        {/* 4. EV / EBITDA */}
        <div className="bg-[#121622] border border-white/8 rounded p-4">
          <div className="text-[11px] text-slate-400 uppercase font-mono">EV / EBITDA</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {valuation.evEbitda.formattedValue}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            {company.companyType === 'BANK' ? 'Non-applicable (Bank)' : 'Enterprise multiple'}
          </div>
        </div>

        {/* 5. Market Cap */}
        <div className="bg-[#121622] border border-white/8 rounded p-4">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Market Cap</div>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
            {formatKES(company.marketCap, { compact: true })}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">NSE Equity Value</div>
        </div>
      </div>

      {/* EV/EBITDA Non-applicability note if Bank */}
      {!valuation.evEbitda.isAvailable && valuation.evEbitda.missingReason && (
        <div className="p-3.5 bg-[#121624] border border-sky-500/20 rounded text-xs text-sky-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" />
          <div>
            <strong>Institutional Accounting Convention:</strong> {valuation.evEbitda.missingReason}
          </div>
        </div>
      )}

      {/* Interactive Target Valuation Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Simulator Controls */}
        <div className="bg-[#121622] border border-white/8 rounded p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Target Valuation Multiples Sensitivity Model
            </h3>
          </div>

          <div className="space-y-4">
            {/* P/E Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">Target P/E Multiple:</span>
                <span className="text-emerald-400 font-bold">{targetPe.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="25.0"
                step="0.5"
                value={targetPe}
                onChange={e => setTargetPe(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-[#0b0e14] rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>2.0x (Distressed)</span>
                <span>Current: {formatMultiple(company.peRatio, 1)}</span>
                <span>25.0x (High Growth)</span>
              </div>
            </div>

            {/* P/B Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">Target P/B Multiple:</span>
                <span className="text-sky-400 font-bold">{targetPb.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="8.0"
                step="0.1"
                value={targetPb}
                onChange={e => setTargetPb(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-[#0b0e14] rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0.3x (Deep Discount)</span>
                <span>Current: {formatMultiple(company.pbRatio, 2)}</span>
                <span>8.0x (Premium FMCG)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setTargetPe(basePe);
                  setTargetPb(basePb);
                }}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded border border-white/5 cursor-pointer font-mono"
              >
                Reset to Current Multiples
              </button>
            </div>
          </div>
        </div>

        {/* Implied Valuation Results */}
        <div className="bg-[#121622] border border-white/8 rounded p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono pb-3 border-b border-white/5 mb-3">
              Implied Fair Value & Margin of Safety
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#0b0e14] p-3 rounded border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Earnings Implied Price</div>
                <div className="text-base font-bold font-mono text-white mt-1">
                  KES {impliedPricePe.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Based on target P/E</div>
              </div>

              <div className="bg-[#0b0e14] p-3 rounded border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Book Value Implied Price</div>
                <div className="text-base font-bold font-mono text-white mt-1">
                  KES {impliedPricePb.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Based on target P/B</div>
              </div>
            </div>

            <div className="p-4 bg-[#0b0e14] border border-emerald-500/20 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Blended Target Price</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                    KES {blendedPrice.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Implied Upside / (Downside)</div>
                  <div
                    className={`text-lg font-bold font-mono ${
                      upsidePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {upsidePct >= 0 ? '+' : ''}{upsidePct.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 font-mono">
            Note: Implied fair value is a deterministic multiple transformation of audited FY24 EPS (KES {currentEps.toFixed(2)}) and BVPS (KES {currentBvps.toFixed(2)}).
          </div>
        </div>
      </div>
    </div>
  );
};
