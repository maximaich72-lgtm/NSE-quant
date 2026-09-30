import React, { useState } from 'react';
import { Company, FinancialFact } from '../../types/financial';
import { Sparkles, Send, FileText, CheckCircle2, Globe, Bookmark, BookmarkCheck, ExternalLink, Clock } from 'lucide-react';
import { useAuth } from '../../firebase/authContext';
import { saveResearchNote } from '../../firebase/firestoreService';

interface AIResearchViewProps {
  company: Company;
  facts: FinancialFact[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  searchGrounded?: boolean;
  groundingSources?: { title: string; url: string }[];
  searchQueries?: string[];
  saved?: boolean;
}

export const AIResearchView: React.FC<AIResearchViewProps> = ({ company, facts }) => {
  const { user } = useAuth();
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchGroundingEnabled, setSearchGroundingEnabled] = useState(true);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `### Observation
Welcome to the NSE Quant AI Research Assistant. I provide institutional analysis grounded in audited company annual filings, CBK banking supervision reports, and real-time Google Search data for ${company.name} (${company.ticker}) and its listed peers.

### Evidence
- Loaded Data: FY2020 through FY2024 audited financial statements.
- Search Grounding: Powered by Gemini 3.5 Flash with Google Search grounding for real-time market data, CBK interest rate updates, and news.

### Interpretation
You can ask targeted questions regarding revenue decomposition (such as M-PESA or regional banking units in DRC), balance sheet solvency, NPL provisioning, regulatory capital ratios, and excise tax impacts.

### Source
NSE Quant Terminal Document Registry (IFRS & CBK Prudential Standards) + Live Web Search.`,
      timestamp: 'Just now'
    }
  ]);

  const quickPrompts = [
    `Analyze ${company.ticker}'s FY24 revenue drivers, margins, and key financial changes`,
    company.companyType === 'BANK'
      ? `Assess ${company.ticker}'s asset quality, NPL coverage, and cost of risk relative to CBK benchmarks`
      : company.ticker === 'SCOM'
      ? `Evaluate Safaricom's M-PESA growth trajectory versus Ethiopian capital expenditure drag`
      : `Analyze EABL's excise tax burden and debt servicing profile in Kenya`,
    `Compare ${company.ticker} against its primary NSE industry peers on return on equity and valuation multiples`,
    `What are the major balance sheet risks and foreign exchange exposures disclosed in recent filings?`
  ];

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      // Collect relevant facts for the current company
      const companyFacts = facts.filter(f => f.companyId === company.id && f.fiscalYear >= 2023);
      const simplifiedFacts = companyFacts.map(f => ({
        year: f.fiscalYear,
        metric: f.metricLabel,
        value: f.value,
        source: `${f.sourceDocTitle} (p. ${f.sourcePage || 'Report'})`
      }));

      const res = await fetch('/api/ai-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          companyTicker: company.ticker,
          companyName: company.name,
          contextFacts: simplifiedFacts,
          enableSearchGrounding: searchGroundingEnabled
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'No analysis generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        searchGrounded: data.searchGrounded,
        groundingSources: data.groundingSources,
        searchQueries: data.searchQueries
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AI Research Error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `### Observation
Unable to retrieve online response from the AI research server.

### Evidence
Error details: ${err.message || 'Network communication fault'}.

### Interpretation
Please verify that your Gemini API key is configured in the environment settings, or inspect server-side API logs.

### Source
NSE Terminal Error Dispatcher.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToFirestore = async (msg: ChatMessage) => {
    if (!user) return;
    setSavingNoteId(msg.id);
    try {
      await saveResearchNote(user.uid, {
        id: msg.id,
        companyTicker: company.ticker,
        companyName: company.name,
        question: `Analysis for ${company.ticker}`,
        response: msg.content,
        sourceCitations: msg.groundingSources?.map(s => s.url) || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setMessages(prev =>
        prev.map(m => (m.id === msg.id ? { ...m, saved: true } : m))
      );
    } catch (err) {
      console.error('Failed to save research note to Firestore:', err);
    } finally {
      setSavingNoteId(null);
    }
  };

  // Helper to render formatted markdown sections
  const renderStructuredContent = (content: string) => {
    const sections = content.split('### ');
    if (sections.length <= 1) {
      return <div className="whitespace-pre-wrap leading-relaxed">{content}</div>;
    }

    return (
      <div className="space-y-3">
        {sections.map((sec, i) => {
          if (!sec.trim()) return null;
          const [title, ...bodyLines] = sec.split('\n');
          const body = bodyLines.join('\n').trim();

          const isObservation = title.toLowerCase().includes('observation');
          const isEvidence = title.toLowerCase().includes('evidence');
          const isInterpretation = title.toLowerCase().includes('interpretation');
          const isSource = title.toLowerCase().includes('source');

          let borderColor = 'border-white/10';
          let titleColor = 'text-slate-200';
          let tagBg = 'bg-white/5';

          if (isObservation) {
            borderColor = 'border-emerald-500/30';
            titleColor = 'text-emerald-400';
            tagBg = 'bg-emerald-500/10';
          } else if (isEvidence) {
            borderColor = 'border-sky-500/30';
            titleColor = 'text-sky-400';
            tagBg = 'bg-sky-500/10';
          } else if (isInterpretation) {
            borderColor = 'border-amber-500/30';
            titleColor = 'text-amber-400';
            tagBg = 'bg-amber-500/10';
          } else if (isSource) {
            borderColor = 'border-purple-500/30';
            titleColor = 'text-purple-400';
            tagBg = 'bg-purple-500/10';
          }

          return (
            <div key={i} className={`p-3 rounded bg-[#0b0e14]/70 border ${borderColor}`}>
              <div className={`text-[11px] font-mono uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5 ${titleColor}`}>
                <span className={`w-2 h-2 rounded-full ${tagBg}`} />
                {title.trim()}
              </div>
              <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                {body}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Protocol Header */}
      <div className="bg-[#121622] border border-white/8 rounded p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                AI Research Assistant — {company.name} ({company.ticker})
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Grounded in audited IFRS financial statements and official Central Bank of Kenya reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Grounding Toggle */}
            <button
              onClick={() => setSearchGroundingEnabled(!searchGroundingEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer border ${
                searchGroundingEnabled
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/30 font-bold'
                  : 'bg-white/5 text-slate-500 border-white/5'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Search Grounding: {searchGroundingEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Observation · Evidence · Interpretation · Source</span>
            </div>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="text-[11px] text-slate-400 font-mono mb-2">Institutional Research Templates:</div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded border border-white/5 text-left transition-colors cursor-pointer font-sans disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-[#121622] border border-white/8 rounded p-4 space-y-4 min-h-[400px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[550px] pr-1">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`p-4 rounded-lg text-xs ${
                msg.role === 'user'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 ml-8 sm:ml-16'
                  : 'bg-[#0b0e14] border border-white/5 text-slate-200 mr-4 sm:mr-10'
              }`}
            >
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5 font-mono text-[10px] text-slate-400">
                <span className="font-bold uppercase tracking-wider text-slate-300">
                  {msg.role === 'user' ? 'Institutional Analyst' : 'NSE Quant Terminal Engine (Gemini 3.5 Flash)'}
                </span>
                <div className="flex items-center gap-3">
                  {msg.role === 'assistant' && user && msg.id !== 'welcome-msg' && (
                    <button
                      onClick={() => handleSaveToFirestore(msg)}
                      disabled={msg.saved || savingNoteId === msg.id}
                      className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-mono cursor-pointer transition-colors"
                    >
                      {msg.saved ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Saved in Firestore</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Save Note</span>
                        </>
                      )}
                    </button>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {msg.timestamp}
                  </span>
                </div>
              </div>

              {msg.role === 'user' ? (
                <div className="font-sans text-white text-sm">{msg.content}</div>
              ) : (
                <>
                  {renderStructuredContent(msg.content)}

                  {/* Grounding Search Citations if present */}
                  {msg.groundingSources && msg.groundingSources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/5">
                      <div className="text-[10px] font-mono uppercase text-sky-400 mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>Google Search Grounding Verified References:</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {msg.groundingSources.map((source, sIdx) => (
                          <a
                            key={sIdx}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 rounded text-[10px] font-mono transition-colors"
                          >
                            <span className="truncate max-w-[200px]">{source.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {loading && (
            <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/5 text-slate-400 text-xs font-mono flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>Querying verified financial facts database and running search grounding...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-white/5 flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={`Ask about ${company.ticker}'s financial performance, period changes, management commentary, or risks...`}
            disabled={loading}
            className="flex-1 bg-[#0b0e14] border border-white/10 text-slate-200 text-xs rounded px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputQuery.trim()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Run Inquiry</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
