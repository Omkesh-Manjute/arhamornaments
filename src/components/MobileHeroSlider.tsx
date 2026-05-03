import React, { useState, useEffect } from 'react';

const images = [
  '/images/slider/slide1.jpg',
  '/images/slider/slide2.jpg',
  '/images/slider/slide3.jpg',
  '/images/slider/slide4.jpg'
];

const MobileHeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
