import React from 'react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  image: string;
  path: string;
}

const categories: Category[] = [
  { id: 'earrings', name: 'Earrings', image: '/images/products/earrings.png', path: '/products?category=earrings' },
  { id: 'gold-coins', name: 'Gold Coins', image: '/images/products/gold_coins.png', path: '/products?category=coins' },
  { id: 'necklaces', name: 'Necklaces', image: '/images/products/necklaces_category.png', path: '/products?category=necklaces' },
  { id: 'rings', name: 'Rings', image: '/images/products/engagement_ring.png', path: '/products?category=rings' },
  { id: 'pendants', name: 'Pendants', image: '/images/products/heart_diamond_pendant.png', path: '/products?category=pendants' },
  { id: 'bangles', name: 'Bangles', image: '/images/products/temple_gold_kangan.png', path: '/products?category=bangles' },
  { id: 'mangalsutra', name: 'Mangalsutra', image: '/images/products/antique_floral.png', path: '/products?category=necklaces' },
];

const CategorySlider: React.FC = () => {
  return (
    <div className="w-full bg-white py-2 border-b border-gray-100 overflow-hidden">
      <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 md:px-8 pb-2">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            to={category.path}
            className="flex-shrink-0 flex flex-col items-center gap-2 group transition-transform active:scale-95"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-gray-50 shadow-sm group-hover:border-gold/50 transition-colors">
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <span className="text-[11px] font-bold text-charcoal/80 uppercase tracking-wider group-hover:text-gold transition-colors">
              {category.name}
            </span>
          </Link>
        ))}
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
    </div>
  );
};

export default CategorySlider;
