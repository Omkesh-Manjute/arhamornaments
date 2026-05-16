import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bannerService } from '../../services/bannerService';
import { homepageService } from '../../services/homepageService';

import banner1 from '../../assets/hero/banner1.png';
import banner2 from '../../assets/hero/banner2.png';
import banner3 from '../../assets/hero/banner3.png';

const HeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const staticSlides = [
    {
      image: banner1,
      title: 'Timeless Elegance',
      subtitle: 'New Collection 2024',
      link: '/products',
      align: 'left'
    },
    {
      image: banner2,
      title: 'Masterful Craft',
      subtitle: 'Handcrafted with Love',
      link: '/about',
      align: 'center'
    },
    {
      image: banner3,
      title: 'Pure Luxury',
      subtitle: 'The Queen Collection',
      link: '/products?category=necklaces',
      align: 'left'
    }
  ];

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const config = await homepageService.getSectionConfig();
        const activeBanners = (config.heroBanners || []).filter(b => b.isActive);
        
        if (activeBanners.length > 0) {
          setSlides(activeBanners.map(b => ({
            image: b.image,
            title: b.title,
            subtitle: b.subtitle,
            link: b.link || '/products',
            align: 'left' // Default align for dynamic banners
          })));
        } else {
          // Fallback to bannerService for backward compatibility if needed, 
          // or just static slides
          const data = await bannerService.getAllBanners();
          const legacyActive = data.filter(b => b.isActive);
          if (legacyActive.length > 0) {
            setSlides(legacyActive.map(b => ({
              image: b.image,
              title: b.title,
              subtitle: b.subtitle,
              link: b.link || '/products',
              align: 'left'
            })));
          } else {
            setSlides(staticSlides);
          }
        }
      } catch (error) {
        console.error("Failed to fetch banners:", error);
        setSlides(staticSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  if (loading) {
    return <div className="w-full h-[50vh] md:h-[85vh] bg-charcoal/5 animate-pulse flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="relative w-full h-[50vh] md:h-[85vh] overflow-hidden bg-gray-50">
      <div 
        className="flex h-full transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0 relative">
            <img 
              src={slide.image} 
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-black/10 flex flex-col justify-end md:justify-center p-8 pb-20 md:p-24 ${
              slide.align === 'left' ? 'items-start text-left' : 
              slide.align === 'right' ? 'items-end text-right' : 
              'items-center text-center'
            }`}>
              <div className="max-w-2xl">
                <h2 className="text-white text-2xl md:text-7xl font-heading font-bold mb-2 md:mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] animate-fadeIn">
                  {slide.title}
                </h2>
                <p className="text-white/90 text-[10px] md:text-lg uppercase tracking-[0.4em] mb-6 md:mb-10 font-bold drop-shadow-md">
                  {slide.subtitle}
                </p>
                <Link 
                  to={slide.link}
                  className="inline-block bg-white text-charcoal px-6 py-2.5 md:px-10 md:py-4 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-gold hover:text-white transition-all shadow-2xl transform hover:scale-105 active:scale-95"
                >
                  Discover More
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all hidden md:block"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all hidden md:block"
      >
        <ChevronRight size={32} />
      </button>

      {/* Progress Dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-white w-8' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
