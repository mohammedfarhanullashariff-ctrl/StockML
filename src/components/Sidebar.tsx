
import React, { useState } from 'react';
import { Search, Star, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { STOCKS, StockData } from '../data/stocks';
import { cn, formatCurrency } from '../lib/utils';

interface SidebarProps {
  selectedSymbol: string;
  onSelect: (stock: StockData) => void;
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
}

export default function Sidebar({ selectedSymbol, onSelect, watchlist, onToggleWatchlist }: SidebarProps) {
  const [search, setSearch] = useState('');

  const filteredStocks = STOCKS.filter(s => 
    s.symbol.toLowerCase().includes(search.toLowerCase()) || 
    s.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-[240px] border-r border-[#1f2937] bg-[#121214] flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-[#1f2937]">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tighter italic text-white">STOCKML</div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Ticker"
            className="w-full bg-[#1c1c1f] border border-[#1f2937] rounded-md py-1.5 pl-7 pr-3 text-[11px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {watchlist.length > 0 && (
          <div className="mb-2">
            <div className="px-4 py-3 flex justify-between items-center bg-[#0a0a0b]/30">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Watchlist</span>
            </div>
            <div className="space-y-px">
              {STOCKS.filter(s => watchlist.includes(s.symbol)).map(stock => (
                <StockRow 
                  key={stock.symbol} 
                  stock={stock} 
                  isSelected={selectedSymbol === stock.symbol} 
                  onClick={() => onSelect(stock)}
                  isWatchlisted={true}
                  onToggleWatchlist={onToggleWatchlist}
                />
              ))}
            </div>
          </div>
        )}

        <div>
           <div className="px-4 py-3 flex justify-between items-center bg-[#0a0a0b]/30">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Market Feed</span>
          </div>
          <div className="space-y-px">
            {filteredStocks.map(stock => (
              <StockRow 
                key={stock.symbol} 
                stock={stock} 
                isSelected={selectedSymbol === stock.symbol} 
                onClick={() => onSelect(stock)}
                isWatchlisted={watchlist.includes(stock.symbol)}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#0a0a0b] border-t border-[#1f2937]">
        <div className="text-[9px] text-gray-500 mb-2 uppercase tracking-widest font-bold">Market Session Status</div>
        <div className="h-1 bg-[#1c1c1f] rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 w-3/4 shadow-[0_0_8px_#2563eb]"></div>
        </div>
      </div>
    </div>
  );
}

interface StockRowProps {
  stock: StockData;
  isSelected: boolean;
  onClick: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
}

const StockRow: React.FC<StockRowProps> = ({ 
  stock, 
  isSelected, 
  onClick, 
  isWatchlisted, 
  onToggleWatchlist 
}) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors border-l-2",
        isSelected ? "bg-[#1c1c1f] border-blue-500" : "hover:bg-[#161618] border-transparent"
      )}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[11px] text-white">{stock.symbol}</span>
          {isWatchlisted && <div className="w-1 h-1 rounded-full bg-blue-500" />}
        </div>
        <span className="text-[9px] text-gray-500 italic line-clamp-1">{stock.companyName}</span>
      </div>
      
      <div className="text-right">
        <div className="text-[11px] font-mono font-medium text-gray-300">{formatCurrency(stock.lastTradedPrice)}</div>
        <div className={cn(
          "text-[9px] font-mono",
          stock.percentageChange >= 0 ? "text-green-400" : "text-red-400"
        )}>
          {stock.percentageChange >= 0 ? '+' : ''}{stock.percentageChange}%
        </div>
      </div>
    </div>
  );
}
