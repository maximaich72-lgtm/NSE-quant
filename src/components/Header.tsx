import React from 'react';
import { Company } from '../types/financial';
import { formatKES } from '../engine/formatters';
import { ShieldCheck, Sparkles, SlidersHorizontal, BarChart3, Database, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../firebase/authContext';

export type NavTab =
  | 'overview'
  | 'companies'
  | 'statements'
  | 'ratios'
  | 'valuation'
  | 'peers'
  | 'scenarios'
  | 'ai_research'
  | 'telemetry'
  | 'sources'
  | 'integrity';

interface HeaderProps {
  companies: Company[];
  selectedCompany: Company;
  onSelectCompany: (company: Company) => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  companies,
  selectedCompany,
  onSelectCompany,
  activeTab,
  onSelectTab
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0b0e14]/95 backdrop-blur border-b border-white/8">
      {/* Top Ticker Tape & Status */}
      <div className="px-4 py-1.5 bg-[#080a0f] border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
          <span className="text-slate-400 font-semibold tracking-wider uppercase text-[10px]">NSE Watchlist:</span>
          {companies.map(c => {
            const isSelected = c.id === selectedCompany.id;
            const isPositive = c.dayChange >= 0;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCompany(c)}
                className={`flex items-center gap-2 px-2 py-0.5 rounded transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white/10 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span className="font-bold text-slate-200">{c.ticker}</span>
                <span className="tabular-nums">KES {c.currentPrice.toFixed(2)}</span>
                <span className={`tabular-nums text-[10px] ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? '+' : ''}{c.dayChangePct.toFixed(2)}%
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3 text-slate-400 text-[10px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE NSE DATA FEED
          </span>
          <span>·</span>
          <span>CURRENCY: KES</span>
          <span>·</span>
          <span>IFRS & CBK COMPLIANT</span>
        </div>
      </div>

      {/* Main Top Bar (Strict 3-zone contract) */}
      <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
            N
          </div>
          <div>
            <a href="/" className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              NSE Quant & Valuation Terminal
            </a>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-medium text-slate-300 overflow-x-auto">
          {[
            { id: 'overview' as NavTab, label: 'Overview' },
            { id: 'companies' as NavTab, label: 'Companies' },
            { id: 'statements' as NavTab, label: 'Financial Statements' },
            { id: 'ratios' as NavTab, label: 'Ratio Analysis' },
            { id: 'valuation' as NavTab, label: 'Valuation' },
            { id: 'peers' as NavTab, label: 'Peer Comparison' },
            { id: 'scenarios' as NavTab, label: 'Scenario Analysis' },
            { id: 'ai_research' as NavTab, label: 'AI Research' },
            { id: 'telemetry' as NavTab, label: 'Command Center' },
            { id: 'sources' as NavTab, label: 'Data Sources' },
            { id: 'integrity' as NavTab, label: 'Data Integrity' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-2.5 py-1.5 rounded text-xs transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Company Selector & Google Auth */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select
              value={selectedCompany.id}
              onChange={e => {
                const found = companies.find(c => c.id === e.target.value);
                if (found) onSelectCompany(found);
              }}
              className="bg-[#141926] border border-white/10 text-slate-200 text-xs rounded px-3 py-1.5 pr-8 focus:outline-none focus:border-emerald-500 font-mono font-medium cursor-pointer"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.ticker} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onSelectTab('ai_research')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-medium rounded shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>

          {/* Firebase Google Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-slate-200 font-mono">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-emerald-500/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden md:inline text-[11px] truncate max-w-[100px]">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={() => signOutUser()}
                title="Sign out of Firebase"
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-mono rounded transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Sign in with Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-nav for Tablets & Mobile Viewports */}
      <div className="xl:hidden px-4 py-2 border-t border-white/5 overflow-x-auto flex items-center gap-1 text-xs">
        {[
          { id: 'overview' as NavTab, label: 'Overview' },
          { id: 'statements' as NavTab, label: 'Statements' },
          { id: 'ratios' as NavTab, label: 'Ratios' },
          { id: 'valuation' as NavTab, label: 'Valuation' },
          { id: 'peers' as NavTab, label: 'Peers' },
          { id: 'scenarios' as NavTab, label: 'Scenarios' },
          { id: 'ai_research' as NavTab, label: 'AI' },
          { id: 'telemetry' as NavTab, label: 'Command' },
          { id: 'integrity' as NavTab, label: 'Integrity' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap cursor-pointer ${
              activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};

