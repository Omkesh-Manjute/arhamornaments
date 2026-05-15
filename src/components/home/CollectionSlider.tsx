import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

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
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 md:p-16">
                <h3 className="text-white text-2xl md:text-5xl font-heading font-bold mb-4 md:mb-6 leading-tight max-w-sm drop-shadow-lg">
                  {banner.title.split('<br />').map((text, i) => (
                    <React.Fragment key={i}>
                      {text}
                      {i < banner.title.split('<br />').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h3>
                <Link 
                  to={banner.link} 
                  className="group/btn flex items-center gap-2 text-white text-[9px] md:text-xs font-bold uppercase tracking-[0.3em] hover:text-gold transition-colors w-fit"
                >
                  Explore Collection <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
          
          {/* Slider Indicators */}
          <div className="absolute bottom-6 right-8 md:right-16 z-20 flex gap-2">
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
        <div className="flex overflow-x-auto no-scrollbar gap-4 md:gap-6 pb-4">
          {items.map((item) => (
            <Link 
              key={item.id} 
              to={item.path}
              className="flex-shrink-0 w-[170px] md:w-[320px] group"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gold/5">
                <div className="aspect-[4/5] overflow-hidden bg-white relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-3 md:p-5 flex items-center justify-between bg-white border-t border-gray-50">
                  <h3 className="font-heading text-sm md:text-lg font-bold text-ruby group-hover:text-ruby/80 transition-colors">
                    {item.name}
                  </h3>
                  <div className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] flex items-center gap-1 group-hover:gap-2 transition-all">
                    View <span className="text-[12px] leading-none">→</span>
                  </div>
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
