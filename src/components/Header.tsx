import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, User, Heart, Wallet, Settings, LogOut, ChevronRight, Gift, Bell } from 'lucide-react';
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
                onClick={() => navigate('/profile')}
                className={`p-2 transition-colors hover:text-gold flex items-center gap-1 ${isScrolled || !isHomePage || isMobile ? 'text-charcoal' : 'text-white'}`}
              >
                <User size={20} />
                {isLoggedIn && <span className="text-[10px] hidden md:block">{user?.name?.split(' ')[0]}</span>}
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

            {isLoggedIn && (
              <Link 
                to="/profile#notifications"
                className={`p-2 relative transition-colors hover:text-gold ${isScrolled || !isHomePage || isMobile ? 'text-charcoal' : 'text-white'}`}
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
                <h3 className="text-xl font-bold text-charcoal">Hi {isLoggedIn ? user?.name?.split(' ')[0] : 'Guest'}!</h3>
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

            <button 
              onClick={() => {
                setIsMenuOpen(false);
                window.dispatchEvent(new CustomEvent('open-lucky-wheel'));
              }}
              className="ml-auto w-20 h-20 rounded-full border-2 border-dashed border-gold flex flex-col items-center justify-center bg-gold/5 group transition-all active:scale-95"
            >
              <div className="text-center leading-tight">
                <Gift size={20} className="text-gold mx-auto mb-1 group-hover:bounce" />
                <p className="text-[9px] font-bold text-gold uppercase tracking-tighter">Spin<br/>& Win</p>
              </div>
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-gold rounded-full border-2 border-white shadow-sm animate-pulse" />
            </button>
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
                <ChevronRight size={18} className="text-gray-300" />
              </Link>
            ))}
          </div>

          {/* Men & Kids Section */}
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
                <ChevronRight size={18} className="text-gray-300" />
              </Link>
            ))}
          </div>

          {/* Jewellery Categories Section */}
          <div className="space-y-1 pb-8">
            <h4 className="text-[11px] font-bold text-[#8B2323] uppercase tracking-[0.15em] px-4 mb-3 mt-4">Categories</h4>
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

            {/* Spin & Win Section */}
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                window.dispatchEvent(new CustomEvent('open-lucky-wheel'));
              }}
              className="w-full mt-6 flex items-center justify-between p-5 bg-gradient-to-r from-gold/20 via-gold/5 to-white rounded-2xl border border-gold/30 shadow-lg transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
                  <Gift size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-charcoal uppercase tracking-wider">Spin & Win Rewards</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Assured prizes up to ₹500</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                <ChevronRight size={18} />
              </div>
            </button>

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
    </header>
  );
};

export default Header;
