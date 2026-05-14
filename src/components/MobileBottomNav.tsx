import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingBag, User, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  
  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Shop', icon: Search, path: '/products' },
    { name: 'Categories', icon: LayoutGrid, path: '/products?showFilters=true' }, // We'll handle the filter trigger in ProductListing if needed
    { name: 'Treasury', icon: ShoppingBag, path: '/cart', badge: totalItems },
    { name: 'Account', icon: User, path: '/profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path.split('?')[0]);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-xl border-t border-gray-100 px-2 py-2 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex justify-between items-center relative">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center w-16 py-1 relative group"
            >
              <div className={`relative p-2 rounded-2xl transition-all duration-300 ${active ? 'bg-gold/10 text-gold scale-110' : 'text-gray-400 group-hover:text-charcoal'}`}>
                <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest mt-1 transition-all duration-300 ${active ? 'text-gold opacity-100 translate-y-0' : 'text-gray-400 opacity-60 translate-y-1'}`}>
                {item.name}
              </span>

              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-2 w-8 h-1 bg-gold rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
