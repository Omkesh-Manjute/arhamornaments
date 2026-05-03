import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { usePrice } from '../context/PriceContext';

interface CollectionItem {
  id: string;
  name: string;
  image: string;
  path: string;
}

interface CollectionSliderProps {
  title: string;
  subtitle: string;
  banners?: { image: string; title: string; link: string }[];
  items: CollectionItem[];
}

const CollectionSlider: React.FC<CollectionSliderProps> = ({ title, subtitle, banners = [], items }) => {
  const { rates } = usePrice();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const prices = [
    { name: 'Gold 24K', price: `₹${Math.round(rates.gold24K).toLocaleString()}`, change: '+₹45', up: true },
    { name: 'Gold 22K', price: `₹${Math.round(rates.gold22K).toLocaleString()}`, change: '+₹40', up: true },
    { name: 'Gold 18K', price: `₹${Math.round(rates.gold18K).toLocaleString()}`, change: '-₹10', up: false },
    { name: 'Silver 999', price: `₹${rates.silver.toFixed(2)}`, change: '+₹0.20', up: true },
  ];

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  return (
    <section className="px-4 md:px-8 py-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-ruby">{title}</h2>
          <p className="text-gray-500 text-sm md:text-lg">{subtitle}</p>
          <div className="flex justify-center py-4">
            <div className="w-16 h-[1px] bg-gold" />
            <div className="mx-2 -mt-1.5 text-gold">❦</div>
            <div className="w-16 h-[1px] bg-gold" />
          </div>
        </div>

        {/* Auto-Sliding Featured Banner */}
        <div className="relative aspect-[16/7] rounded-[2rem] overflow-hidden mb-12 group shadow-xl">
          {banners.map((banner, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img 
                src={banner.image} 
                alt={banner.title.replace(/<br \/>/g, ' ')} 
                className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent flex flex-col justify-center p-8 md:p-16">
                <h3 className="text-white text-2xl md:text-5xl font-heading font-bold mb-6 leading-tight max-w-sm drop-shadow-lg">
                  {banner.title.split('<br />').map((text, i) => (
                    <React.Fragment key={i}>
                      {text}
                      {i < banner.title.split('<br />').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h3>
                <Link 
                  to={banner.link} 
                  className="bg-white/90 backdrop-blur-md text-charcoal px-8 py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold hover:text-white transition-all w-fit shadow-2xl"
                >
                  Explore the Collection
                </Link>
              </div>
            </div>
          ))}
          
          {/* Slider Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1 rounded-full transition-all duration-500 ${
                  idx === currentBannerIndex ? 'w-8 bg-white' : 'w-4 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Horizontal Items Slider */}
        <div className="flex overflow-x-auto no-scrollbar gap-6 pb-4">
          {items.map((item) => (
            <Link 
              key={item.id} 
              to={item.path}
              className="flex-shrink-0 w-[200px] md:w-[300px] group"
            >
              <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-4 relative bg-offwhite border border-gray-100">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                   <span className="inline-block bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-heading font-bold shadow-sm text-charcoal">
                     {item.name}
                   </span>
                </div>
              </div>
            </Link>
          ))}
          
          {/* View All Card */}
          <Link 
            to="/category/earrings"
            className="flex-shrink-0 w-[200px] md:w-[300px] flex items-center justify-center rounded-[1.5rem] border-2 border-dashed border-gray-200 hover:border-gold hover:bg-gold/5 transition group"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-offwhite flex items-center justify-center mx-auto mb-4 group-hover:bg-gold group-hover:text-white transition shadow-sm">
                <ChevronRight size={28} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal">View All</p>
            </div>
          </Link>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
};

export default CollectionSlider;
