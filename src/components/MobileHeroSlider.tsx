import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';

const MobileHeroSlider: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const products = await productService.getAllProducts();
        // Pick the best product images for the hero slider
        // Use first image from different categories for variety
        const seenCategories = new Set<string>();
        const heroImages: string[] = [];
        
        for (const p of products) {
          if (p.images?.[0] && p.category && !seenCategories.has(p.category)) {
            heroImages.push(p.images[0]);
            seenCategories.add(p.category);
            if (heroImages.length >= 5) break;
          }
        }
        
        // If not enough categories, fill with more product images
        if (heroImages.length < 3) {
          for (const p of products) {
            if (p.images?.[0] && !heroImages.includes(p.images[0])) {
              heroImages.push(p.images[0]);
              if (heroImages.length >= 4) break;
            }
          }
        }

        if (heroImages.length > 0) {
          setImages(heroImages);
        }
      } catch (error) {
        console.error('Failed to load hero images:', error);
      }
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) {
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
        {images.map((img, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0">
            <img 
              src={img} 
              alt={`Slide ${idx + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {images.map((_, idx) => (
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
