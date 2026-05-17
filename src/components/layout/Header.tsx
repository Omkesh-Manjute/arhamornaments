import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, User, Heart, Wallet, Settings, LogOut, ChevronRight, Gift, Bell, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import { useWishlist } from '../../context/WishlistContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMetal, setOpenMetal] = useState(false);
  const [openCollections, setOpenCollections] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { totalItems, setCartDrawerOpen } = useCart();
  const { user, isLoggedIn, logout } = useUser();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const navLinks = [
    { name: 'New In', path: '/products?filter=new' },
    { name: 'Necklaces', path: '/products?category=necklaces' },
    { name: 'Earrings', path: '/products?category=earrings' },
    { name: 'Rings', path: '/products?category=rings' },
    { name: 'Pendants', path: '/products?category=pendants' },
    { name: 'Mangalsutra', path: '/products?category=mangalsutra' },
    { name: 'Bangles', path: '/products?category=bangles' },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <>
      <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-white/85 backdrop-blur-md shadow-sm border-gray-100/80 py-1.5' 
          : 'bg-white/70 backdrop-blur-md shadow-none border-transparent py-2.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 transition-colors text-charcoal"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo with Image */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 md:w-11 md:h-11 flex-shrink-0 transition-transform duration-500 group-hover:scale-105">
              <img
                src="/images/logo.png?v=1.1"
                alt="Arham Ornaments"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-lg md:text-xl font-bold tracking-[0.15em] font-heading leading-none text-charcoal">
                ARHAM
              </h1>
              <span className="text-[8px] md:text-[9px] tracking-[0.35em] text-gold uppercase font-bold leading-none mt-0.5">ORNAMENTS</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs uppercase tracking-widest font-medium transition-all hover:text-gold whitespace-nowrap ${location.pathname + location.search === link.path
                    ? 'text-gold'
                    : 'text-charcoal'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 md:gap-3">
            {isLoggedIn && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-charcoal">
                <Wallet size={16} className="text-gold" />
                <span className="text-xs font-bold">₹{user?.walletBalance}</span>
              </div>
            )}


            <button className="hidden sm:block p-2 transition-colors hover:text-gold text-charcoal">
              <Search size={20} />
            </button>

            {/* User Dropdown - Desktop only */}
            <div className="hidden md:block relative group">
              <button
                className="p-2 transition-colors hover:text-gold flex items-center gap-1 text-charcoal"
              >
                <User size={20} />
                {isLoggedIn && <span className="text-[10px] hidden md:block">{user?.name?.split(' ')[0]}</span>}
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2 z-[60]">
                {isLoggedIn ? (
                  <>
                    <div className="p-4 border-b border-gray-50">
                      <p className="text-xs font-bold text-charcoal truncate">{user?.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-offwhite rounded-xl transition">
                        <User size={16} /> Profile
                      </Link>
                      <Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-offwhite rounded-xl transition">
                        <Settings size={16} /> Admin Panel
                      </Link>
                      <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition mt-1"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-2">
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-offwhite rounded-xl transition">
                      <User size={16} /> Login / Register
                    </Link>
                    <Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-offwhite rounded-xl transition">
                      <Settings size={16} /> Admin Panel
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {isLoggedIn && (
              <Link
                to="/profile#notifications"
                className="hidden md:flex p-2 relative transition-colors hover:text-gold text-charcoal"
                onClick={(e) => {
                  if (location.pathname === '/profile') {
                    e.preventDefault();
                    document.getElementById('notifications')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Bell size={20} />
                {user?.notifications?.some(n => !n.isRead) && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                    {user.notifications?.filter(n => !n.isRead).length || 0}
                  </span>
                )}
              </Link>
            )}
            <Link
              to="/wishlist"
              className="flex p-2 relative transition-colors hover:text-gold text-charcoal"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce-in">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2 transition-colors hover:text-gold text-charcoal"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-gold text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce-in">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>


      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div
        className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[360px] bg-[#f8f8f8] z-[70] transition-transform duration-300 lg:hidden flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Profile Header with Logo */}
        <div className="bg-white p-5 border-b shadow-sm relative overflow-hidden">
          {/* Logo Banner at top of drawer */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 flex-shrink-0">
              <img src="/images/logo.png?v=1.1" alt="Arham Ornaments" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold tracking-[0.12em] font-heading text-charcoal leading-none">ARHAM</h2>
              <span className="text-[7px] tracking-[0.3em] text-gold uppercase font-bold leading-none mt-0.5">ORNAMENTS</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#fdf2f2] flex items-center justify-center border border-[#f5e1e1] overflow-hidden">
                {isLoggedIn && user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8B2323]">
                    <User size={32} />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-charcoal">Hi {isLoggedIn && user?.name ? user.name.split(' ')[0] : 'Guest'}!</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-charcoal relative">
                <Heart size={18} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-charcoal">
                <User size={18} />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#8B2323] transition-transform hover:scale-105"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gold/10 to-transparent rounded-2xl border border-gold/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gold tracking-widest leading-none mb-1">My Wallet</p>
                  <p className="text-lg font-black text-charcoal">₹{user?.walletBalance || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('open-lucky-wheel'));
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold text-white shadow-md hover:bg-gold-dark transition-all active:scale-95 group"
                >
                  <Gift size={14} className="group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Spin</span>
                </button>
                <div className="flex bg-[#f5f5f5] rounded-lg p-1 border border-gray-100 scale-90 origin-right">
                  <button className="px-3 py-1 rounded-md bg-white shadow-sm text-[#8B2323] font-bold text-xs">₹</button>
                  <button className="px-3 py-1 rounded-md text-gray-400 font-bold text-xs">$</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {/* Main Categories */}
          <div className="space-y-1">
            <Link
              to="/products"
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-white hover:border-gray-100 transition-all active:scale-[0.98]"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-sm font-semibold text-charcoal">All Jewellery</span>
              <ChevronRight size={18} className="text-gray-300" />
            </Link>

            {/* Metal Submenu */}
            <div>
              <button
                onClick={() => setOpenMetal(!openMetal)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-white hover:border-gray-100 transition-all active:scale-[0.98]"
              >
                <span className="text-sm font-semibold text-charcoal">Metal</span>
                <ChevronRight size={18} className={`text-gray-300 transition-transform duration-300 ${openMetal ? 'rotate-90' : ''}`} />
              </button>
              {openMetal && (
                <div className="mt-1 ml-4 space-y-1 overflow-hidden animate-slideDown">
                  {[
                    { label: 'Gold', path: '/products?metal=gold' },
                    { label: 'Silver', path: '/products?metal=silver' },
                    { label: 'Diamond', path: '/products?metal=diamond' }
                  ].map((sub) => (
                    <Link
                      key={sub.label}
                      to={sub.path}
                      className="flex items-center gap-3 p-3 text-xs font-bold text-gray-500 hover:text-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gold/30" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Collections Submenu */}
            <div>
              <button
                onClick={() => setOpenCollections(!openCollections)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-white hover:border-gray-100 transition-all active:scale-[0.98]"
              >
                <span className="text-sm font-semibold text-charcoal">Collections</span>
                <ChevronRight size={18} className={`text-gray-300 transition-transform duration-300 ${openCollections ? 'rotate-90' : ''}`} />
              </button>
              {openCollections && (
                <div className="mt-1 ml-4 space-y-1 overflow-hidden animate-slideDown">
                  {[
                    { label: 'Bridal Collection', path: '/products?filter=bridal' },
                    { label: 'Antique Heritage', path: '/products?filter=antique' },
                    { label: 'Everyday Wear', path: '/products?filter=everyday' }
                  ].map((sub) => (
                    <Link
                      key={sub.label}
                      to={sub.path}
                      className="flex items-center gap-3 p-3 text-xs font-bold text-gray-500 hover:text-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gold/30" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Men & Kids Section */}
          <div className="space-y-1">
            {[
              { label: 'Men', path: '/products?gender=men' },
              { label: 'Women', path: '/products?gender=women' }
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-white hover:border-gray-100 transition-all active:scale-[0.98]"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-sm font-semibold text-charcoal">{item.label}</span>
                <ChevronRight size={18} className="text-gray-300" />
              </Link>
            ))}
          </div>

          {/* Jewellery Categories Section - Collapsible */}
          <div className="space-y-1 pb-24">
            <button
              onClick={() => setOpenCategories(!openCategories)}
              className="w-full flex items-center justify-between px-4 py-4 mt-4"
            >
              <h4 className="text-[11px] font-bold text-[#8B2323] uppercase tracking-[0.15em]">Categories</h4>
              <ChevronRight size={14} className={`text-[#8B2323] transition-transform duration-300 ${openCategories ? 'rotate-90' : ''}`} />
            </button>

            {openCategories && (
              <div className="space-y-1 overflow-hidden animate-slideDown">
                {[
                  { label: 'Necklaces', path: '/products?category=necklaces' },
                  { label: 'Earrings', path: '/products?category=earrings' },
                  { label: 'Rings', path: '/products?category=rings' },
                  { label: 'Pendants', path: '/products?category=pendants' },
                  { label: 'Mangalsutra', path: '/products?category=mangalsutra' },
                  { label: 'Bangles', path: '/products?category=bangles' }
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="flex items-center justify-between p-4 bg-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-white hover:border-gray-100 transition-all active:scale-[0.98]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-sm font-semibold text-charcoal">{item.label}</span>
                    <ChevronRight size={18} className="text-gray-300" />
                  </Link>
                ))}
              </div>
            )}

            {/* About & Support Link */}
            <Link
              to="/support"
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-white hover:border-gray-100 transition-all active:scale-[0.98] mt-4"
              onClick={() => setIsMenuOpen(false)}
            >
              <h4 className="text-[11px] font-bold text-[#8B2323] uppercase tracking-[0.15em]">About & Support</h4>
              <ChevronRight size={18} className="text-gray-300" />
            </Link>

            {isLoggedIn && (
              <button
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="w-full flex items-center p-4 bg-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-white text-red-500 font-semibold text-sm active:scale-[0.98] mt-4"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
