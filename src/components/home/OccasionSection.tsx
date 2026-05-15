import React from 'react';
import { Link } from 'react-router-dom';

import { homepageService } from '../../services/homepageService';

const defaultOccasions = [
  {
    name: 'Office Wear',
    image: '/images/occasions/office_wear.png',
    path: '/products?filter=office',
    description: 'Minimalist professional elegance'
  },
  {
    name: 'Modern Wear',
    image: '/images/occasions/modern_wear.png',
    path: '/products?filter=modern',
    description: 'Contemporary chic designs'
  },
  {
    name: 'Casual Wear',
    image: '/images/occasions/casual_wear.png',
    path: '/products?filter=casual',
    description: 'Everyday understated luxury'
  },
  {
    name: 'Traditional Wear',
    image: '/images/occasions/traditional_wear.png',
    path: '/products?filter=traditional',
    description: 'Heritage ethnic masterpieces'
  }
];

const OccasionSection: React.FC = () => {
  const [occasions, setOccasions] = React.useState(defaultOccasions);

  React.useEffect(() => {
    homepageService.getSectionConfig().then(config => {
      if (config.occasions && config.occasions.length > 0) {
        setOccasions(config.occasions);
      }
    });
  }, []);
  return (
    <section className="px-4 md:px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-10 text-center">
          <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold mb-2">The Collection</span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-charcoal">Shop by Occasion</h2>
          <div className="w-16 h-0.5 bg-gold/30 mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {occasions.map((occ) => (
            <Link
              key={occ.name}
              to={occ.path}
              className="group relative aspect-[3/4] rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-700"
            >
              <img
                src={occ.image}
                alt={occ.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 text-center translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-white font-heading text-xl md:text-3xl font-bold group-hover:text-gold transition-colors leading-tight">
                  {occ.name}
                </h3>
                <div className="w-8 h-px bg-gold/50 mx-auto mt-2 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OccasionSection;
