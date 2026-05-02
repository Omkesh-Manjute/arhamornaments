import React from 'react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

const LivePriceTicker: React.FC = () => {
  const prices = [
    { name: 'Gold 24K', price: '₹7,250', change: '+₹45', up: true, carat: '24K' },
    { name: 'Gold 22K', price: '₹6,650', change: '+₹40', up: true, carat: '22K' },
    { name: 'Gold 18K', price: '₹5,440', change: '-₹10', up: false, carat: '18K' },
    { name: 'Silver 999', price: '₹95.50', change: '+₹0.20', up: true, carat: '1g' },
  ];

  return (
    <>
      {/* Desktop Side Panel (Fixed Left) */}
      <div className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-[100] flex-col gap-4">
        <div className="bg-[#0D4449]/95 backdrop-blur-xl border-y-2 border-r-2 border-gold/40 rounded-r-[2rem] p-5 shadow-[10px_0_30px_rgba(0,0,0,0.3)] transition-all duration-500 hover:pl-8 group">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-gold/20 pb-3 mb-1">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75"></div>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gold-light drop-shadow-sm">Market Rates</span>
            </div>
            
            {prices.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-0.5 group/item">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{item.name}</span>
                  <span className="text-[8px] px-1.5 py-0.5 bg-gold/10 text-gold rounded-md border border-gold/20">{item.carat}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white font-heading">{item.price}</span>
                  <div className={`flex items-center text-[9px] font-bold ${item.up ? 'text-green-400' : 'text-red-400'}`}>
                    {item.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {item.change}
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-gold/10 mt-2 flex items-center justify-center">
               <Info size={12} className="text-gold/40 cursor-help hover:text-gold transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Top Ticker (Running Animation) */}
      <div className="lg:hidden w-full bg-emerald-950 text-white overflow-hidden py-2 border-b border-gold/20 fixed top-0 left-0 z-[60] shadow-md">
        <div className="flex whitespace-nowrap animate-ticker">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-gold-light uppercase tracking-widest mr-4">Live Rates:</span>
              </div>
              {prices.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400">{item.name} ({item.carat})</span>
                  <span className="text-sm font-black text-white font-heading tracking-wide">{item.price}</span>
                  <span className={`text-[10px] font-bold ${item.up ? 'text-green-400' : 'text-red-400'}`}>
                    {item.change}
                  </span>
                  <div className="w-px h-3 bg-gold/20 mx-4"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LivePriceTicker;
