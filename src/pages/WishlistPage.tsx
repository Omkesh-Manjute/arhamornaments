import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/product/ProductCard';

const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  useCart();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-offwhite">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-8 relative">
          <Heart size={40} className="text-gray-200" />
          <div className="absolute inset-0 border-2 border-gold/20 rounded-full animate-ping opacity-20"></div>
        </div>
        <h1 className="text-3xl font-heading font-bold text-charcoal mb-4 text-center uppercase tracking-widest">
          Your Wishlist is Empty
        </h1>
        <p className="text-gray-500 text-center max-w-md mb-10 leading-relaxed">
          It seems you haven't saved any treasures yet. Explore our exquisite collection and find pieces that resonate with your style.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-3 px-10 py-4 bg-emerald text-white rounded-full font-bold hover:bg-emerald/90 transition-all shadow-xl hover:-translate-y-1 group"
        >
          Discover Collection
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite pt-20 lg:pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-[0.3em]">
              <div className="w-8 h-px bg-gold/30"></div>
              Your Curated
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-charcoal flex items-center gap-4">
              WISHLIST
              <span className="text-sm font-body bg-gold/10 text-gold px-4 py-1 rounded-full border border-gold/20">
                {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
              </span>
            </h1>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-3">
            <p className="text-gray-500 max-w-xs text-sm leading-relaxed md:text-right">
              These are the pieces that captured your heart. Move them to your cart when you're ready to make them yours.
            </p>
            <button 
              onClick={() => {
                const text = `Check out my jewelry wishlist on Arham Ornaments! ✨\n\n` + 
                  wishlist.map((item, index) => `${index + 1}. ${item.name} - ${window.location.origin}/product/${item.id}`).join('\n\n');
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#25D366] text-white rounded-full font-bold hover:bg-[#128C7E] transition-all shadow-lg hover:-translate-y-0.5 text-sm"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Share Wishlist on WhatsApp
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
          {wishlist.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              
              {/* Quick Actions for Wishlist Page */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                 <button 
                  onClick={() => removeFromWishlist(product.id)}
                  className="p-2.5 bg-white/90 backdrop-blur-md text-red-500 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                  title="Remove from Wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 p-12 rounded-[3rem] bg-gradient-to-br from-charcoal to-emerald text-white overflow-hidden relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-lg text-center md:text-left">
              <h2 className="text-3xl font-heading font-bold mb-4">Ready to shine?</h2>
              <p className="text-gray-300">
                Each piece in your wishlist is a masterpiece waiting to be worn. Complete your purchase now and enjoy free BIS Hallmark certification on all items.
              </p>
            </div>
            <Link
              to="/products"
              className="px-10 py-5 bg-gold text-white rounded-full font-bold hover:bg-gold-light transition-all shadow-2xl hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Back to Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
