import React from 'react';
import { SOURCE_DOCUMENTS } from '../../data/sourceDocuments';
import { ExternalLink, FileText, CheckCircle2, ShieldCheck, Database, Hash } from 'lucide-react';

export const DataSourcesView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Protocol Header */}
      <div className="bg-[#121622] border border-white/8 rounded p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Official Primary Source Document Registry
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Immutable provenance tracking for all financial facts. Sources consist strictly of primary issuer annual reports, auditor statements, CBK supervision bulletins, and NSE trading records.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographic Integrity & Auditor Traceability</span>
          </div>
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-[#121622] border border-white/8 rounded overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Registered Source Documents ({SOURCE_DOCUMENTS.length} Primary Filings)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Status: All Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#0b0e14] text-slate-400 font-mono text-[11px] border-b border-white/5 uppercase">
                <th className="py-3 px-4">Document Title & Organization</th>
                <th className="py-3 px-4">Auditor / Source Authority</th>
                <th className="py-3 px-4 text-center">Fiscal Period</th>
                <th className="py-3 px-4 text-center">Pages</th>
                <th className="py-3 px-4">Verification & Hash</th>
                <th className="py-3 px-4 text-right">Access Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {SOURCE_DOCUMENTS.map(doc => (
                <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-sans">
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white text-xs">{doc.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {doc.sourceOrganization} · Published {doc.publicationDate}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-200">{doc.auditor || 'Regulatory Authority'}</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">
                      {doc.opinion === 'UNQUALIFIED' ? 'Clean Unqualified Opinion' : 'Official Report'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center text-slate-300 font-bold">
                    FY{doc.fiscalYear}
                  </td>

                  <td className="py-3.5 px-4 text-center text-slate-400">
                    {doc.pageCount} pp.
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{doc.verificationStatus}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-[180px] mt-0.5 flex items-center gap-1">
                      <Hash className="w-3 h-3 shrink-0" />
                      <span>{doc.fileHash}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded text-xs transition-colors font-sans"
                    >
                      <span>View Filing</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
