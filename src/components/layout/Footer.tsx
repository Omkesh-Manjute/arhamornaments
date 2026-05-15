import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="hidden md:block bg-charcoal text-white pt-20 pb-10 border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 pb-16 border-b border-white/5">
          {/* Brand Column - Full width on mobile */}
          <div className="space-y-6 col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-11 md:h-11 flex-shrink-0 bg-white/5 rounded-2xl border border-white/10 p-1.5 overflow-hidden">
                <img src="/images/logo.png?v=1.1" alt="Arham Ornaments" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl md:text-2xl font-bold tracking-[0.12em] font-heading leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-gold-light to-white">
                  ARHAM
                </h2>
                <span className="text-[8px] md:text-[9px] tracking-[0.3em] text-gold uppercase font-bold leading-none mt-1">ORNAMENTS</span>
              </div>
            </Link>
            <p className="text-gray-400 text-[12px] md:text-sm leading-relaxed max-w-sm">
              Crafting timeless stories since 1985. Experience the fusion of traditional heritage and modern luxury.
            </p>
            {/* Social Icons for Mobile/Tablet - visible as a row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a href="#" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-gold/20 hover:border-gold/30 transition-all text-gray-400 hover:text-gold">
                Facebook
              </a>
              <a href="#" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-gold/20 hover:border-gold/30 transition-all text-gray-400 hover:text-gold">
                Instagram
              </a>
              <a href="#" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-gold/20 hover:border-gold/30 transition-all text-gray-400 hover:text-gold">
                Twitter
              </a>
            </div>
          </div>

          {/* Link Columns - Hidden on mobile, visible on tablet+ */}
          <div className="hidden md:grid col-span-1 lg:col-span-3 grid-cols-2 md:grid-cols-3 gap-8">
            {/* Menu Column */}
            <div className="space-y-6">
              <h4 className="text-[11px] uppercase tracking-[0.3em] font-black text-gold">Menu</h4>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                <li><Link to="/products?filter=new" className="hover:text-gold transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors"></span>New In</Link></li>
                <li><Link to="/products?category=necklaces" className="hover:text-gold transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors"></span>Necklaces</Link></li>
                <li><Link to="/products?category=earrings" className="hover:text-gold transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors"></span>Earrings</Link></li>
                <li><Link to="/products?category=rings" className="hover:text-gold transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors"></span>Rings</Link></li>
              </ul>
            </div>

            {/* About Column */}
            <div className="space-y-6">
              <h4 className="text-[11px] uppercase tracking-[0.3em] font-black text-gold">About</h4>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                <li><Link to="/about" className="hover:text-gold transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors"></span>Who We Are</Link></li>
                <li><Link to="/academy" className="hover:text-gold transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors"></span>Arham Academy</Link></li>
                <li><Link to="/blog" className="hover:text-gold transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors"></span>Blog</Link></li>
                <li><Link to="/support" className="hover:text-gold transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors"></span>Support</Link></li>
                <li><Link to="/faq" className="hover:text-gold transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors"></span>FAQ</Link></li>
              </ul>
            </div>

            {/* Support/Contact Column - visible on Tablet+ or just third column */}
            <div className="space-y-6 col-span-2 md:col-span-1 pt-8 md:pt-0">
              <h4 className="text-[11px] uppercase tracking-[0.3em] font-black text-gold">Experience</h4>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Email us</p>
                    <p className="text-sm font-bold">care@arham.com</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Call us</p>
                    <p className="text-sm font-bold">+91 93715 04182</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <Link to="/return" className="hover:text-white transition">Returns</Link>
          </div>
          <p className="text-center">© {new Date().getFullYear()} ARHAM ORNAMENTS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
