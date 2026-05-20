import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Mail, Phone, ShieldCheck, Truck, HelpCircle, FileText, Info, MessageSquare, ArrowLeft, Gem } from 'lucide-react';

const SupportPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      {/* Sticky Header with Back Button */}
      <div className="sticky top-0 z-50 bg-offwhite/80 backdrop-blur-md px-6 py-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-charcoal active:scale-90 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="ml-4 text-lg font-bold text-charcoal uppercase tracking-widest">Help Center</h1>
      </div>

      <div className="max-w-xl mx-auto px-6 space-y-6 pt-2 pb-12 flex-1">
        {/* Support Options Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/about" className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Info size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-charcoal">Who We Are</span>
          </Link>
          <Link to="/blog" className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-charcoal">Our Blog</span>
          </Link>
        </div>

        {/* Detailed Help Links */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8B2323]">Customer Care</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { icon: HelpCircle, label: 'FAQ', desc: 'Frequently asked questions', path: '/faq' },
              { icon: MessageSquare, label: 'Support Center', desc: 'Get help with your orders', path: '/support' },
              { icon: ShieldCheck, label: 'Privacy Policy', desc: 'How we protect your data', path: '/privacy' },
              { icon: Truck, label: 'Shipping & Returns', desc: 'Track or return orders', path: '/return' }
            ].map((item) => (
              <Link key={item.label} to={item.path} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-gold transition-colors">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-charcoal">{item.label}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-200" />
              </Link>
            ))}
          </div>
        </div>

        {/* Trust Badges - Moved from Home Page */}
        <div className="grid grid-cols-1 gap-6 pt-4">
          {[
            { icon: ShieldCheck, title: 'Secure & Certified', desc: 'Every diamond and gold piece comes with international certifications.' },
            { icon: Truck, title: 'Priority Concierge', desc: 'Insured worldwide shipping with real-time tracking for every shipment.' },
            { icon: Gem, title: 'Artisanal Heritage', desc: 'Blending traditional techniques with contemporary luxury design.' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-5 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm group">
              <div className="w-14 h-14 rounded-2xl bg-gold/5 text-gold flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <item.icon size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-black text-charcoal uppercase tracking-wider">{item.title}</h4>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-center text-gray-400">Get in Touch</h3>
          <div className="grid grid-cols-1 gap-3">
            <a href="mailto:care@arham.com" className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                <Mail size={22} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Email Support</p>
                <p className="text-sm font-black text-charcoal">care@arham.com</p>
              </div>
            </a>
            <a href="tel:+919371504182" className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                <Phone size={22} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Call Concierge</p>
                <p className="text-sm font-black text-charcoal">+91 93715 04182</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Footer Section - Moved from top to bottom */}
      <div className="bg-charcoal text-white pt-12 pb-10 px-6 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-3xl border border-white/10 p-3 mx-auto mb-4">
            <img src="/images/logo.png?v=1.1" alt="Arham Ornaments" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">About Arham</h2>
          <p className="text-gray-400 text-sm leading-relaxed px-4">
            Crafting timeless stories since 1985. Experience the fusion of traditional heritage and modern luxury.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {[
              { name: 'Facebook', url: 'https://www.facebook.com/arhamornaments' },
              { name: 'Instagram', url: 'https://www.instagram.com/arham.ornaments?igsh=MTRvaTc2OWgxM2JtYg==' },
              { name: 'YouTube', url: 'https://www.youtube.com/@arhamornaments' }
            ].map(social => (
              <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-gold/20 hover:border-gold/30 transition-all text-gray-300">
                {social.name}
              </a>
            ))}
          </div>

          <div className="pt-8 opacity-30">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase">© {new Date().getFullYear()} ARHAM ORNAMENTS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
