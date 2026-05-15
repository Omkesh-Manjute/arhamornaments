import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const genders = [
  {
    name: 'Men',
    image: '/images/gender/men.png',
    path: '/products?gender=men',
    gridClass: 'col-span-1'
  },
  {
    name: 'Kids',
    image: '/images/gender/kids.png',
    path: '/products?gender=kids',
    gridClass: 'col-span-1'
  },
  {
    name: 'Women',
    image: '/images/gender/women.png',
    path: '/products?gender=women',
    gridClass: 'col-span-2'
  }
];

const ShopByGender: React.FC = () => {
  return (
    <section className="px-4 md:px-8 pt-16 pb-8 bg-cream/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-ruby mb-3">
            Shop by Gender
          </h2>
          <p className="text-charcoal/70 font-medium text-sm md:text-base max-w-md mx-auto">
            First-class jewelry for first-class Men, Women & Children.
          </p>
          <div className="flex items-center justify-center mt-6">
            <div className="h-px w-12 md:w-24 bg-gold/30"></div>
            <div className="mx-4 text-gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="currentColor" fillOpacity="0.1"/>
              </svg>
            </div>
            <div className="h-px w-12 md:w-24 bg-gold/30"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-8">
          {genders.map((gender, index) => (
            <motion.div
              key={gender.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`${gender.gridClass} group`}
            >
              <Link to={gender.path} className="block">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gold/5">
                  <div className={`relative overflow-hidden ${gender.name === 'Women' ? 'aspect-[21/9]' : 'aspect-square'}`}>
                    <img
                      src={gender.image}
                      alt={gender.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 md:p-6 flex items-center justify-between bg-white">
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-ruby">
                      {gender.name}
                    </h3>
                    <div className="flex items-center text-charcoal/60 text-xs md:text-sm font-semibold group-hover:text-gold transition-colors">
                      Explore <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByGender;
