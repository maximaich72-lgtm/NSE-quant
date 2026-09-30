import React from 'react';
import { Company } from '../../types/financial';
import { formatKES, formatPercent, formatMultiple, formatNumber } from '../../engine/formatters';
import { ExternalLink, ArrowRight, Building2, Smartphone, Beer, Landmark } from 'lucide-react';

interface CompaniesViewProps {
  companies: Company[];
  selectedCompany: Company;
  onSelectCompany: (company: Company) => void;
  onNavigate: (tab: any) => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  companies,
  selectedCompany,
  onSelectCompany,
  onNavigate
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'TELECOM':
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'BANK':
        return <Landmark className="w-5 h-5 text-sky-400" />;
      case 'FMCG':
        return <Beer className="w-5 h-5 text-amber-400" />;
      default:
        return <Building2 className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Nairobi Securities Exchange (NSE) — Initial Equities Universe
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Core quantitative coverage spanning Telecommunications / Fintech, Banking, and Consumer Staples
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Showing 4 verified institutional profiles
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map(company => {
          const isSelected = company.id === selectedCompany.id;
          return (
            <div
              key={company.id}
              className={`bg-[#121622] border rounded p-5 flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.08)] ring-1 ring-emerald-500/30'
                  : 'border-white/8 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded bg-white/5 border border-white/5">
                      {getIcon(company.companyType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-xs border border-emerald-500/20">
                          {company.ticker}
                        </span>
                        <h3 className="font-bold text-white text-base">{company.name}</h3>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {company.sector} · {company.primaryExchange}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-base font-bold text-white">
                      KES {company.currentPrice.toFixed(2)}
                    </div>
                    <div
                      className={`text-xs ${
                        company.dayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {company.dayChange >= 0 ? '+' : ''}{company.dayChange.toFixed(2)} ({company.dayChangePct.toFixed(2)}%)
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-300 leading-relaxed">
                  {company.description}
                </p>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/5 font-mono text-center">
                  <div className="bg-[#0b0e14] p-2 rounded border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase">Market Cap</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">
                      {formatKES(company.marketCap, { compact: true })}
                    </div>
                  </div>

                  <div className="bg-[#0b0e14] p-2 rounded border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase">P/E Ratio</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">
                      {formatMultiple(company.peRatio, 1)}
                    </div>
                  </div>

                  <div className="bg-[#0b0e14] p-2 rounded border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase">P/B Ratio</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">
                      {formatMultiple(company.pbRatio, 2)}
                    </div>
                  </div>

                  <div className="bg-[#0b0e14] p-2 rounded border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase">Div Yield</div>
                    <div className="text-xs font-bold text-amber-400 mt-0.5">
                      {formatPercent(company.dividendYield, 2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5">
                <a
                  href={company.irUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
                >
                  <span>Filings & IR</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectCompany(company);
                      onNavigate('overview');
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    <span>{isSelected ? 'Active Selection' : 'Analyze Company'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
