import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/whatsapp';
import { usePrice } from '../context/PriceContext';

interface ProductCardProps {
  product: Product;
  hidePrice?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, hidePrice = false }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { calculateProductPrice } = usePrice();
  
  const isFavorite = isInWishlist(product.id);
  const currentPrice = calculateProductPrice(product);

  return (
    <div className="relative group">
      <Link 
        to={`/product/${product.id}`}
        className="block bg-white rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl border border-gray-100"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.images?.[0] || ''}
            alt={product.name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-[1.5s]"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://via.placeholder.com/400x400?text=Jewellery';
              // Alternatively, hide the image and show a fallback div (but difficult in simple img tag)
            }}
          />
          
          {/* Subtle Badges */}
          {product.trending && (
            <div className="absolute top-4 left-4">
              <span className="bg-white/90 backdrop-blur-md text-charcoal text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full shadow-sm border border-gray-100">
                Trending
              </span>
            </div>
          )}

        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">
              {product.category}
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={8} className="fill-gold text-gold" />
              ))}
            </div>
          </div>
          
          <h3 className="font-heading text-lg font-bold text-charcoal group-hover:text-gold transition-colors line-clamp-1">
            {product.name}
          </h3>
          
          {/* Tech Specs Grid */}
          {(product.grossWeight || product.netWeight) && (
            <div className="grid grid-cols-2 gap-2 py-2 border-y border-gray-100/50">
              {product.grossWeight && (
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase text-gray-400 font-bold">Gross Wt</span>
                  <span className="text-xs font-bold text-charcoal">{product.grossWeight.toFixed(3)}g</span>
                </div>
              )}
              {product.netWeight && (
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase text-gray-400 font-bold">Net Wt</span>
                  <span className="text-xs font-bold text-charcoal">{product.netWeight.toFixed(3)}g</span>
                </div>
              )}
            </div>
          )}

          {!hidePrice && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-lg font-black text-charcoal tracking-tight">
                {formatPrice(currentPrice)}
              </p>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart(product, 1);
                }}
                className="w-10 h-10 rounded-full bg-offwhite flex items-center justify-center hover:bg-gold hover:text-white transition-colors group/btn shadow-sm"
              >
                <ShoppingBag size={18} className="group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md transition-all z-20 ${
          isFavorite 
            ? 'bg-red-500 text-white scale-110' 
            : 'bg-white/80 backdrop-blur-md text-charcoal hover:bg-white'
        }`}
      >
        <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
      </button>
    </div>
  );
};

export default ProductCard;
