import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';

const NewArrivalsBanners: React.FC = () => {
  return (
    <section className="px-0 md:px-8 py-4 md:py-16 bg-offwhite flex flex-col gap-2 md:gap-8 max-w-7xl mx-auto">
      
      {/* Banner 1: New Arrival */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden md:rounded-2xl group shadow-sm">
        <img 
          src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80" 
          alt="New Arrival" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 object-center"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent md:to-black/10"></div>
        
        <div className="absolute inset-0 p-4 md:p-16 flex flex-col justify-between">
          <div className="max-w-md">
            <div className="relative inline-block mb-1 text-white">
              <Sparkles className="absolute -top-3 -left-3 w-3 h-3 md:w-6 md:h-6 text-gold animate-pulse" />
              <h2 className="text-3xl md:text-6xl font-heading font-bold tracking-widest uppercase leading-none drop-shadow-lg">
                <span className="text-gold">New</span> <br/> Arrival
              </h2>
              <Sparkles className="absolute -bottom-1 -right-4 w-2 h-2 md:w-5 md:h-5 text-gold animate-pulse delay-300" />
            </div>
          </div>
          <div className="self-end md:self-end mt-auto">
            <Link to="/products" className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/30 text-white px-4 md:px-8 py-2 md:py-3 rounded-full font-bold uppercase tracking-widest text-[9px] md:text-xs hover:bg-white hover:text-black transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              View Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Banner 2: 18CT Ready Stock */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden md:rounded-2xl group shadow-sm">
        <img 
          src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80" 
          alt="18CT Ready Stock" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 object-center"
        />
        {/* Brownish overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#4e342e]/95 via-[#4e342e]/70 to-transparent"></div>
        
        <div className="absolute inset-0 p-4 md:p-16 flex flex-col justify-center">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-[1px] w-4 md:w-8 bg-gold"></div>
              <p className="text-gold font-serif italic text-lg md:text-4xl">18CT</p>
              <div className="h-[1px] w-4 md:w-8 bg-gold"></div>
            </div>
            <h2 className="text-3xl md:text-6xl font-heading font-bold text-white leading-tight mb-2 drop-shadow-md">
              Jewellery <br/> <span className="text-[#e8c39e]">Ready Stock</span>
            </h2>
            <div className="flex items-center gap-4 mt-3 md:mt-6">
              <Link to="/products?category=necklaces" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#d4af37] to-[#b5952f] text-white px-4 md:px-6 py-2 md:py-3 rounded font-bold uppercase tracking-widest text-[9px] md:text-xs hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
                View Collection <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Banner 3: Mix Rajkot 22CT */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden md:rounded-2xl group shadow-sm">
        <img 
          src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80" 
          alt="Mix Rajkot 22CT" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 object-right-bottom"
        />
        {/* Light creamy overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fdfbf7]/95 via-[#fdfbf7]/80 to-[#fdfbf7]/30"></div>
        
        <div className="absolute inset-0 p-4 md:p-16 flex flex-col justify-center">
          <div className="max-w-md">
            <h2 className="text-3xl md:text-6xl font-heading font-bold text-[#4a3b32] leading-tight mb-1 uppercase tracking-wider drop-shadow-sm">
              Mix <br/> Rajkot
            </h2>
            <p className="text-[#a67c52] font-heading font-semibold text-lg md:text-3xl mt-1 md:mt-2 tracking-widest uppercase">
              22CT Jewellery
            </p>
          </div>
        </div>
      </div>

    </section>
  );
};

export default NewArrivalsBanners;
