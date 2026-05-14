import React, { useState } from 'react';
import { Bell, X, Trash2, Plus, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

export interface PriceAlert {
  id: string;
  symbol: string;
  threshold: number;
  type: 'above' | 'below';
  isActive: boolean;
  createdAt: number;
}

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
  alerts: PriceAlert[];
  onAddAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
  onRemoveAlert: (id: string) => void;
}

export default function AlertsModal({ 
  isOpen, 
  onClose, 
  symbol, 
  currentPrice, 
  alerts, 
  onAddAlert, 
  onRemoveAlert 
}: AlertsModalProps) {
  const [threshold, setThreshold] = useState(currentPrice.toString());
  const [type, setType] = useState<'above' | 'below'>(threshold > currentPrice.toString() ? 'above' : 'below');

  if (!isOpen) return null;

  const symbolAlerts = alerts.filter(a => a.symbol === symbol);

  const handleAdd = () => {
    const val = parseFloat(threshold);
    if (isNaN(val)) return;
    onAddAlert({
      symbol,
      threshold: val,
      type: val > currentPrice ? 'above' : 'below',
      isActive: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#121214] border border-[#1f2937] w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-[#1f2937] flex justify-between items-center bg-[#1c1c1f]/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Price Alerts</h2>
              <p className="text-[10px] text-gray-500 font-mono">{symbol} • Current: {formatCurrency(currentPrice)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Set Threshold</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                <input 
                  type="number" 
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-[#1f2937] rounded-lg py-2.5 pl-8 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <button 
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg flex items-center gap-2 text-xs font-bold transition-all"
              >
                <Plus className="w-4 h-4" />
                CREATE
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
              Active Alerts
              <span className="text-gray-700">{symbolAlerts.length}</span>
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {symbolAlerts.length === 0 ? (
                <div className="text-center py-8 bg-[#0a0a0b] rounded-lg border border-dashed border-[#1f2937]">
                   <AlertCircle className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                   <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">No alerts configured</p>
                </div>
              ) : (
                symbolAlerts.map(alert => (
                  <div key={alert.id} className="bg-[#1c1c1f] p-3 rounded-lg border border-white/5 flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        alert.type === 'above' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {alert.type === 'above' ? 'ABOVE' : 'BELOW'}
                      </div>
                      <span className="text-sm font-mono text-gray-200">{formatCurrency(alert.threshold)}</span>
                    </div>
                    <button 
                      onClick={() => onRemoveAlert(alert.id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#0a0a0b]/50 border-t border-[#1f2937] text-[9px] text-gray-600 text-center uppercase tracking-widest font-bold">
          Alerts are processed recursively in local state
        </div>
      </div>
    </div>
  );
}
