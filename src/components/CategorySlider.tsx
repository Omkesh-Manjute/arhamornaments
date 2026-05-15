import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';

// Fallback category order (used for sorting, not images)
const CATEGORY_ORDER = [
  'earrings', 'rings', 'bracelets', 'necklaces', 'bangles',
  'pendants', 'pendant-sets', 'nose-jewelry', 'chain-sets',
  'mangalsutra', 'chains', 'gold-coins'
];

interface DynamicCategory {
  id: string;
  name: string;
  image: string;
  path: string;
}

const CategorySlider: React.FC = () => {
  const [categories, setCategories] = useState<DynamicCategory[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const products = await productService.getAllProducts();
        // Build categories from real product data
        const catMap = new Map<string, string>();
        products.forEach(p => {
          if (p.category && !catMap.has(p.category) && p.images?.[0]) {
            catMap.set(p.category, p.images[0]);
          }
        });

        const dynamicCats: DynamicCategory[] = Array.from(catMap.entries())
          .sort(([a], [b]) => {
            const aIdx = CATEGORY_ORDER.indexOf(a);
            const bIdx = CATEGORY_ORDER.indexOf(b);
            return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
          })
          .map(([key, image]) => ({
            id: key,
            name: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
            image,
            path: `/products?category=${key}`
          }));

        if (dynamicCats.length > 0) {
          setCategories(dynamicCats.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="w-full bg-white py-2 border-b border-gray-100 overflow-hidden">
      <div className="flex justify-center no-scrollbar gap-5 md:gap-8 px-4 md:px-8 pb-2">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            to={category.path}
            className="flex-shrink-0 flex flex-col items-center gap-2 group transition-transform active:scale-95 w-[28%]"
          >
            <div className="w-full aspect-square rounded-[2rem] overflow-hidden border-2 border-gray-50 shadow-sm group-hover:border-gold/50 transition-colors">
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <span className="text-[10px] md:text-[11px] font-bold text-charcoal/80 uppercase tracking-wider group-hover:text-gold transition-colors text-center">
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
