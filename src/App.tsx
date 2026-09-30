import React, { useState } from 'react';
import { COMPANIES } from './data/companies';
import { FINANCIAL_FACTS } from './data/financialFacts';
import { Company } from './types/financial';
import { Header, NavTab } from './components/Header';
import { AuthProvider } from './firebase/authContext';

import { OverviewView } from './components/views/OverviewView';
import { CompaniesView } from './components/views/CompaniesView';
import { FinancialStatementsView } from './components/views/FinancialStatementsView';
import { RatioAnalysisView } from './components/views/RatioAnalysisView';
import { ValuationView } from './components/views/ValuationView';
import { PeerComparisonView } from './components/views/PeerComparisonView';
import { ScenarioAnalysisView } from './components/views/ScenarioAnalysisView';
import { AIResearchView } from './components/views/AIResearchView';
import { TerminalCommandCenterView } from './components/views/TerminalCommandCenterView';
import { DataSourcesView } from './components/views/DataSourcesView';
import { DataIntegrityView } from './components/views/DataIntegrityView';

export default function App() {
  const [selectedCompany, setSelectedCompany] = useState<Company>(COMPANIES[0]);
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0b0e14] text-slate-200 flex flex-col font-sans terminal-grid">
        {/* Top Header & Ticker Tape */}
        <Header
          companies={COMPANIES}
          selectedCompany={selectedCompany}
          onSelectCompany={setSelectedCompany}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Main Analytical Canvas */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-6">
          {activeTab === 'overview' && (
            <OverviewView
              company={selectedCompany}
              facts={FINANCIAL_FACTS}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'companies' && (
            <CompaniesView
              companies={COMPANIES}
              selectedCompany={selectedCompany}
              onSelectCompany={setSelectedCompany}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'statements' && (
            <FinancialStatementsView
              company={selectedCompany}
              facts={FINANCIAL_FACTS}
            />
          )}

          {activeTab === 'ratios' && (
            <RatioAnalysisView
              company={selectedCompany}
              facts={FINANCIAL_FACTS}
            />
          )}

          {activeTab === 'valuation' && (
            <ValuationView
              company={selectedCompany}
              facts={FINANCIAL_FACTS}
            />
          )}

          {activeTab === 'peers' && (
            <PeerComparisonView
              companies={COMPANIES}
              facts={FINANCIAL_FACTS}
            />
          )}

          {activeTab === 'scenarios' && (
            <ScenarioAnalysisView
              company={selectedCompany}
              facts={FINANCIAL_FACTS}
            />
          )}

          {activeTab === 'ai_research' && (
            <AIResearchView
              company={selectedCompany}
              facts={FINANCIAL_FACTS}
            />
          )}

          {activeTab === 'telemetry' && (
            <TerminalCommandCenterView
              companies={COMPANIES}
              selectedCompany={selectedCompany}
              onSelectCompany={setSelectedCompany}
            />
          )}

          {activeTab === 'sources' && <DataSourcesView />}

          {activeTab === 'integrity' && (
            <DataIntegrityView
              companies={COMPANIES}
              facts={FINANCIAL_FACTS}
            />
          )}
        </main>

        {/* Institutional Terminal Footer */}
        <footer className="border-t border-white/8 bg-[#080a0f] py-4 text-xs font-mono text-slate-400">
          <div className="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-slate-300">NSE Quant & Valuation Terminal</span>
              <span>·</span>
              <span>Nairobi Securities Exchange Official Data Layer</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>Firebase Auth & Firestore</span>
              <span>·</span>
              <span>Google Search Grounding (gemini-3.5-flash)</span>
              <span>·</span>
              <span>Deterministic TS Computation Engine</span>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
