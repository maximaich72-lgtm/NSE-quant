import React, { useState } from 'react';
import { Company } from '../../types/financial';
import { formatKES, formatPercent } from '../../engine/formatters';
import {
  Activity,
  Layers,
  Search,
  Sliders,
  Sparkles,
  TrendingUp,
  Globe2,
  Cpu,
  BarChart2,
  Calendar,
  Filter,
  CheckCircle2,
  Flame,
  ArrowUpRight
} from 'lucide-react';

interface TerminalCommandCenterProps {
  companies: Company[];
  selectedCompany: Company;
  onSelectCompany: (company: Company) => void;
}

export const TerminalCommandCenterView: React.FC<TerminalCommandCenterProps> = ({
  companies,
  selectedCompany,
  onSelectCompany
}) => {
  const [activeSection, setActiveSection] = useState<'iot_command' | 'efferd_quadrants'>('iot_command');

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1017] border border-white/10 rounded-lg p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-tight font-mono uppercase">
              Terminal Command Center & Microstructure Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional real-time visual consoles modeled directly on the uploaded high-density design specifications
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#07090e] rounded border border-white/5 text-xs font-mono">
          <button
            onClick={() => setActiveSection('iot_command')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeSection === 'iot_command'
                ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            IoT Command Display (DataV Style)
          </button>
          <button
            onClick={() => setActiveSection('efferd_quadrants')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeSection === 'efferd_quadrants'
                ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Efferd 4-Quadrant Dashboards
          </button>
        </div>
      </div>

      {/* SECTION 1: IoT Operations Command (Exact Layout of download.jpg) */}
      {activeSection === 'iot_command' && (
        <div className="bg-[#05060a] border border-white/10 rounded-lg p-5 text-slate-300 font-sans relative overflow-hidden select-none">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-rose-500 rounded flex items-center justify-center font-bold text-rose-500 text-xs">
                U
              </div>
              <h1 className="text-lg font-bold text-white tracking-wider font-mono">
                NSE 量化终端 · 市场运行大盘 / Quant Telemetry Command
              </h1>
              <div className="hidden sm:flex items-center gap-1 ml-4 text-[11px] font-mono">
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded">
                  全网视角
                </span>
                <span className="px-2 py-0.5 bg-white/5 text-slate-400 rounded">
                  全样视角
                </span>
              </div>
            </div>

            <div className="text-right font-mono text-xs">
              <div className="text-rose-400 font-bold tracking-wider">DATAV · NSE QUANT</div>
              <div className="text-[10px] text-slate-500">CLOUD TERMINAL IoT</div>
            </div>
          </div>

          {/* 3-Column Main Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            {/* Left Column: Equipment Classification & Provincial Ranking */}
            <div className="space-y-6 lg:col-span-1">
              {/* Classification Radial Widget */}
              <div className="p-3 bg-[#0a0d14] border border-white/5 rounded">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200 mb-2">
                  <span className="text-rose-500">❖</span> 设备 / 标的分类 (SCOM / EQTY / KCB / EABL)
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-rose-500"
                        strokeDasharray="65, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-sm font-bold font-mono text-white">42%</span>
                      <div className="text-[8px] text-slate-400 font-mono">TYPE_S</div>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono space-y-1 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-rose-500 rounded-xs" />
                      <span>SCOM: 335.40B KES</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-rose-400 rounded-xs" />
                      <span>EQTY: 183.20B KES</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-500 rounded-xs" />
                      <span>KCB: 191.60B KES</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-slate-600 rounded-xs" />
                      <span>EABL: 124.10B KES</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Provincial Top 5 Rankings */}
              <div className="p-3 bg-[#0a0d14] border border-white/5 rounded">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-200 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-500">❖</span> 区域在线交易活跃度 TOP5
                  </div>
                  <span className="text-[10px] text-slate-500">SETTLED</span>
                </div>

                <div className="space-y-1.5 text-[10px] font-mono">
                  {[
                    { name: 'Nairobi Central', count: '142,425 件', pct: '88%' },
                    { name: 'Mombasa Port', count: '89,945 件', pct: '65%' },
                    { name: 'Kisumu Hub', count: '54,230 件', pct: '45%' },
                    { name: 'Nakuru Valley', count: '42,120 件', pct: '38%' },
                    { name: 'Eldoret North', count: '28,450 件', pct: '24%' }
                  ].map((row, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <span className="w-20 text-slate-400 truncate">{row.name}</span>
                      <div className="flex-1 bg-white/5 h-2 rounded overflow-hidden">
                        <div className="bg-rose-500 h-full rounded" style={{ width: row.pct }} />
                      </div>
                      <span className="text-slate-200 w-16 text-right tabular-nums">{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 30-Day Indicator Trend Wave */}
              <div className="p-3 bg-[#0a0d14] border border-white/5 rounded">
                <div className="text-xs font-mono font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                  <span className="text-rose-500">❖</span> 30日 核心流动性指标趋势
                </div>
                <div className="h-16 relative">
                  <svg className="w-full h-full" viewBox="0 0 200 60">
                    <path
                      d="M0,45 Q30,20 60,35 T120,25 T160,40 T200,15 L200,60 L0,60 Z"
                      fill="rgba(244,63,94,0.15)"
                    />
                    <path
                      d="M0,45 Q30,20 60,35 T120,25 T160,40 T200,15"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Central Stage: The 3D Orbital Concentric Globe */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center relative py-6">
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
                {/* Outer Segmented Dashed Arc */}
                <div className="absolute inset-0 rounded-full border border-white/10 border-dashed animate-[spin_60s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border border-rose-500/20" />
                <div className="absolute inset-8 rounded-full border border-white/5" />

                {/* Concentric Segmented Gauges */}
                <svg className="w-full h-full absolute inset-0 select-none pointer-events-none" viewBox="0 0 300 300">
                  <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,8" />
                  <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(244,63,94,0.4)" strokeWidth="3" strokeDasharray="30,120" />
                  <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1="150" y1="10" x2="150" y2="290" stroke="rgba(255,255,255,0.08)" strokeDasharray="2,4" />
                  <line x1="10" y1="150" x2="290" y2="150" stroke="rgba(255,255,255,0.08)" strokeDasharray="2,4" />
                  <circle cx="150" cy="150" r="80" fill="none" stroke="rgba(244,63,94,0.3)" strokeWidth="1" strokeDasharray="6,6" />
                </svg>

                {/* Central Wireframe Globe Core */}
                <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border border-white/20 bg-gradient-to-b from-[#111420] via-[#090b12] to-[#040508] shadow-[0_0_50px_rgba(244,63,94,0.15)] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                  <Globe2 className="w-24 h-24 text-rose-500/40 animate-pulse" />
                  <div className="absolute text-center">
                    <div className="text-[10px] font-mono text-slate-400">NSE CAPITAL BASE</div>
                    <div className="text-xl font-bold font-mono text-white tracking-wider">
                      1.10 <span className="text-rose-400 text-sm">Trillion</span>
                    </div>
                    <div className="text-[9px] font-mono text-emerald-400 mt-0.5">4 NATIVE EQUITIES</div>
                  </div>
                </div>

                {/* Floating Telemetry Callout Bars */}
                <div className="absolute -left-2 top-1/4 bg-[#0a0d14]/90 border border-white/10 px-2.5 py-1 rounded text-[10px] font-mono text-slate-300 shadow-lg">
                  SCOM <span className="text-rose-400 font-bold">699.14B KES</span>
                </div>
                <div className="absolute -left-2 top-2/4 bg-[#0a0d14]/90 border border-white/10 px-2.5 py-1 rounded text-[10px] font-mono text-slate-300 shadow-lg">
                  EQTY <span className="text-sky-400 font-bold">167.92B KES</span>
                </div>
                <div className="absolute -right-2 top-1/3 bg-rose-600 text-white px-3 py-1 rounded text-[10px] font-mono font-bold shadow-lg flex items-center gap-1">
                  <span>重载设备: 6.85万件</span>
                </div>
                <div className="absolute -right-2 bottom-1/4 bg-[#0a0d14]/90 border border-white/10 px-2.5 py-1 rounded text-[10px] font-mono text-slate-300 shadow-lg">
                  KCB <span className="text-amber-400 font-bold">115.04B KES</span>
                </div>
              </div>
            </div>

            {/* Right Column: 24h Usage Curve & Reconnection Stats */}
            <div className="space-y-6 lg:col-span-1">
              {/* 24-hr Equipment Usage Area Chart */}
              <div className="p-3 bg-[#0a0d14] border border-white/5 rounded">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-200 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-500">❖</span> 24小时设备/结算使用情况
                  </div>
                  <span className="text-[10px] text-rose-400">PEAK</span>
                </div>
                <div className="h-24">
                  <svg className="w-full h-full" viewBox="0 0 200 80">
                    <path
                      d="M0,60 Q30,50 60,65 T120,40 T160,45 T180,20 T200,10 L200,80 L0,80 Z"
                      fill="rgba(244,63,94,0.35)"
                    />
                    <path
                      d="M0,60 Q30,50 60,65 T120,40 T160,45 T180,20 T200,10"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* Reconnection Statistics Table */}
              <div className="p-3 bg-[#0a0d14] border border-white/5 rounded">
                <div className="text-xs font-mono font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <span className="text-rose-500">❖</span> 重新连接/节点清算统计
                </div>

                <div className="space-y-1 text-[10px] font-mono">
                  {[
                    { id: '6', label: '智能服务器', count: '600', diff: '-25%' },
                    { id: '7', label: '核心交易引擎', count: '600', diff: '-35%', active: true },
                    { id: '8', label: '行情分发网关', count: '600', diff: '-35%', active: true },
                    { id: '9', label: '清算存管中心', count: '600', diff: '-35%', active: true },
                    { id: '10', label: 'CBK结算通道', count: '600', diff: '-20%' }
                  ].map(row => (
                    <div
                      key={row.id}
                      className={`flex items-center justify-between px-2 py-1 rounded ${
                        row.active ? 'bg-rose-950/40 text-rose-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      <span className="w-4">{row.id}</span>
                      <span className="flex-1">{row.label}</span>
                      <span className="w-12 text-right">{row.count}</span>
                      <span className="w-12 text-right text-rose-400">{row.diff}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Running Metrics Ticker Bar */}
          <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-[#0a0d14] rounded border border-white/5">
              <div className="text-[10px] text-slate-400">设备在线时长</div>
              <div className="text-sm font-bold text-rose-400 mt-0.5">1,542.10小时</div>
              <div className="text-[9px] text-slate-500">平均: 144.00小时</div>
            </div>

            <div className="p-2.5 bg-[#0a0d14] rounded border border-white/5">
              <div className="text-[10px] text-slate-400">电水壶 (Node A)</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">1,651 件</div>
              <div className="text-[9px] text-slate-500">测试 144件</div>
            </div>

            <div className="p-2.5 bg-[#0a0d14] rounded border border-white/5">
              <div className="text-[10px] text-slate-400">电水壶 (Node B)</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">1,651 件</div>
              <div className="text-[9px] text-slate-500">测试 144件</div>
            </div>

            <div className="p-2.5 bg-[#0a0d14] rounded border border-white/5">
              <div className="text-[10px] text-slate-400">电水壶 (Node C)</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">1,651 件</div>
              <div className="text-[9px] text-slate-500">测试 144件</div>
            </div>

            <div className="p-2.5 bg-[#0a0d14] rounded border border-white/5">
              <div className="text-[10px] text-slate-400">空调 (Equities Server)</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">1,651 件</div>
              <div className="text-[9px] text-slate-500">测试 144件</div>
            </div>

            <div className="p-2.5 bg-[#0a0d14] rounded border border-white/5">
              <div className="text-[10px] text-slate-400">取暖器 (Clearing Node)</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">1,651 件</div>
              <div className="text-[9px] text-slate-500">测试 144件</div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Efferd 4-Quadrant Dashboards (Exact Layout of Efferd (@efferdco) on X.jpg) */}
      {activeSection === 'efferd_quadrants' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 select-none font-sans">
          {/* Quadrant 1: Top Left - Revenue over time with Leads & Retention */}
          <div className="bg-[#0e1118] border border-white/10 rounded-xl p-5 space-y-4">
            {/* Top search & mini bar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-xs font-mono font-bold">⌘</span>
                <span className="text-xs font-semibold text-white">Dashboard</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">Efferd CRM Engine</div>
            </div>

            {/* 3 KPI Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#141824] p-3 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400">Leads</div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">129</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">▲ +4% vs last week</div>
              </div>
              <div className="bg-[#141824] p-3 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400">Conversion Rate</div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">24%</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">▲ +2.0%</div>
              </div>
              <div className="bg-[#141824] p-3 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400">Deal Cycle</div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">14d</div>
                <div className="text-[10px] text-rose-400 font-mono mt-0.5">▼ -1d vs target</div>
              </div>
            </div>

            {/* Revenue over Time Chart with Tooltip */}
            <div className="bg-[#141824] p-4 rounded-lg border border-white/5 relative">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Revenue over time</div>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">$30,240 <span className="text-xs text-slate-400 font-normal">/ KES 3.93M</span></div>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">▲ 7.6% vs last month</span>
              </div>

              <div className="h-32 relative">
                <svg className="w-full h-full" viewBox="0 0 300 100">
                  <defs>
                    <linearGradient id="efferdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,70 Q50,40 100,55 T200,30 T300,50 L300,100 L0,100 Z"
                    fill="url(#efferdGrad)"
                  />
                  <path
                    d="M0,70 Q50,40 100,55 T200,30 T300,50"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {/* Tooltip point at Feb 17 */}
                  <circle cx="100" cy="55" r="4" fill="#ffffff" />
                  <line x1="100" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,0.2)" strokeDasharray="2,2" />
                </svg>

                {/* Floating Tooltip Pill */}
                <div className="absolute top-2 left-20 bg-white text-slate-900 px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-md">
                  Tue, Feb 17 · Revenue $28,317
                </div>
              </div>
            </div>

            {/* Retention Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#141824] p-3 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400">Retention Rate</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">95%</div>
                <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                  <span>Enterprise</span>
                  <span>·</span>
                  <span>SMEs</span>
                </div>
              </div>
              <div className="bg-[#141824] p-3 rounded-lg border border-white/5 flex flex-col justify-between">
                <div className="text-[10px] text-slate-400">Leads Management</div>
                <div className="flex items-center gap-1 h-3 mt-1 bg-white/5 rounded overflow-hidden">
                  <div className="bg-emerald-400 h-full w-3/5" />
                  <div className="bg-sky-400 h-full w-1/4" />
                  <div className="bg-amber-400 h-full w-3/20" />
                </div>
                <div className="text-[9px] text-slate-400 mt-1">Open: 114 · Qualified: 62</div>
              </div>
            </div>
          </div>

          {/* Quadrant 2: Top Right - Funnel Analysis Flow & Heatmap */}
          <div className="bg-[#0e1118] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-300" />
                <span className="text-xs font-semibold text-white">Overview & Funnel Conversion</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">7.8% Purchase Rate</span>
            </div>

            {/* Exact SVG Funnel Flow (Product views -> Add to cart -> Checkout -> Purchase) */}
            <div className="bg-[#141824] p-4 rounded-lg border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-mono mb-2">Conversion Stream Funnel</div>
              <div className="relative h-24 flex items-center justify-between px-2 font-mono">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <path
                    d="M 10,10 L 100,25 L 220,38 L 360,45 L 360,55 L 220,62 L 100,75 L 10,90 Z"
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                  />
                  <path
                    d="M 10,25 L 100,35 L 220,44 L 360,48 L 360,52 L 220,56 L 100,65 L 10,75 Z"
                    fill="rgba(255,255,255,0.12)"
                  />
                </svg>

                <div className="z-10 text-center">
                  <div className="text-xs font-bold text-white">100%</div>
                  <div className="text-[9px] text-slate-400">72K Views</div>
                </div>
                <div className="z-10 text-center">
                  <div className="text-xs font-bold text-white">53%</div>
                  <div className="text-[9px] text-slate-400">38.2K Cart</div>
                </div>
                <div className="z-10 text-center">
                  <div className="text-xs font-bold text-white">23%</div>
                  <div className="text-[9px] text-slate-400">16.8K Check</div>
                </div>
                <div className="z-10 text-center">
                  <div className="text-xs font-bold text-emerald-400">8%</div>
                  <div className="text-[9px] text-slate-400">5.6K Paid</div>
                </div>
              </div>
            </div>

            {/* Sales by Hour Heatmap Matrix */}
            <div className="bg-[#141824] p-4 rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Sales by Hour Heatmap</div>
                <div className="text-xs font-bold font-mono text-white">$4.8K Peak</div>
              </div>

              <div className="grid grid-cols-12 gap-1 h-14">
                {Array.from({ length: 48 }).map((_, i) => {
                  const opacities = [0.08, 0.15, 0.35, 0.65, 0.9, 0.25, 0.45];
                  const op = opacities[(i * 3 + 2) % opacities.length];
                  return (
                    <div
                      key={i}
                      className="rounded-xs bg-white transition-opacity hover:opacity-100"
                      style={{ opacity: op }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>
          </div>

          {/* Quadrant 3: Bottom Left - Gross Revenue vs Yesterday High-Density Bars */}
          <div className="bg-[#0e1118] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="text-xs font-bold text-white font-mono">Efferd Quant · High Frequency Execution</div>
              <button className="px-2 py-0.5 bg-white/5 text-[10px] rounded border border-white/10 text-slate-300">
                Customize
              </button>
            </div>

            {/* 4 Cards */}
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="bg-[#141824] p-2 rounded border border-white/5">
                <div className="text-[9px] text-slate-400">Active Orders</div>
                <div className="text-sm font-bold text-white mt-0.5">24</div>
                <div className="text-[8px] text-emerald-400">▲ +12.4%</div>
              </div>
              <div className="bg-[#141824] p-2 rounded border border-white/5">
                <div className="text-[9px] text-slate-400">Executed</div>
                <div className="text-sm font-bold text-white mt-0.5">147</div>
                <div className="text-[8px] text-emerald-400">▲ +7.8%</div>
              </div>
              <div className="bg-[#141824] p-2 rounded border border-white/5">
                <div className="text-[9px] text-slate-400">Volume</div>
                <div className="text-sm font-bold text-white mt-0.5">412.8K</div>
                <div className="text-[8px] text-emerald-400">▲ +4.2%</div>
              </div>
              <div className="bg-[#141824] p-2 rounded border border-white/5">
                <div className="text-[9px] text-slate-400">Spread</div>
                <div className="text-sm font-bold text-white mt-0.5">4.18%</div>
                <div className="text-[8px] text-rose-400">▼ -0.8%</div>
              </div>
            </div>

            {/* Today Gross Revenue & Dense Bar Chart */}
            <div className="bg-[#141824] p-4 rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Gross Revenue Comparison</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xl font-bold font-mono text-white">$243.65</span>
                    <span className="text-xs text-slate-400 font-mono">Yesterday $208.19</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  ▲ +17.0%
                </span>
              </div>

              {/* Dense Vertical Bars */}
              <div className="h-28 flex items-end gap-1.5 pt-2">
                {[
                  35, 45, 28, 60, 52, 40, 75, 68, 85, 92, 78, 95, 88, 70, 82, 90, 84, 98,
                  76, 64, 80, 89, 72, 60
                ].map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-slate-600 to-slate-200 hover:from-emerald-600 hover:to-emerald-300 rounded-xs transition-all cursor-pointer"
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quadrant 4: Bottom Right - Good Morning, Speedometer & Budget Runway */}
          <div className="bg-[#0e1118] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="text-xs font-bold text-white font-mono">Good morning, Portfolio Executive</div>
              <span className="text-[11px] text-slate-400 font-mono">Apr 16 – May 15 · Last 30 Days</span>
            </div>

            {/* 3 Top Badges */}
            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="bg-[#141824] p-3 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400">Repeat Purchase</div>
                <div className="text-lg font-bold text-white mt-0.5">38.4%</div>
                <div className="text-[9px] text-emerald-400 mt-0.5">▲ +2.7% vs 30d</div>
              </div>
              <div className="bg-[#141824] p-3 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400">Total Orders</div>
                <div className="text-lg font-bold text-white mt-0.5">1,842</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Settled NSE</div>
              </div>
              <div className="bg-[#141824] p-3 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400">Average Order</div>
                <div className="text-lg font-bold text-white mt-0.5">$154.60</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Per Ticket</div>
              </div>
            </div>

            {/* Circular Speedometer Gauge + MRR */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="bg-[#141824] p-4 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400 font-mono">MONTHLY RECURRING REVENUE</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">$92K</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">▲ 27.4% over last 30 days</div>
                <div className="h-14 mt-2">
                  <svg className="w-full h-full" viewBox="0 0 150 50">
                    <path d="M0,35 Q40,25 75,30 T150,15" fill="none" stroke="#34d399" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Radial Speedometer Gauge */}
              <div className="bg-[#141824] p-4 rounded-lg border border-white/5 flex flex-col items-center justify-center text-center">
                <div className="relative w-28 h-16 overflow-hidden">
                  <svg className="w-28 h-28 -rotate-180" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeDasharray="125 125" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="95 125" strokeLinecap="round" />
                  </svg>
                  <div className="absolute bottom-0 inset-x-0 text-center">
                    <span className="text-xs font-bold font-mono text-white">$284,320</span>
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 font-mono uppercase mt-1">Total Gross Revenue</div>
              </div>
            </div>

            {/* AI Insights & Unused Budget Runway Bar */}
            <div className="p-3 bg-gradient-to-r from-emerald-950/30 to-transparent border border-emerald-500/20 rounded-lg text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> AI Insight
                </span>
                <span className="text-white font-bold">$50,734 Budget Usage</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Unused budget runway improved by <strong className="text-emerald-400">3.5%</strong> this month vs trailing burn rate. Active customers: <strong className="text-white">2,540</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
