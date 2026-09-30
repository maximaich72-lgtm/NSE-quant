import React, { useState } from 'react';
import { Company, FinancialFact } from '../../types/financial';
import { formatKES, formatPercent, formatMultiple, formatNumber } from '../../engine/formatters';
import { calculateCompanyRatios } from '../../engine/ratios';
import { FinancialChart } from '../FinancialChart';
import { Check, ShieldCheck, Users } from 'lucide-react';

interface PeerComparisonViewProps {
  companies: Company[];
  facts: FinancialFact[];
}

export const PeerComparisonView: React.FC<PeerComparisonViewProps> = ({ companies, facts }) => {
  // Multi-select state: default to all 4 or first 3
  const [selectedIds, setSelectedIds] = useState<string[]>(companies.map(c => c.id));

  const toggleCompany = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter(item => item !== id));
      }
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedCompanies = companies.filter(c => selectedIds.includes(c.id));

  // Compute 2024 ratios for each selected company
  const companyData = selectedCompanies.map(company => {
    const cFacts = facts.filter(f => f.companyId === company.id);
    const facts24 = cFacts.filter(f => f.fiscalYear === 2024);
    const facts23 = cFacts.filter(f => f.fiscalYear === 2023);
    const facts20 = cFacts.filter(f => f.fiscalYear === 2020);
    const ratios = calculateCompanyRatios(facts24, facts23, facts20, company, 2024);

    const getMetric = (name: string) =>
      facts24.find(f => f.metricName === name)?.value ?? 0;

    return {
      company,
      ratios,
      revenue: getMetric('revenue'),
      operatingIncome: getMetric('operating_income'),
      netIncome: getMetric('net_income'),
      assets: getMetric('total_assets'),
      equity: getMetric('shareholders_equity'),
      debt: getMetric('total_debt')
    };
  });

  // Chart datasets
  const roeChartData = companyData.map(d => ({
    label: d.company.ticker,
    value: d.ratios.roe?.value ?? 0
  }));

  const netMarginChartData = companyData.map(d => ({
    label: d.company.ticker,
    value: d.ratios.net_margin?.value ?? 0
  }));

  const marketCapChartData = companyData.map(d => ({
    label: d.company.ticker,
    value: d.company.marketCap
  }));

  const peChartData = companyData.map(d => ({
    label: d.company.ticker,
    value: d.company.peRatio ?? 0
  }));

  return (
    <div className="space-y-6">
      {/* Top Selector Banner */}
      <div className="bg-[#121622] border border-white/8 rounded p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Peer Benchmarking & Comparative Metrics
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Side-by-side quantitative comparison across sectors. No subjective overall ranking scores—pure underlying metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono mr-1">Active Peers:</span>
            {companies.map(c => {
              const active = selectedIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCompany(c.id)}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                  <span>{c.ticker}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side-by-Side Financial Comparison Grid */}
      <div className="bg-[#121622] border border-white/8 rounded overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            FY2024 Cross-Company Financial Metrics Matrix
          </h3>
          <span className="text-xs text-slate-400 font-mono">Comparing {selectedCompanies.length} Entities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#0b0e14] text-slate-400 font-mono text-[11px] border-b border-white/5 uppercase">
                <th className="py-3 px-4 w-1/4">Metric</th>
                {companyData.map(d => (
                  <th key={d.company.id} className="py-3 px-4 text-right">
                    <div>{d.company.ticker}</div>
                    <div className="text-[10px] text-slate-500 font-normal lowercase">{d.company.sector}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {/* Market Cap */}
              <tr className="hover:bg-white/5">
                <td className="py-2.5 px-4 font-sans text-slate-300 font-medium">Market Capitalization</td>
                {companyData.map(d => (
                  <td key={d.company.id} className="py-2.5 px-4 text-right text-white font-bold">
                    {formatKES(d.company.marketCap, { compact: true })}
                  </td>
                ))}
              </tr>

              {/* Share Price */}
              <tr className="hover:bg-white/5">
                <td className="py-2.5 px-4 font-sans text-slate-300">Market Price (KES)</td>
                {companyData.map(d => (
                  <td key={d.company.id} className="py-2.5 px-4 text-right text-slate-200">
                    KES {d.company.currentPrice.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* Revenue */}
              <tr className="hover:bg-white/5 bg-white/[0.02]">
                <td className="py-2.5 px-4 font-sans text-white font-medium">FY24 Revenue / Total Income</td>
                {companyData.map(d => (
                  <td key={d.company.id} className="py-2.5 px-4 text-right text-white font-bold">
                    {formatKES(d.revenue, { compact: true })}
                  </td>
                ))}
              </tr>

              {/* Revenue Growth */}
              <tr className="hover:bg-white/5">
                <td className="py-2.5 px-4 font-sans text-slate-300">Revenue Growth (YoY)</td>
                {companyData.map(d => (
                  <td key={d.company.id} className="py-2.5 px-4 text-right text-emerald-400">
                    {d.ratios.revenue_growth?.formattedValue}
                  </td>
                ))}
              </tr>

              {/* Operating Income */}
              <tr className="hover:bg-white/5">
                <td className="py-2.5 px-4 font-sans text-slate-300">Operating Profit (EBIT)</td>
                {companyData.map(d => (
                  <td key={d.company.id} className="py-2.5 px-4 text-right text-slate-200">
                    {formatKES(d.operatingIncome, { compact: true })}
                  </td>
                ))}
              </tr>

              {/* Net Income */}
              <tr className="hover:bg-white/5 bg-white/[0.02]">
                <td className="py-2.5 px-4 font-sans text-white font-medium">Net Profit for the Year</td>
                {companyData.map(d => (
                  <td key={d.company.id} className="py-2.5 px-4 text-right text-emerald-400 font-bold">
                    {formatKES(d.netIncome, { compact: true })}
                  </td>
                ))}
              </tr>

              {/* Net Margin */}
              <tr className="hover:bg-white/5">
                <td className="py-2.5 px-4 font-sans text-slate-300">Net Profit Margin</td>
                {companyData.map(d => (
                  <td key={d.company.id} className="py-2.5 px-4 text-right text-slate-200">
                    {d.ratios.net_margin?.formattedValue}
                  </td>
                ))}
              </tr>

              {/* ROE */}
              <tr className="hover:bg-white/5 bg-white/[0.02]">
                <td className="py-2.5 px-4 font-sans text-white font-medium">Return on Equity (ROE)</td>
                {companyData.map(d => (
                  <td key={d.company.id} className="py-2.5 px-4 text-right text-sky-400 font-bold">
                    {d.ratios.roe?.formattedValue}
                  </td>
                ))}
              </tr>

              {/* ROA */}
              <tr className="hover:bg-white/5">
                <td className="py-2.5 px-4 font-sans text-slate-300">Return on Assets (ROA)</td>
                {companyData.map(d => (
                  <td key={d.company.id} className="py-2.5 px-4 text-right text-slate-200">
                    {d.ratios.roa?.formattedValue}
                  </td>
                ))}
              </tr>

              {/* Debt to Equity */}
              <tr className="hover:bg-white/5">
                <td className="py-2.5 px-4 font-sans text-slate-300">Debt / Equity Ratio</td>
                {companyData.map(d => (
                  <td key={d.company.id} className="py-2.5 px-4 text-right text-slate-300">
                    {d.ratios.debt_to_equity?.formattedValue}
                  </td>
                ))}
              </tr>

              {/* Trailing P/E */}
              <tr className="hover:bg-white/5 bg-white/[0.02]">
                <td className="py-2.5 px-4 font-sans text-white font-medium">Trailing P/E Ratio</td>
                {companyData.map(d => (
                  <td key={d.company.id} className="py-2.5 px-4 text-right text-emerald-400 font-bold">
                    {formatMultiple(d.company.peRatio, 1)}
                  </td>
                ))}
              </tr>

              {/* P/B Ratio */}
              <tr className="hover:bg-white/5">
                <td className="py-2.5 px-4 font-sans text-slate-300">Price to Book (P/B)</td>
                {companyData.map(d => (
                  <td key={d.company.id} className="py-2.5 px-4 text-right text-slate-200">
                    {formatMultiple(d.company.pbRatio, 2)}
                  </td>
                ))}
              </tr>

              {/* Dividend Yield */}
              <tr className="hover:bg-white/5">
                <td className="py-2.5 px-4 font-sans text-slate-300">Dividend Yield</td>
                {companyData.map(d => (
                  <td key={d.company.id} className="py-2.5 px-4 text-right text-amber-400 font-bold">
                    {formatPercent(d.company.dividendYield, 2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparative Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinancialChart
          title="Return on Equity (ROE)"
          subtitle="FY2024 Comparative %"
          data={roeChartData}
          type="bar"
          isPercent={true}
          isCurrency={false}
          color="#38bdf8"
          height={180}
        />

        <FinancialChart
          title="Net Profit Margin"
          subtitle="FY2024 Conversion %"
          data={netMarginChartData}
          type="bar"
          isPercent={true}
          isCurrency={false}
          color="#10b981"
          height={180}
        />

        <FinancialChart
          title="Market Capitalization"
          subtitle="KES Value on NSE"
          data={marketCapChartData}
          type="bar"
          color="#a855f7"
          height={180}
        />

        <FinancialChart
          title="Trailing P/E Multiple"
          subtitle="Price / Diluted Earnings"
          data={peChartData}
          type="bar"
          isPercent={false}
          isCurrency={false}
          color="#f59e0b"
          height={180}
        />
      </div>
    </div>
  );
};
