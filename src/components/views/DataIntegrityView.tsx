import React, { useState } from 'react';
import { Company, FinancialFact, DataQualityCheck } from '../../types/financial';
import { runDataIntegrityAudit } from '../../engine/dataIntegrity';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, RefreshCw, Filter } from 'lucide-react';

interface DataIntegrityViewProps {
  companies: Company[];
  facts: FinancialFact[];
}

export const DataIntegrityView: React.FC<DataIntegrityViewProps> = ({ companies, facts }) => {
  const [filterCompany, setFilterCompany] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const allChecks = runDataIntegrityAudit(facts, companies);

  const filteredChecks = allChecks.filter(check => {
    if (filterCompany !== 'ALL' && check.companyTicker !== filterCompany) return false;
    if (filterStatus !== 'ALL' && check.status !== filterStatus) return false;
    return true;
  });

  const passCount = allChecks.filter(c => c.status === 'PASS').length;
  const warningCount = allChecks.filter(c => c.status === 'WARNING').length;
  const failCount = allChecks.filter(c => c.status === 'FAIL').length;
  const healthScore = Math.round((passCount / allChecks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner & Health Score */}
      <div className="bg-[#121622] border border-white/8 rounded p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Deterministic Data Integrity & Audit Console
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated reconciliation of balance sheets (Assets = Liabilities + Equity), duplicate fact detection, currency uniformity, and source document citations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#0b0e14] border border-emerald-500/30 rounded px-4 py-2 text-right">
              <div className="text-[10px] uppercase text-slate-400 font-mono">Dataset Audit Score</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{healthScore}% PASS</div>
            </div>
          </div>
        </div>

        {/* Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5 font-mono">
          <div className="bg-[#0b0e14] p-3 rounded border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase">Total Audit Checks</div>
            <div className="text-lg font-bold text-white mt-0.5">{allChecks.length}</div>
          </div>

          <div className="bg-[#0b0e14] p-3 rounded border border-emerald-500/20">
            <div className="text-[10px] text-emerald-400 uppercase">Checks Passed</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{passCount}</div>
          </div>

          <div className="bg-[#0b0e14] p-3 rounded border border-amber-500/20">
            <div className="text-[10px] text-amber-400 uppercase">Warnings / Notes</div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">{warningCount}</div>
          </div>

          <div className="bg-[#0b0e14] p-3 rounded border border-rose-500/20">
            <div className="text-[10px] text-rose-400 uppercase">Reconciliation Failures</div>
            <div className="text-lg font-bold text-rose-400 mt-0.5">{failCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121622] border border-white/8 rounded p-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Filter Company:</span>
          <select
            value={filterCompany}
            onChange={e => setFilterCompany(e.target.value)}
            className="bg-[#0b0e14] border border-white/10 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Companies</option>
            {companies.map(c => (
              <option key={c.id} value={c.ticker}>
                {c.ticker} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 mr-1">Status:</span>
          {['ALL', 'PASS', 'WARNING', 'FAIL'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#121622] border border-white/8 rounded overflow-hidden">
        <div className="p-3.5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Deterministic Integrity Audit Log ({filteredChecks.length} Records)
          </h3>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Against Audited Reports
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#0b0e14] text-slate-400 font-mono text-[11px] border-b border-white/5 uppercase">
                <th className="py-2.5 px-4 w-24">Status</th>
                <th className="py-2.5 px-4 w-24">Entity</th>
                <th className="py-2.5 px-4 w-28">Period</th>
                <th className="py-2.5 px-4 w-48">Audit Check Type</th>
                <th className="py-2.5 px-4">Verification Audit Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredChecks.map(check => {
                const isPass = check.status === 'PASS';
                const isWarning = check.status === 'WARNING';
                const isFail = check.status === 'FAIL';

                return (
                  <tr key={check.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      {isPass && (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          PASS
                        </span>
                      )}
                      {isWarning && (
                        <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          NOTE
                        </span>
                      )}
                      {isFail && (
                        <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-[11px] font-bold border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          FAIL
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-white font-bold font-mono">
                      {check.companyTicker}
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      FY{check.fiscalYear}
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">
                      {check.checkType.replace(/_/g, ' ')}
                    </td>

                    <td className="py-3 px-4 text-slate-200 font-sans text-xs leading-relaxed">
                      <div>{check.message}</div>
                      {check.details && (
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{check.details}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
