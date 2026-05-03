import React from 'react';
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
  bannerImage: string;
  items: CollectionItem[];
}

const CollectionSlider: React.FC<CollectionSliderProps> = ({ title, subtitle, bannerImage, items }) => {
  return (
    <section className="px-4 md:px-8 py-8 bg-white">
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

        {/* Featured Banner */}
        <div className="relative aspect-[16/7] rounded-[2rem] overflow-hidden mb-8 group">
          <img 
            src={bannerImage} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex flex-col justify-center p-8 md:p-16">
            <h3 className="text-white text-2xl md:text-4xl font-heading font-bold mb-4 leading-tight max-w-xs">
              Stunning <br /> every Ear
            </h3>
            <Link 
              to="/category/earrings" 
              className="bg-white/90 backdrop-blur text-charcoal px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition w-fit"
            >
              Explore the Collection
            </Link>
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
              <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-4 relative bg-offwhite">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                   <span className="inline-block bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-heading font-bold shadow-sm">
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
              <div className="w-12 h-12 rounded-full bg-offwhite flex items-center justify-center mx-auto mb-4 group-hover:bg-gold group-hover:text-white transition">
                <ChevronRight size={24} />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-charcoal">View All</p>
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
