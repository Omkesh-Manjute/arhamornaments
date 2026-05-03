import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { usePrice } from '../context/PriceContext';

const LivePriceTicker: React.FC = () => {
  const { rates } = usePrice();
  
  const prices = [
    { name: 'Gold 24K', price: `₹${Math.round(rates.gold24K).toLocaleString()}`, change: '+₹45', up: true, carat: '24K' },
    { name: 'Gold 22K', price: `₹${Math.round(rates.gold22K).toLocaleString()}`, change: '+₹40', up: true, carat: '22K' },
    { name: 'Gold 18K', price: `₹${Math.round(rates.gold18K).toLocaleString()}`, change: '-₹10', up: false, carat: '18K' },
    { name: 'Silver 999', price: `₹${rates.silver.toFixed(2)}`, change: '+₹0.20', up: true, carat: '1g' },
  ];

  return (
    <div className="w-full h-9 bg-[#0D4449] text-white overflow-hidden border-b border-gold/20 fixed top-0 left-0 z-[100] shadow-lg flex items-center">
      <div className="flex whitespace-nowrap animate-ticker relative w-full">
        {/* We duplicate the content to ensure seamless infinite scroll */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-12 px-6">
            <div className="flex items-center gap-2 pr-4 border-r border-gold/10">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em] whitespace-nowrap">Market Live</span>
            </div>
            {prices.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex flex-col">
                   <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-0.5">{item.name}</span>
                   <span className="text-[13px] font-black text-white tracking-wide leading-none">{item.price}</span>
                </div>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 ${item.up ? 'text-green-400' : 'text-red-400'}`}>
                  {item.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {item.change}
                </span>
                <div className="w-px h-4 bg-gold/10 mx-2"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LivePriceTicker;
