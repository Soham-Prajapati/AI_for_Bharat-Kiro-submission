'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

export interface TrendDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface TrendSeries {
  key: string;
  name: string;
  color: string;
  gradient?: boolean;
}

export interface TrendChartProps {
  data: TrendDataPoint[];
  series: TrendSeries[];
  title?: string;
  height?: number;
  loading?: boolean;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
  className?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  formatter,
}: TooltipProps<number, string> & { formatter?: (value: number) => string }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white text-sm font-medium">
            {entry.name}:
          </span>
          <span className="text-white text-sm font-bold">
            {formatter ? formatter(entry.value as number) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function TrendChart({
  data,
  series,
  title,
  height = 400,
  loading = false,
  yAxisFormatter,
  tooltipFormatter,
  className = '',
}: TrendChartProps) {
  if (loading) {
    return (
      <div
        className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${className}`}
      >
        {title && <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>}
        <div className="animate-pulse" style={{ height }}>
          <div className="h-full bg-gray-700/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${className}`}
      >
        {title && <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>}
        <div
          className="flex items-center justify-center text-gray-500"
          style={{ height }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${className}`}
      role="region"
      aria-label={title || 'Trend chart'}
    >
      {title && <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            {series.map((s) => (
              s.gradient && (
                <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.1} />
                </linearGradient>
              )
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={yAxisFormatter}
          />
          <Tooltip
            content={<CustomTooltip formatter={tooltipFormatter} />}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={{ fill: s.color, r: 4 }}
              activeDot={{ r: 6 }}
              name={s.name}
              fill={s.gradient ? `url(#gradient-${s.key})` : undefined}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
