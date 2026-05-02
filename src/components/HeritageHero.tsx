import React from 'react';
import { Play, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeritageHero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] bg-[#002d20] overflow-hidden flex items-center pt-24 pb-12">
      {/* Decorative Gold Lines & Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gold/20" />
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gold/20" />
        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gold/20" />
        <div className="absolute bottom-1/4 left-0 w-full h-[1px] bg-gold/20" />
        
        {/* Sparkles */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2">
          <Sparkles className="text-gold animate-pulse" size={20} />
        </div>
        <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2">
          <Sparkles className="text-gold animate-pulse" size={20} />
        </div>
        <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 translate-y-1/2">
          <Sparkles className="text-gold animate-pulse" size={20} />
        </div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2">
          <Sparkles className="text-gold animate-pulse" size={20} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          
          {/* Left Column */}
          <div className="order-2 lg:order-1 space-y-12 text-center lg:text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-gold">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3l1.912 3.876L18.19 7.49l-2.909 2.835.687 4.145L12 12.51l-3.968 1.96.687-4.145L5.81 7.49l4.278-.614L12 3z" />
                </svg>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
                Emerald <br /> Echoes
              </h2>
              <p className="text-gold-light text-sm tracking-widest uppercase">
                Jewels & Accessories <br /> inspired by heritage.
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative inline-block">
                <div className="w-48 h-56 rounded-t-full overflow-hidden border border-gold-light/30">
                  <img src="/images/heritage_jeweler.png" className="w-full h-full object-cover" alt="Craftsmanship" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-ruby p-3 rounded-full border border-gold-light/30">
                  <Play className="text-white fill-white" size={20} />
                </div>
              </div>
              <div>
                <h4 className="text-gold-light font-heading text-lg font-bold uppercase tracking-widest">Crafted to be <br /> Treasured</h4>
                <p className="text-gold-light/60 text-[10px] mt-2 max-w-[200px] mx-auto lg:mx-0">
                  Not just jewelry, it is a reflection of identity, memory, and grace.
                </p>
                <Link to="/about" className="inline-flex items-center gap-2 text-white text-xs uppercase tracking-[0.2em] mt-4 hover:text-gold-light transition">
                  Our Story <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Middle Column - Portrait */}
          <div className="order-1 lg:order-2 flex flex-col items-center">
            {/* Text Overlay - Moved Above Arch */}
            <div className="mb-10 text-center px-6 z-20 animate-scale-up">
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold-light mb-4">Shine with Timeless Beauty</p>
              <h1 className="text-5xl md:text-7xl font-heading font-bold text-white leading-[1.1] drop-shadow-xl">
                A Legacy <br /> <span className="text-gradient-gold">Of Luxury</span>
              </h1>
            </div>

            <div className="relative w-full max-w-[400px] animate-scale-up" style={{ animationDelay: '200ms' }}>
              {/* Arch Frame */}
              <div className="aspect-[4/5] rounded-t-full overflow-hidden border-[8px] border-ruby relative shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
                <img 
                  src="/images/heritage_portrait.png" 
                  className="w-full h-full object-cover object-top" 
                  alt="Legacy of Luxury" 
                />
              </div>
              
              {/* Decorative Arch Background */}
              <div className="absolute inset-0 -m-4 border border-gold-light/20 rounded-t-full -z-10" />
              <div className="absolute inset-0 -m-8 border border-gold-light/10 rounded-t-full -z-20" />
            </div>
          </div>

          {/* Right Column */}
          <div className="order-3 space-y-12 text-center lg:text-right">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-end gap-2 text-gold-light">
                 <Sparkles size={24} />
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
                From <br /> The East
              </h2>
              <p className="text-gold-light text-sm tracking-widest uppercase">
                The Spirit Of Jewels. <br /> The Soul of India.
              </p>
            </div>

            <div className="space-y-6">
               <div className="flex justify-center lg:justify-end">
                <div className="relative inline-block">
                  <div className="w-48 h-56 rounded-t-full overflow-hidden border border-gold-light/30 bg-[#001a12]">
                    <img src="/images/heritage_necklace.png" className="w-full h-full object-cover mix-blend-lighten" alt="The Queen Collection" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <Sparkles className="text-gold-light animate-pulse" size={16} />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-gold-light font-heading text-lg font-bold uppercase tracking-widest">The Queen <br /> Collection</h4>
                <div className="mt-2">
                  <p className="text-gold/40 text-[10px] line-through">₹6,49,999 -35% off</p>
                  <p className="text-white font-bold text-xl font-heading tracking-widest">₹4,22,249</p>
                </div>
                <Link to="/products" className="inline-flex items-center gap-2 bg-ruby text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] mt-6 hover:bg-ruby/80 transition shadow-xl border border-gold-light/20">
                  Explore Collection
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
