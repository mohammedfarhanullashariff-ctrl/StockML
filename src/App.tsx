
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StockChart from './components/StockChart';
import AnalyticsPanel from './components/AnalyticsPanel';
import { STOCKS, StockData } from './data/stocks';
import { generateHistoricalData, generatePredictions, PricePoint } from './lib/indicators';
import { formatCurrency, cn, formatCompactNumber } from './lib/utils';
import { Star, BarChart3, LineChart, Activity, Info, Settings2, Share2, Bell, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AlertsModal, { PriceAlert } from './components/AlertsModal';

export default function App() {
  const [selectedStock, setSelectedStock] = useState<StockData>(STOCKS[STOCKS.length - 1]); // TCS as default
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('alerts');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'alert' }[]>([]);

  const [showSMA, setShowSMA] = useState(true);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('alerts', JSON.stringify(alerts));
    
    // Simulate periodic check (since price is stable in this session)
    // We trigger a notification if a new alert is set that is already met
    const timer = setInterval(() => {
      const triggered = alerts.find(a => {
        const stock = STOCKS.find(s => s.symbol === a.symbol);
        if (!stock || !a.isActive) return false;
        return a.type === 'above' 
          ? stock.lastTradedPrice >= a.threshold 
          : stock.lastTradedPrice <= a.threshold;
      });

      if (triggered) {
        // Find notification for this alert to avoid duplicates in one session
        if (!notifications.some(n => n.message.includes(triggered.symbol))) {
          const newNotification = {
            id: Math.random().toString(),
            message: `URGENT: ${triggered.symbol} has crossed your ${triggered.type} threshold of ${formatCurrency(triggered.threshold)}`,
            type: 'alert' as const
          };
          setNotifications(prev => [...prev, newNotification]);
          
          // Deactivate it so it doesn't spam
          setAlerts(prev => prev.map(al => al.id === triggered.id ? { ...al, isActive: false } : al));
        }
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [alerts, notifications]);

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const addAlert = (newAlert: Omit<PriceAlert, 'id' | 'createdAt'>) => {
    const alert: PriceAlert = {
      ...newAlert,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    setAlerts(prev => [...prev, alert]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const chartData = useMemo(() => {
    const historical = generateHistoricalData(selectedStock.previousClose);
    const predictions = generatePredictions(selectedStock.lastTradedPrice, selectedStock.percentageChange);
    return [...historical, ...predictions];
  }, [selectedStock.symbol]);

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-white font-sans selection:bg-blue-500/30 overflow-hidden">
      <Sidebar 
        selectedSymbol={selectedStock.symbol} 
        onSelect={setSelectedStock}
        watchlist={watchlist}
        onToggleWatchlist={toggleWatchlist}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0b] relative">
        {/* Notifications Toast */}
        <div className="fixed top-20 right-8 z-[100] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {notifications.map(notif => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#1c1c1f] border-l-4 border-amber-500 p-4 rounded shadow-2xl flex items-center gap-4 pointer-events-auto max-w-sm"
              >
                <div className="p-2 bg-amber-500/10 rounded-full text-amber-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-white leading-snug">{notif.message}</p>
                </div>
                <button onClick={() => removeNotification(notif.id)} className="text-zinc-600 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Header */}
        <header className="h-[60px] border-b border-[#1f2937] px-6 flex items-center justify-between bg-[#121214] shrink-0">
          <div className="flex items-center gap-6">
            <h1 className="text-[11px] font-semibold tracking-widest text-[#6b7280] uppercase">Predictive Analytics Suite v2.4</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Market Live</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-500">
             <div className="bg-[#1c1c1f] border border-[#1f2937] px-3 py-1 rounded flex items-center gap-3">
              <span className="text-[10px] text-gray-400">Search Ticker</span>
              <span className="bg-[#27272a] text-[9px] px-1 rounded text-gray-500 uppercase">CMD+K</span>
            </div>
            <button 
              onClick={() => setIsAlertsModalOpen(true)}
              className="relative p-1 hover:text-blue-500 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {alerts.some(a => a.isActive) && (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_5px_#2563eb]" />
              )}
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600"></div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden p-4 gap-4">
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {/* Hero Header */}
            <div className="flex justify-between items-end bg-[#121214] p-5 rounded-lg border border-[#1f2937]">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-bold tracking-tighter text-white">{selectedStock.symbol}</h2>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest",
                    selectedStock.percentageChange >= 0 
                      ? "bg-green-500/10 text-green-500 border-green-500/20" 
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  )}>
                    {selectedStock.percentageChange >= 0 ? 'Bullish' : 'Bearish'} Sentiment
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1 italic">{selectedStock.companyName} • {selectedStock.industry}</p>
              </div>
              <div className="text-right flex items-end gap-6">
                <div>
                   <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Live Traded Price</div>
                  <div className={cn(
                    "text-4xl font-mono font-light",
                    selectedStock.percentageChange >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {formatCurrency(selectedStock.lastTradedPrice)} 
                    <span className="text-xl ml-2 font-light">
                      {selectedStock.percentageChange >= 0 ? '+' : ''}{selectedStock.change}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAlertsModalOpen(true)}
                  className="mb-1 p-2 bg-[#1c1c1f] hover:bg-[#27272a] rounded-lg border border-[#3f3f46] text-blue-500 transition-all"
                  title="Configure Alerts"
                >
                  <Bell className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Chart Section */}
            <div className="flex-1 min-h-[400px] bg-[#121214] border border-[#1f2937] rounded-lg p-4 flex flex-col shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <button className="text-[10px] font-bold text-blue-500 border-b border-blue-500 pb-1 uppercase tracking-wider">LSTM Predictor</button>
                  <button className="text-[10px] font-bold text-gray-500 hover:text-gray-300 pb-1 uppercase tracking-wider">Prophet Model</button>
                  <button className="text-[10px] font-bold text-gray-500 hover:text-gray-300 pb-1 uppercase tracking-wider">Historical</button>
                </div>
                <div className="flex items-center gap-2 bg-[#1c1c1f] p-1 rounded border border-[#3f3f46]">
                   <ToggleButton active={showSMA} onClick={() => setShowSMA(!showSMA)} label="SMA" />
                   <ToggleButton active={showRSI} onClick={() => setShowRSI(!showRSI)} label="RSI" />
                   <ToggleButton active={showMACD} onClick={() => setShowMACD(!showMACD)} label="MACD" />
                </div>
              </div>

              <div className="flex-1 bg-[#0a0a0b] rounded border border-white/5 relative">
                <StockChart 
                  data={chartData} 
                  symbol={selectedStock.symbol} 
                  showSMA={showSMA}
                  showRSI={showRSI}
                  showMACD={showMACD}
                />
              </div>
            </div>

            {/* Footer Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
               <MetricCard label="52W High" value={formatCurrency(selectedStock.high52w)} icon={<BarChart3 className="w-3 h-3" />} />
               <MetricCard label="30D Delta" value={`${selectedStock.change30d}%`} trend={selectedStock.change30d} icon={<LineChart className="w-3 h-3" />} />
               <MetricCard label="Volume" value={formatCompactNumber(selectedStock.shareVolume)} icon={<Activity className="w-3 h-3" />} />
               <MetricCard label="Exchange" value={selectedStock.series} icon={<Info className="w-3 h-3" />} />
            </div>
          </div>

          {/* Right Panel */}
          <aside className="w-[340px] flex-none">
            <AnalyticsPanel 
              symbol={selectedStock.symbol} 
              companyName={selectedStock.companyName}
              predictions={chartData.filter(d => !!d.predicted)}
            />
          </aside>
        </div>

        <footer className="h-[28px] bg-[#121214] border-t border-[#1f2937] flex items-center justify-between px-4 shrink-0">
          <div className="flex gap-4 items-center">
            <span className="text-[9px] text-[#4b5563] uppercase font-mono">Engine: Gemini-LSTM-v2</span>
            <span className="text-[9px] text-gray-800">|</span>
            <span className="text-[9px] text-[#4b5563] uppercase font-mono tracking-tighter">Latency: 142ms</span>
          </div>
          <div className="text-[9px] text-[#4b5563] uppercase font-mono">
            System Terminal Ready • 08:23:25 UTC
          </div>
        </footer>
      </main>

      <AlertsModal 
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        symbol={selectedStock.symbol}
        currentPrice={selectedStock.lastTradedPrice}
        alerts={alerts}
        onAddAlert={addAlert}
        onRemoveAlert={removeAlert}
      />
    </div>
  );
}

function MetricCard({ label, value, icon, trend }: { label: string; value: string; icon: React.ReactNode; trend?: number }) {
  return (
    <div className="bg-[#121214] border border-[#1f2937] p-4 rounded-lg hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <span className="text-[9px] uppercase font-bold tracking-widest">{label}</span>
      </div>
      <div className={cn(
        "text-lg font-mono font-bold tracking-tighter",
        trend !== undefined ? (trend >= 0 ? "text-green-400" : "text-red-400") : "text-white"
      )}>
        {value}
      </div>
    </div>
  );
}

function ToggleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2 py-0.5 rounded text-[9px] font-bold transition-all uppercase",
        active 
          ? "bg-blue-600 text-white shadow-[0_0_8px_#2563eb44]" 
          : "text-zinc-500 hover:text-zinc-300"
      )}
    >
      {label}
    </button>
  );
}

function StatItem({ label, value, color = "text-white" }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">{label}</p>
      <p className={cn("text-xs font-mono font-bold", color)}>{value}</p>
    </div>
  );
}

function X({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <svg 
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
