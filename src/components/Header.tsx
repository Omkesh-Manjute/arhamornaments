import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, User, Heart, Wallet, Settings, LogOut, Gift, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { totalItems } = useCart();
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
    { name: 'About Us', path: '/about' },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <header 
      className={`fixed top-[36px] left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || !isHomePage ? 'bg-white shadow-md py-2' : 'bg-white lg:bg-transparent py-2 lg:py-6'
      } ${!isHomePage || isScrolled ? 'border-b border-gray-100' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button 
            className={`lg:hidden p-2 transition-colors ${isScrolled || !isHomePage || isMobile ? 'text-charcoal' : 'text-white'}`}
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex flex-col items-center">
            <h1 className={`text-xl md:text-2xl font-bold tracking-[0.2em] font-heading leading-tight transition-colors ${isScrolled || !isHomePage || isMobile ? 'text-charcoal' : 'text-white'}`}>
              ARHAM
            </h1>
            <span className="text-[10px] tracking-[0.4em] text-gold uppercase -mt-1">ORNAMENTS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs uppercase tracking-widest font-medium transition-all hover:text-gold ${
                  location.pathname + location.search === link.path 
                    ? 'text-gold' 
                    : isScrolled || !isHomePage ? 'text-charcoal' : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {isLoggedIn && (
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 ${isScrolled || !isHomePage || isMobile ? 'text-charcoal' : 'text-white'}`}>
                <Wallet size={16} className="text-gold" />
                <span className="text-xs font-bold">₹{user?.walletBalance}</span>
              </div>
            )}
            <button className={`p-2 transition-colors hover:text-gold ${isScrolled || !isHomePage || isMobile ? 'text-charcoal' : 'text-white'}`}>
              <Search size={20} />
            </button>
            
            {/* User Dropdown */}
            <div className="relative group">
              <button 
                onClick={() => isLoggedIn ? navigate('/profile') : navigate('/admin')}
                className={`p-2 transition-colors hover:text-gold flex items-center gap-1 ${isScrolled || !isHomePage || isMobile ? 'text-charcoal' : 'text-white'}`}
              >
                <User size={20} />
                {isLoggedIn && <span className="text-[10px] hidden md:block">{user?.name.split(' ')[0]}</span>}
              </button>
              
              {isLoggedIn && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2 z-[60]">
                  <div className="p-4 border-b border-gray-50">
                    <p className="text-xs font-bold text-charcoal truncate">{user?.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-offwhite rounded-xl transition">
                      <User size={16} />
                      Profile
                    </Link>
                    <Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-offwhite rounded-xl transition">
                      <Settings size={16} />
                      Admin Panel
                    </Link>
                    <button 
                      onClick={() => logout()}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition mt-1"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link 
              to="/wishlist"
              className={`hidden sm:block p-2 relative transition-colors hover:text-gold ${isScrolled || !isHomePage || isMobile ? 'text-charcoal' : 'text-white'}`}
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce-in">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className={`relative p-2 transition-colors hover:text-gold ${isScrolled || !isHomePage || isMobile ? 'text-charcoal' : 'text-white'}`}>
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-gold text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce-in">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
      {/* Mobile Drawer */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[360px] bg-[#f8f8f8] z-[70] transition-transform duration-300 lg:hidden flex flex-col ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Profile Header */}
        <div className="bg-white p-5 border-b shadow-sm relative overflow-hidden">
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
                <h3 className="text-xl font-bold text-charcoal">Hi {isLoggedIn ? user?.name.split(' ')[0] : 'Guest'}!</h3>
                <p className="text-[11px] font-semibold text-[#8B2323] tracking-wide mt-0.5">
                  NeuCoins - <span className="font-bold">0</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#8B2323] transition-transform hover:scale-105"
            >
              <Menu size={20} className="rotate-90" />
            </button>
          </div>

          <div className="flex items-center gap-4 mt-6">
            {/* Currency Toggle */}
            <div className="flex bg-[#f5f5f5] rounded-lg p-1.5 border border-gray-100">
              <button className="px-4 py-1.5 rounded-md bg-white shadow-sm text-[#8B2323] font-bold text-sm">₹</button>
              <button className="px-4 py-1.5 rounded-md text-gray-400 font-bold text-sm">$</button>
            </div>

            {/* Redeem Badge */}
            <div className="ml-auto relative">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#8B2323] flex items-center justify-center">
                <div className="text-center leading-tight">
                  <p className="text-[10px] font-bold text-[#8B2323]">Redeem<br/>points</p>
                </div>
              </div>
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#8B2323] rounded-full border-2 border-white shadow-sm" />
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {/* Main Categories */}
          <div className="space-y-1">
            {[
              { label: 'All Jewellery', path: '/products' },
              { label: 'Metal', path: '/products?filter=metal' },
              { label: 'Collections', path: '/products?filter=collections' }
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-white hover:border-gray-100 transition-all active:scale-[0.98]"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-sm font-semibold text-charcoal">{item.label}</span>
                <Menu size={16} className="text-[#8B2323] -rotate-90" />
              </Link>
            ))}
          </div>

          {/* Shop For Section */}
          <div className="py-4">
            <h4 className="text-[11px] font-bold text-[#8B2323] uppercase tracking-[0.15em] px-4 mb-3">Shop For</h4>
            <div className="space-y-1">
              {[
                { label: 'Men', path: '/products?gender=men' },
                { label: 'Kids', path: '/products?gender=kids' }
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="flex items-center justify-between p-4 bg-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-white hover:border-gray-100 transition-all active:scale-[0.98]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-sm font-semibold text-charcoal">{item.label}</span>
                  <Menu size={16} className="text-[#8B2323] -rotate-90" />
                </Link>
              ))}
            </div>
          </div>

          {/* Utility Links */}
          <div className="space-y-1 pb-8">
            {[
              { label: 'Jewellery Plans', path: '/plans' },
              { label: 'Gift Card', path: '/gift-cards' },
              { label: 'Gold Rate', path: '/gold-rate' },
              { label: 'Offers & Contest Details', path: '/offers' },
              { label: 'Cyber Security Policy', path: '/policy' },
              { label: 'Get In Touch', path: '/contact' },
              { label: 'Store Locator', path: '/stores' }
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-white hover:border-gray-100 transition-all active:scale-[0.98]"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-sm font-medium text-gray-600">{item.label}</span>
                {item.label === 'Get In Touch' && <Menu size={16} className="text-[#8B2323] -rotate-90" />}
              </Link>
            ))}

            {isLoggedIn && (
              <button
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="w-full flex items-center p-4 bg-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-white text-red-500 font-semibold text-sm active:scale-[0.98]"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
