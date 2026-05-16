import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { usePrice } from '../../context/PriceContext';

const LivePriceTicker: React.FC = () => {
  const { rates } = usePrice();
  
  const prices = [
    { name: 'Gold 24K', price: `₹${Math.round(rates?.gold24K || 0).toLocaleString()}`, change: 'Live', up: true },
    { name: 'Gold 22K', price: `₹${Math.round(rates?.gold22K || 0).toLocaleString()}`, change: 'Live', up: true },
    { name: 'Silver 999', price: `₹${(rates?.silver || 0).toFixed(0)}/g`, change: 'Live', up: true },
    { name: 'Silver 1kg', price: `₹${(rates?.silver1kg || 0).toLocaleString()}`, change: 'Live', up: true },
  ];

  return (
    <div className="w-full bg-white py-10 border-y-2 border-gray-100 shadow-sm overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Status Badge */}
          <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-xl border-2 border-gray-100 shadow-sm">
            <div className="relative">
              <div className="w-3.5 h-3.5 rounded-full bg-green-500 animate-ping absolute inset-0"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-green-500 relative shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 uppercase tracking-wider leading-none">Market Live</span>
              <span className="text-[10px] text-green-600 font-bold uppercase tracking-tight mt-1">Real-time Rates</span>
            </div>
          </div>

          {/* Price Grid */}
          <div className="flex-1 w-full overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-center lg:justify-end gap-4 md:gap-6 min-w-max px-4">
              {prices.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-gold/30 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-2">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-gray-900 tracking-tight leading-none">{item.price}</span>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-600 border border-green-100">
                        <TrendingUp size={12} className="animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Live</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rate History Link */}
          <div className="hidden xl:flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 text-gray-600 hover:text-gold hover:border-gold/20 transition-all cursor-pointer">
            <Activity size={18} />
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wide leading-none">Price History</p>
              <p className="text-[9px] font-medium text-gray-400 mt-0.5 uppercase tracking-tighter">Market Analysis</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LivePriceTicker;
