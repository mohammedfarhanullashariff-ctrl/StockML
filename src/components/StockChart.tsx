
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Line, ComposedChart, Bar, ReferenceLine 
} from 'recharts';
import { PricePoint } from '../lib/indicators';
import { formatCurrency, formatCompactNumber } from '../lib/utils';

interface StockChartProps {
  data: PricePoint[];
  symbol: string;
  showSMA: boolean;
  showRSI: boolean;
  showMACD: boolean;
}

export default function StockChart({ data, symbol, showSMA, showRSI, showMACD }: StockChartProps) {
  // Extract historical vs predicted
  const historical = data.filter(d => !d.predicted);
  const predicted = data.filter(d => !!d.predicted);
  const fullData = data;

  const minPrice = Math.min(...fullData.map(d => d.close)) * 0.98;
  const maxPrice = Math.max(...fullData.map(d => d.close)) * 1.02;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-white/10 p-3 rounded shadow-xl text-xs space-y-1">
          <p className="font-bold text-zinc-400 mb-1">{label}</p>
          {payload.map((p: any) => (
            <div key={p.name} className="flex justify-between gap-4">
              <span style={{ color: p.color }}>{p.name}:</span>
              <span className="font-mono">{formatCurrency(p.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex-1 min-h-[400px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={fullData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#4b5563" 
              fontSize={9}
              tickLine={false}
              axisLine={false}
              minTickGap={60}
            />
            <YAxis 
              domain={[minPrice, maxPrice]} 
              stroke="#4b5563" 
              fontSize={9}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${formatCompactNumber(val)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Price Areas */}
            <Area 
              name="Market Price"
              type="monotone" 
              dataKey="close" 
              stroke="#22c55e" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: '#22c55e' }}
              data={historical}
              isAnimationActive={false}
            />
            
            <Area 
              name="ML Prediction"
              type="monotone" 
              dataKey="close" 
              stroke="#3b82f6" 
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1} 
              fill="url(#colorPredicted)" 
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: '#3b82f6' }}
              data={predicted}
              isAnimationActive={false}
            />

            {showSMA && (
              <Line 
                name="SMA 20"
                type="monotone" 
                dataKey="sma20" 
                stroke="#60a5fa" 
                dot={false} 
                strokeWidth={1}
                strokeOpacity={0.6}
              />
            )}

            <Bar 
              name="Volume"
              dataKey="volume" 
              fill="#27272a" 
              opacity={0.3} 
              yAxisId="volume" 
            />
            <YAxis yAxisId="volume" hide />

            <ReferenceLine x={historical[historical.length - 1]?.date} stroke="#52525b" strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {showRSI && (
        <div className="h-24 opacity-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fullData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Overbought', position: 'insideTopLeft', fill: '#ef4444', fontSize: 8 }} />
              <ReferenceLine y={30} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Oversold', position: 'insideBottomLeft', fill: '#3b82f6', fontSize: 8 }} />
              <Area type="monotone" dataKey="rsi" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} dot={false} name="RSI" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {showMACD && (
        <div className="h-24 opacity-60">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={fullData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="histogram" fill={(d: any) => d >= 0 ? '#10b981' : '#ef4444'} name="Histogram" />
              <Line type="monotone" dataKey="macd" stroke="#60a5fa" dot={false} strokeWidth={1} name="MACD" />
              <Line type="monotone" dataKey="signal" stroke="#f59e0b" dot={false} strokeWidth={1} name="Signal" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
