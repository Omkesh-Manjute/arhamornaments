import React from 'react';
import { Link } from 'react-router-dom';

const occasions = [
  {
    name: 'Wedding',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    path: '/products?filter=wedding',
    description: 'Bridal masterpieces'
  },
  {
    name: 'Daily Wear',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    path: '/products?filter=daily',
    description: 'Everyday elegance'
  },
  {
    name: 'Festive',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
    path: '/products?filter=festive',
    description: 'Celebrate in style'
  },
  {
    name: 'Gifting',
    image: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?w=400',
    path: '/products?filter=gifting',
    description: 'Perfect presents'
  }
];

const OccasionSection: React.FC = () => {
  return (
    <section className="px-4 md:px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-10 text-center">
          <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold mb-2">Shop For</span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-charcoal">Every Occasion</h2>
          <div className="w-16 h-0.5 bg-gold/30 mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {occasions.map((occ) => (
            <Link
              key={occ.name}
              to={occ.path}
              className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <img
                src={occ.image}
                alt={occ.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-center">
                <h3 className="text-white font-heading text-2xl font-bold group-hover:text-gold transition-colors">
                  {occ.name}
                </h3>
                <p className="text-white/60 text-[10px] uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {occ.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OccasionSection;
