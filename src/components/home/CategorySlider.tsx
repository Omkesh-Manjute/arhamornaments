import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { homepageService } from '../../services/homepageService';
import { productService } from '../../services/productService';

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
        const config = await homepageService.getSectionConfig();
        if (config.categories && config.categories.length > 0) {
          setCategories(config.categories.map(c => ({
            id: c.name.toLowerCase(),
            name: c.name,
            image: c.image,
            path: c.path
          })));
          return;
        }

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
          setCategories(dynamicCats);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="w-full bg-white py-4 border-b border-gray-50 overflow-hidden">
      <div className="flex overflow-x-auto no-scrollbar gap-3 px-4 md:px-8 pb-2 scroll-smooth">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            to={category.path}
            className="flex-shrink-0 flex flex-col w-[110px] md:w-[130px] group transition-all duration-300 hover:-translate-y-1"
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-gray-100 group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] transition-all">
              <div className="aspect-square overflow-hidden bg-gray-50">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="py-2.5 px-1 text-center bg-white border-t border-gray-50">
                <span className="text-[11px] md:text-[13px] font-heading font-black text-ruby leading-none tracking-tight block truncate">
                  {category.name}
                </span>
              </div>
            </div>
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
