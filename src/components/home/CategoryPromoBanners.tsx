import React from 'react';
import { Link } from 'react-router-dom';

const CategoryPromoBanners: React.FC = () => {
  return (
    <section className="px-0 md:px-8 py-4 md:py-16 bg-white w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6">
        
        {/* Banner 1: Men's Collection */}
        <div className="relative w-full aspect-[16/9] md:aspect-[4/5] overflow-hidden md:rounded-2xl group shadow-sm bg-[#d4b895]">
          <img 
            src="https://images.unsplash.com/photo-1599643478514-4a4204538883?auto=format&fit=crop&q=80" 
            alt="Men's Collection" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 object-center opacity-90"
          />
          {/* Subtle gradient to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#d4b895]/90 via-[#d4b895]/20 to-transparent"></div>
          
          <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl md:text-3xl font-serif text-[#4a3b32] uppercase tracking-widest drop-shadow-sm">
                Men's Collection
              </h2>
            </div>
            <div className="self-end mt-auto">
              <Link to="/products?category=mens" className="inline-flex items-center justify-center bg-white/40 backdrop-blur-sm border border-[#4a3b32]/20 text-[#4a3b32] px-3 md:px-5 py-1.5 md:py-2 rounded font-medium uppercase tracking-wider text-[10px] md:text-xs hover:bg-[#4a3b32] hover:text-white transition-colors">
                View Collection
              </Link>
            </div>
          </div>
        </div>

        {/* Banner 2: Ladies Chain 22CT Jewellery */}
        <div className="relative w-full aspect-[16/9] md:aspect-[4/5] overflow-hidden md:rounded-2xl group shadow-sm bg-[#fdfbf7]">
          <img 
            src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80" 
            alt="Ladies Chain 22CT Jewellery" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#fdfbf7]/95 via-[#fdfbf7]/60 to-transparent"></div>
          
          <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-between">
            <div className="max-w-[70%]">
              <h2 className="text-2xl md:text-4xl font-light text-[#4a3b32] uppercase tracking-widest mb-1">
                Ladies Chain
              </h2>
              <p className="text-lg md:text-2xl font-serif font-bold text-[#6b4c1e]">
                22CT Jewellery
              </p>
            </div>
            <div className="mt-auto self-start">
              <Link to="/products?category=chains" className="inline-flex items-center justify-center bg-gradient-to-r from-[#e6c27a] to-[#d4af37] text-black px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold uppercase tracking-widest text-[9px] md:text-xs shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] transition-all">
                View Collection
              </Link>
            </div>
          </div>
        </div>

        {/* Banner 3: Mangalsutra 22CT Jewellery */}
        <div className="relative w-full aspect-[16/9] md:aspect-[4/5] overflow-hidden md:rounded-2xl group shadow-sm bg-[#f5ebe0]">
          <img 
            src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80" 
            alt="Mangalsutra 22CT Jewellery" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#f5ebe0]/95 via-[#f5ebe0]/80 to-transparent"></div>
          
          <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-between items-end text-right">
            <div className="max-w-[70%] mt-2 md:mt-4">
              <div className="flex justify-end mb-1">
                <span className="text-[10px] text-[#4a3b32]">❦</span>
              </div>
              <h2 className="text-xl md:text-3xl font-serif text-[#4a3b32] uppercase tracking-widest mb-1">
                Mangalsutra
              </h2>
              <p className="text-md md:text-xl font-light text-[#4a3b32]">
                22CT Jewellery
              </p>
            </div>
            <div className="mt-auto self-end">
              <a href="https://wa.me/919371504182?text=I%20am%20interested%20in%20the%20Mangalsutra%20collection" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 md:gap-2 bg-white text-black px-4 md:px-5 py-2 md:py-2.5 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs shadow-lg hover:scale-105 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-3.5 h-3.5 md:w-5 md:h-5" />
                CHAT
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CategoryPromoBanners;
