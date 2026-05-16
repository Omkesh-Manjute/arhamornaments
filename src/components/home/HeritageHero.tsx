import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Play, ArrowRight } from 'lucide-react';
import { homepageService } from '../../services/homepageService';

const defaultData = {
  artisanImage: '/images/hero/artisan.png',
  portraitImage: '/images/hero/portrait.png',
  necklaceImage: '/images/hero/necklace.png',
  queenCollectionPrice: '₹4,22,249',
  queenCollectionOriginalPrice: '₹6,49,999',
  queenCollectionDiscount: '-35% OFF'
};

const HeritageHero: React.FC = () => {
  const [data, setData] = React.useState(defaultData);

  React.useEffect(() => {
    homepageService.getSectionConfig().then(config => {
      if (config.heritageHero) {
        setData({ ...defaultData, ...config.heritageHero });
      }
    });
  }, []);

  return (
    <section className="relative min-h-[95vh] bg-[#002d20] overflow-hidden flex items-center pt-28 pb-16">
      {/* Premium Luxury Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00382b] via-[#002d20] to-[#001a12]"></div>
        {/* Subtle Silk Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d4af37 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
        {/* Ambient Light Flares */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Decorative Gold Lines & Sparkles */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-gold/15 to-transparent" />
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-gold/15 to-transparent" />
        <div className="absolute top-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
        <div className="absolute bottom-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
        
        {/* Sparkles */}
        <div className="absolute top-1/4 left-[15%]">
          <Sparkles className="text-gold/40 animate-pulse" size={16} />
        </div>
        <div className="absolute top-1/3 right-[10%]">
          <Sparkles className="text-gold/30 animate-pulse" size={24} />
        </div>
        <div className="absolute bottom-1/4 left-[20%]">
          <Sparkles className="text-gold/20 animate-pulse" size={20} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
          
          {/* Left Column: Craftsmanship */}
          <div className="order-2 lg:order-1 space-y-12 text-center lg:text-left animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3 text-gold">
                <div className="w-8 h-px bg-gold/40"></div>
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Artisanal Process</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
                Emerald <br /> Echoes
              </h2>
              <p className="text-gold-light/60 text-sm tracking-widest uppercase font-medium">
                Jewels & Accessories <br /> inspired by heritage.
              </p>
            </div>

            <div className="space-y-8">
              <div className="relative inline-block group">
                <div className="w-52 h-64 rounded-t-full overflow-hidden border border-gold-light/20 relative shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
                  <img src={data.artisanImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Master Artisan at Work" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <button className="absolute -bottom-5 -right-5 bg-ruby p-4 rounded-full border border-gold-light/30 shadow-xl transform transition hover:scale-110 hover:rotate-12 active:scale-95 group">
                  <Play className="text-white fill-white group-hover:animate-pulse" size={20} />
                </button>
              </div>
              <div>
                <h4 className="text-gold-light font-heading text-xl font-bold uppercase tracking-widest leading-tight">Crafted to be <br /> Treasured</h4>
                <p className="text-gold-light/40 text-[11px] mt-3 max-w-[220px] mx-auto lg:mx-0 leading-relaxed italic">
                  "Every piece tells a story of identity, memory, and timeless grace."
                </p>
                <Link to="/about" className="inline-flex items-center gap-3 text-white text-[10px] font-bold uppercase tracking-[0.3em] mt-6 group transition-colors hover:text-gold">
                  Our Story <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Middle Column: The Legacy (Main Portrait) */}
          <div className="order-1 lg:order-2 flex flex-col items-center py-8">
            <div className="mb-12 text-center px-6 z-20 animate-scale-up">
              <p className="text-[10px] uppercase tracking-[0.5em] text-gold-light mb-6 font-bold">Shine with Timeless Beauty</p>
              <h1 className="text-6xl md:text-8xl font-heading font-bold text-white leading-[1] drop-shadow-2xl">
                A Legacy <br /> <span className="text-gradient-gold italic font-normal">Of Luxury</span>
              </h1>
            </div>

            <div className="relative w-full max-w-[420px] animate-scale-up" style={{ animationDelay: '400ms' }}>
              {/* Decorative Arch Frames (Layered) */}
              <div className="absolute inset-0 -m-6 border border-gold-light/10 rounded-t-full -z-10 scale-105" />
              <div className="absolute inset-0 -m-12 border border-gold-light/5 rounded-t-full -z-20 scale-110" />
              
              {/* Main Arch Frame */}
              <div className="aspect-[4/5.5] rounded-t-full overflow-hidden border-[10px] border-[#8B2323] relative shadow-[0_30px_60px_rgba(0,0,0,0.5)] group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
                <img 
                  src={data.portraitImage} 
                  className="w-full h-full object-cover object-top transition-transform duration-[2000ms] group-hover:scale-105" 
                  alt="Legacy of Luxury Portrait" 
                />
                
                {/* Floating Badge in Arch */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-max bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-2xl transform transition duration-500 group-hover:-translate-y-2">
                   <div className="flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></div>
                     <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Exquisite Handcraft</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Collection Spotlight */}
          <div className="order-3 space-y-12 text-center lg:text-right animate-slide-up" style={{ animationDelay: '600ms' }}>
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-end gap-3 text-gold">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold">New Collection</span>
                <div className="w-8 h-px bg-gold/40"></div>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
                From <br /> The East
              </h2>
              <p className="text-gold-light/60 text-sm tracking-widest uppercase font-medium">
                The Spirit Of Jewels. <br /> The Soul of India.
              </p>
            </div>

            <div className="space-y-8">
               <div className="flex justify-center lg:justify-end">
                <div className="relative inline-block group">
                  <div className="w-52 h-64 rounded-t-full overflow-hidden border border-gold-light/20 bg-[#001a12] shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
                    <img src={data.necklaceImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="The Queen Collection Masterpiece" />
                    <div className="absolute inset-0 bg-gold/5 mix-blend-overlay"></div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Sparkles className="text-gold animate-pulse" size={16} />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-gold-light font-heading text-xl font-bold uppercase tracking-widest leading-tight">The Queen <br /> Collection</h4>
                <div className="mt-4 flex flex-col items-center lg:items-end">
                  <p className="text-gold/40 text-[10px] line-through font-bold tracking-widest">{data.queenCollectionOriginalPrice} {data.queenCollectionDiscount}</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-px bg-gold/20"></span>
                    <p className="text-white font-bold text-2xl font-heading tracking-[0.1em] text-gradient-gold">{data.queenCollectionPrice}</p>
                  </div>
                </div>
                <Link to="/products" className="inline-flex items-center gap-3 bg-ruby text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mt-8 hover:bg-ruby/80 transition-all shadow-[0_15px_30px_rgba(139,35,35,0.4)] border border-gold-light/20 active:scale-95 group">
                  Explore Collection
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeritageHero;
