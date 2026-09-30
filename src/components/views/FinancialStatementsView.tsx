import React, { useState } from 'react';
import { Company, FinancialFact, StatementType } from '../../types/financial';
import { formatKES } from '../../engine/formatters';
import { FileText, ShieldCheck, ChevronRight, Info, CheckCircle2 } from 'lucide-react';

interface FinancialStatementsViewProps {
  company: Company;
  facts: FinancialFact[];
}

export const FinancialStatementsView: React.FC<FinancialStatementsViewProps> = ({
  company,
  facts
}) => {
  const [activeStatement, setActiveStatement] = useState<StatementType>('INCOME_STATEMENT');
  const [unitMode, setUnitMode] = useState<'billions' | 'millions' | 'exact'>('billions');
  const [selectedFact, setSelectedFact] = useState<FinancialFact | null>(null);

  const companyFacts = facts.filter(f => f.companyId === company.id);
  const years = [2024, 2023, 2022, 2021, 2020];

  // Filter facts by active statement
  const statementFacts = companyFacts.filter(f => {
    if (activeStatement === 'INCOME_STATEMENT') {
      return f.statementType === 'INCOME_STATEMENT' || f.statementType === 'FMCG';
    }
    return f.statementType === activeStatement;
  });

  // Extract unique metric names for row headers in logical financial order
  const uniqueMetricNames = Array.from(
    new Set(statementFacts.map(f => f.metricName))
  );

  const formatValue = (val: number | undefined) => {
    if (val === undefined) return '—';
    if (unitMode === 'billions') return (val / 1e9).toFixed(2);
    if (unitMode === 'millions') return (val / 1e6).toFixed(1);
    return val.toLocaleString('en-US');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121622] border border-white/8 rounded p-4">
        {/* Statement Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0b0e14] rounded border border-white/5 overflow-x-auto">
          {[
            { id: 'INCOME_STATEMENT' as StatementType, label: 'Income Statement' },
            { id: 'BALANCE_SHEET' as StatementType, label: 'Balance Sheet' },
            { id: 'CASH_FLOW' as StatementType, label: 'Cash Flow' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveStatement(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeStatement === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Display Units Controls */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-mono">Display Scale:</span>
          <div className="flex items-center gap-1 p-1 bg-[#0b0e14] rounded border border-white/5 text-xs font-mono">
            {[
              { id: 'billions' as const, label: 'KES Billions (B)' },
              { id: 'millions' as const, label: 'KES Millions (M)' },
              { id: 'exact' as const, label: 'Exact KES' }
            ].map(scale => (
              <button
                key={scale.id}
                onClick={() => setUnitMode(scale.id)}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                  unitMode === scale.id
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {scale.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Statement Data Grid */}
      <div className="bg-[#121622] border border-white/8 rounded overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              {company.name} — {activeStatement.replace('_', ' ')} (Audited Annual Series)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Click any figure to view filing page and verification provenance</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#0b0e14] text-slate-400 font-mono text-[11px] border-b border-white/5 uppercase">
                <th className="py-3 px-4 w-2/5">Line Item (Reported Metric)</th>
                {years.map(y => (
                  <th key={y} className="py-3 px-4 text-right">
                    FY{y}
                  </th>
                ))}
                <th className="py-3 px-4 text-center w-24">Source Citation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {uniqueMetricNames.length === 0 ? (
                <tr>
                  <td colSpan={years.length + 2} className="py-8 text-center text-slate-500 font-sans">
                    No verified {activeStatement.toLowerCase().replace('_', ' ')} line items found for this entity.
                  </td>
                </tr>
              ) : (
                uniqueMetricNames.map(metricName => {
                  const representativeFact = statementFacts.find(f => f.metricName === metricName);
                  const isHighlighted =
                    metricName === 'revenue' ||
                    metricName === 'net_income' ||
                    metricName === 'operating_income' ||
                    metricName === 'total_assets' ||
                    metricName === 'shareholders_equity' ||
                    metricName === 'free_cash_flow';

                  return (
                    <tr
                      key={metricName}
                      className={`hover:bg-white/5 transition-colors ${
                        isHighlighted ? 'bg-white/[0.02] font-semibold text-white' : 'text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-sans flex items-center gap-2">
                        {isHighlighted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                        <span>{representativeFact?.metricLabel || metricName}</span>
                      </td>

                      {years.map(y => {
                        const fact = statementFacts.find(
                          f => f.metricName === metricName && f.fiscalYear === y
                        );
                        return (
                          <td
                            key={y}
                            onClick={() => fact && setSelectedFact(fact)}
                            className={`py-2.5 px-4 text-right tabular-nums transition-colors ${
                              fact
                                ? 'cursor-pointer hover:text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-slate-600'
                            }`}
                          >
                            {formatValue(fact?.value)}
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-4 text-center">
                        {representativeFact && (
                          <button
                            onClick={() => setSelectedFact(representativeFact)}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            <span>p. {representativeFact.sourcePage || 'Ref'}</span>
                            <Info className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Source Provenance Modal / Inspector */}
      {selectedFact && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141824] border border-white/15 rounded-lg max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Verified Primary Fact Provenance
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedFact.metricLabel} (FY{selectedFact.fiscalYear})
                </h3>
              </div>
              <button
                onClick={() => setSelectedFact(null)}
                className="text-slate-400 hover:text-white p-1 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#0b0e14] p-3.5 rounded border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Reported Value:</span>
                <span className="text-white font-bold">{formatKES(selectedFact.value)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Source Document:</span>
                <span className="text-slate-200 text-right">{selectedFact.sourceDocTitle}</span>
              </div>
              {selectedFact.sourcePage && (
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Page Reference:</span>
                  <span className="text-emerald-400 font-bold">Page {selectedFact.sourcePage}</span>
                </div>
              )}
              {selectedFact.sourceSection && (
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Section Note:</span>
                  <span className="text-slate-300">{selectedFact.sourceSection}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Verification Status:</span>
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedFact.verificationStatus}
                </span>
              </div>
            </div>

            {selectedFact.sourceText && (
              <div className="p-3 bg-white/5 rounded border border-white/5 text-xs text-slate-300 font-sans italic">
                "{selectedFact.sourceText}"
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedFact(null)}
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
