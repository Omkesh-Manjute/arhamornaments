import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/whatsapp';
import ProductCard from '../components/ProductCard';

const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

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
    <div className="min-h-screen bg-offwhite pt-32 pb-20">
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
          <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
            These are the pieces that captured your heart. Move them to your cart when you're ready to make them yours.
          </p>
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
