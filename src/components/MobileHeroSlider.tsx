import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { bannerService } from '../services/bannerService';

const MobileHeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const banners = await bannerService.getAllBanners();
        const activeBanners = banners.filter(b => b.isActive);
        
        if (activeBanners.length > 0) {
          setSlides(activeBanners);
        } else {
          // Fallback to product images if no banners are set
          const products = await productService.getAllProducts();
          const seenCategories = new Set<string>();
          const heroSlides: any[] = [];
          
          for (const p of products) {
            if (p.images?.[0] && p.category && !seenCategories.has(p.category)) {
              heroSlides.push({ image: p.images[0], title: 'New Collection', subtitle: p.category });
              seenCategories.add(p.category);
              if (heroSlides.length >= 5) break;
            }
          }
          setSlides(heroSlides);
        }
      } catch (error) {
        console.error('Failed to load hero banners:', error);
      }
    };
    loadBanners();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="relative w-full aspect-[4/5] overflow-hidden lg:hidden mb-2 bg-gray-100 animate-pulse" />
    );
  }

  return (
    <div className="relative w-full aspect-[4/5] overflow-hidden lg:hidden mb-2">
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0 relative">
            <img 
              src={slide.image} 
              alt={slide.title || `Slide ${idx + 1}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 pb-12">
              <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold mb-2 animate-fadeIn">{slide.subtitle || 'New Collection'}</span>
              <h2 className="text-3xl font-heading text-white font-bold leading-tight mb-4">
                {slide.title || 'Timeless Elegance'}
              </h2>
              <Link to={slide.link || "/products"} className="bg-white text-charcoal px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit shadow-lg">
                Shop Now
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <div 
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              idx === currentIndex ? 'bg-gold w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileHeroSlider;
