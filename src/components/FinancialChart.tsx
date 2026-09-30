import React, { useState } from 'react';
import { formatKES, formatPercent } from '../engine/formatters';

interface DataPoint {
  label: string;
  value: number;
  value2?: number;
  value3?: number;
}

interface FinancialChartProps {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  type?: 'area' | 'bar' | 'multi-bar' | 'multi-line';
  valuePrefix?: string;
  valueSuffix?: string;
  isPercent?: boolean;
  isCurrency?: boolean;
  color?: string; // hex or tailwind class
  color2?: string;
  color3?: string;
  legend?: { series1: string; series2?: string; series3?: string };
  height?: number;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({
  title,
  subtitle,
  data,
  type = 'area',
  isPercent = false,
  isCurrency = true,
  color = '#10b981', // emerald
  color2 = '#38bdf8', // sky
  color3 = '#f59e0b', // amber
  legend,
  height = 200
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#121620] border border-white/5 rounded p-4 text-xs text-slate-500">
        No time-series data available
      </div>
    );
  }

  // Calculate scales
  const allValues = data.flatMap(d => [d.value, d.value2 ?? d.value, d.value3 ?? d.value]);
  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(...allValues) * 1.15;
  const range = maxVal - minVal || 1;

  const width = 500;
  const chartHeight = height;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const getX = (idx: number) => padding.left + (idx / Math.max(1, data.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minVal) / range) * innerHeight;

  // Path generator for line/area
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPath = `${points} L ${getX(data.length - 1)},${padding.top + innerHeight} L ${getX(0)},${padding.top + innerHeight} Z`;

  // Secondary points if any
  const points2 = data.some(d => d.value2 !== undefined)
    ? data.map((d, i) => `${getX(i)},${getY(d.value2 ?? 0)}`).join(' ')
    : '';

  const formatVal = (v: number) => {
    if (isPercent) return formatPercent(v, 1);
    if (isCurrency) return formatKES(v, { compact: true });
    return v.toLocaleString();
  };

  return (
    <div className="bg-[#121622] border border-white/8 rounded p-4 flex flex-col justify-between hover:border-white/15 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">{title}</h4>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {legend && (
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {legend.series1}
            </span>
            {legend.series2 && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color2 }} />
                {legend.series2}
              </span>
            )}
            {legend.series3 && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color3 }} />
                {legend.series3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id={`grad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, i) => {
            const y = padding.top + innerHeight * (1 - ratio);
            const val = minVal + range * ratio;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono tabular-nums"
                >
                  {formatVal(val)}
                </text>
              </g>
            );
          })}

          {/* Area & Line */}
          {type === 'area' && (
            <>
              <path d={areaPath} fill={`url(#grad-${title.replace(/\s+/g, '')})`} />
              <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </>
          )}

          {/* Bar Chart */}
          {type === 'bar' &&
            data.map((d, i) => {
              const barWidth = (innerWidth / data.length) * 0.55;
              const x = padding.left + (i + 0.22) * (innerWidth / data.length);
              const barHeight = Math.max(2, ((d.value - minVal) / range) * innerHeight);
              const y = padding.top + innerHeight - barHeight;
              const isHovered = hoveredIdx === i;

              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={isHovered ? '#34d399' : color}
                  rx="2"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}

          {/* Multi-Bar */}
          {type === 'multi-bar' &&
            data.map((d, i) => {
              const slotWidth = innerWidth / data.length;
              const subWidth = slotWidth * 0.35;
              const x1 = padding.left + i * slotWidth + slotWidth * 0.12;
              const x2 = x1 + subWidth + 3;

              const h1 = Math.max(2, ((d.value - minVal) / range) * innerHeight);
              const y1 = padding.top + innerHeight - h1;

              const val2 = d.value2 ?? 0;
              const h2 = Math.max(2, ((val2 - minVal) / range) * innerHeight);
              const y2 = padding.top + innerHeight - h2;

              return (
                <g key={i}>
                  <rect x={x1} y={y1} width={subWidth} height={h1} fill={color} rx="1" />
                  <rect x={x2} y={y2} width={subWidth} height={h2} fill={color2} rx="1" />
                </g>
              );
            })}

          {/* Multi-Line */}
          {type === 'multi-line' && (
            <>
              <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                strokeLinecap="round"
              />
              {points2 && (
                <polyline
                  fill="none"
                  stroke={color2}
                  strokeWidth="2"
                  points={points2}
                  strokeLinecap="round"
                />
              )}
            </>
          )}

          {/* Data point markers */}
          {type === 'area' &&
            data.map((d, i) => (
              <circle
                key={i}
                cx={getX(i)}
                cy={getY(d.value)}
                r={hoveredIdx === i ? 5 : 3.5}
                fill={color}
                stroke="#0b0e14"
                strokeWidth="2"
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}

          {/* X Axis Labels */}
          {data.map((d, i) => {
            const x = type === 'bar' || type === 'multi-bar'
              ? padding.left + (i + 0.5) * (innerWidth / data.length)
              : getX(i);
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 6}
                textAnchor="middle"
                className="text-[10px] fill-slate-300 font-mono"
              >
                {d.label}
              </text>
            );
          })}
        </svg>

        {/* Floating tooltip */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div
            className="absolute top-2 bg-[#090d16]/95 border border-white/20 shadow-xl rounded px-2.5 py-1.5 pointer-events-none text-xs z-10 font-mono tabular-nums"
            style={{
              left: `${Math.min(75, Math.max(10, (hoveredIdx / data.length) * 100))}%`
            }}
          >
            <div className="text-[10px] text-slate-300 font-medium">{data[hoveredIdx].label}</div>
            <div className="text-emerald-400 font-semibold">{formatVal(data[hoveredIdx].value)}</div>
            {data[hoveredIdx].value2 !== undefined && (
              <div className="text-sky-400 text-[11px]">{formatVal(data[hoveredIdx].value2!)}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
