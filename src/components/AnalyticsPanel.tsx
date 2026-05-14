
import React, { useEffect, useState } from 'react';
import { Brain, Quote, Newspaper, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { analyzeSentiment, SentimentResult, getMLExplanation } from '../services/ai';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyticsPanelProps {
  symbol: string;
  companyName: string;
  predictions: any[];
}

export default function AnalyticsPanel({ symbol, companyName, predictions }: AnalyticsPanelProps) {
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [reasoning, setReasoning] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [sent, reason] = await Promise.all([
        analyzeSentiment(symbol, companyName),
        getMLExplanation(symbol, predictions)
      ]);
      setSentiment(sent);
      setReasoning(reason);
      setLoading(false);
    }
    fetchData();
  }, [symbol, companyName]);

  const sevenDay = predictions[6]?.close;
  const thirtyDay = predictions[29]?.close;
  const ninetyDay = predictions[89]?.close;
  const currentPrice = predictions[0]?.close;

  return (
    <div className="h-full border-l border-[#1f2937] bg-[#121214] p-5 overflow-y-auto custom-scrollbar">
      <div className="space-y-6">
        {/* ML Forecast Summary */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#1f2937] pb-2">Predictive Logic Engine</h2>
          
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: '7-Day Forecast', value: sevenDay },
              { label: '30-Day Forecast', value: thirtyDay },
              { label: '90-Day Forecast', value: ninetyDay },
            ].map((item) => {
              const change = ((item.value - currentPrice) / currentPrice) * 100;
              return (
                <div key={item.label} className="bg-[#1c1c1f] p-3 rounded flex justify-between items-center border border-white/5">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none mb-1">{item.label}</p>
                    <p className="text-lg font-mono font-bold text-white tracking-tighter">{formatCurrency(item.value)}</p>
                  </div>
                  <div className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded font-mono",
                    change >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                  )}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#0a0a0b] p-3 border-l-2 border-blue-500 rounded-r shadow-inner">
            <div className="flex items-center gap-1.5 mb-1.5 opacity-50">
              <ShieldCheck className="w-3 h-3 text-blue-500" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Model Synthesis</span>
            </div>
            {loading ? (
              <div className="h-3 w-full bg-[#1c1c1f] animate-pulse rounded" />
            ) : (
              <p className="text-[11px] text-gray-400 leading-relaxed italic pr-2">"{reasoning}"</p>
            )}
          </div>
        </section>

        {/* Sentiment Analysis */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#1f2937] pb-2">Sentiment Distribution</h2>

          <div className="flex flex-col items-center gap-3 bg-[#1c1c1f] p-4 rounded-lg">
             <div className="text-3xl font-mono tracking-tighter" style={{ color: sentiment?.label === 'Bullish' ? '#4ade80' : sentiment?.label === 'Bearish' ? '#f87171' : '#9ca3af' }}>
              {Math.abs((sentiment?.score || 0) * 100).toFixed(1)}%
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-green-500 transition-all duration-1000" 
                style={{ width: `${Math.max(10, (50 + (sentiment?.score || 0) * 50))}%` }}
              />
              <div 
                className="h-full bg-red-500 transition-all duration-1000" 
                style={{ width: `${Math.max(10, (50 - (sentiment?.score || 0) * 50))}%` }}
              />
            </div>
            <div className="flex justify-between w-full text-[9px] font-bold font-mono text-gray-500 tracking-widest">
              <span>BULLISH</span>
              <span className="text-gray-400">{sentiment?.label || 'NEUTRAL'}</span>
              <span>BEARISH</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed px-1">
            {loading ? "Aggregating semantic signals..." : sentiment?.summary}
          </p>
        </section>

        {/* Signals */}
        <section className="space-y-3 pb-6">
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#1f2937] pb-2">Neural Signals</h2>
          <div className="space-y-2">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-10 bg-[#1c1c1f] animate-pulse rounded" />)
            ) : (
              sentiment?.headlines.map((headline, i) => (
                <div key={i} className="group p-2.5 bg-[#1c1c1f]/40 hover:bg-[#1c1c1f] transition-all border border-white/5 rounded flex gap-3 cursor-pointer">
                  <div className={cn(
                    "w-0.5 h-auto rounded-full transition-colors",
                    i % 2 === 0 ? "bg-blue-500" : "bg-green-500"
                  )} />
                  <p className="text-[11px] text-gray-400 group-hover:text-gray-200 leading-snug">{headline}</p>
                </div>
              ))
            )}
          </div>
          
          <button className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 mt-4 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_#2563eb33] hover:shadow-[0_0_20px_#2563eb66]">
            Execute Prediction Model
          </button>
        </section>
      </div>
    </div>
  );
}
