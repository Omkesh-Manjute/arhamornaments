import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '../types';

interface BestSellerSectionProps {
  products: Product[];
  title: string;
  subtitle?: string;
  bannerImage: string;
  bannerLink: string;
}

const BestSellerSection: React.FC<BestSellerSectionProps> = ({ 
  products, 
  title, 
  subtitle, 
  bannerImage, 
  bannerLink 
}) => {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Title Section */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-charcoal">{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm md:text-base font-medium">{subtitle}</p>}
          <div className="flex justify-center py-2">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent"></div>
          </div>
        </div>

        {/* Top Banner Image (Tanishq Style) */}
        <div className="relative h-[250px] md:h-[450px] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden group mb-10 shadow-xl">
          <img 
            src={bannerImage} 
            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
            alt={title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 md:p-20">
            <Link 
              to={bannerLink} 
              className="group/btn flex items-center gap-2 text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] hover:text-gold transition-colors w-fit"
            >
              Explore Our {title} <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Product Slider (Horizontal Scroll on Mobile) */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-8 gap-4 md:gap-6 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 snap-x snap-mandatory">
            {products.map((product) => (
              <div key={product.id} className="min-w-[170px] md:min-w-0 snap-start">
                <ProductCard product={product} hidePrice={true} />
              </div>
            ))}
          </div>
          
          {/* View All Link */}
          <div className="mt-8 flex justify-center">
             <Link 
              to="/products" 
              className="group flex items-center gap-2 text-charcoal font-bold uppercase tracking-[0.2em] text-[10px] hover:text-gold transition-colors pb-2 border-b-2 border-charcoal/10 hover:border-gold"
            >
              View All Masterpieces <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellerSection;
