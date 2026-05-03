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
        className={`fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white z-[70] transition-transform duration-300 lg:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-12">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold font-heading tracking-widest">ARHAM</h2>
              <span className="text-[8px] tracking-[0.3em] text-gold">ORNAMENTS</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm uppercase tracking-[0.2em] font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/wishlist"
              className="text-sm uppercase tracking-[0.2em] font-medium flex items-center justify-between group"
              onClick={() => setIsMenuOpen(false)}
            >
              Wishlist
              {wishlist.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              className="text-sm uppercase tracking-[0.2em] font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            <Link
              to="/admin"
              className="text-sm uppercase tracking-[0.2em] font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
            
            {/* New Special Mobile Actions */}
            <div className="pt-4 space-y-4">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-lucky-wheel'));
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-4 bg-gold/5 rounded-2xl border border-gold/10 text-gold group"
              >
                <div className="flex items-center gap-3">
                  <Gift size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Spin & Win</span>
                </div>
                <div className="w-6 h-6 bg-gold text-white rounded-full flex items-center justify-center text-[10px] animate-pulse">!</div>
              </button>

              <button
                onClick={() => {
                  const message = encodeURIComponent('Hi! I\'m interested in your jewellery collection. Please share more details.');
                  window.open(`https://wa.me/919371504182?text=${message}`, '_blank');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100 text-green-600"
              >
                <MessageCircle size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">WhatsApp Support</span>
              </button>
            </div>

            {isLoggedIn && (
              <button
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="text-sm uppercase tracking-[0.2em] font-medium text-red-500 text-left"
              >
                Logout
              </button>
            )}
          </nav>
          
          <div className="mt-24 border-t pt-8">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">Contact Us</p>
            <p className="text-lg font-medium">+91 93715 04182</p>
            <p className="text-sm text-gray-500">info@arhamornaments.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
