import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/whatsapp';
import { usePrice } from '../context/PriceContext';

interface ProductCardProps {
  product: Product;
  hidePrice?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, hidePrice = false }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { calculateProductPrice } = usePrice();

  const isFavorite = isInWishlist(product.id);
  const currentPrice = calculateProductPrice(product);
  const originalPrice = currentPrice * 1.15; // Mock original price for discount display

  return (
    <div className="relative group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gold/5">
      <Link
        to={`/product/${product.id}`}
        className="block"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-white">
          <img
            src={product.images?.[0] || ''}
            alt={product.name}
            className="w-full h-full object-contain p-4 transition-transform duration-1000 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://via.placeholder.com/400x400?text=Jewellery';
            }}
          />

          {/* Wishlist Button inside image */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm transition-all z-20 group/heart"
          >
            <Heart
              size={18}
              className={`transition-all ${isFavorite
                  ? 'fill-ruby text-ruby scale-110'
                  : 'text-gray-400 hover:text-ruby'
                }`}
            />
          </button>

          {product.trending && (
            <div className="absolute top-4 left-0">
              <span className="bg-ruby text-white text-[8px] font-bold tracking-widest px-3 py-1 rounded-r-full shadow-sm uppercase">
                Trending
              </span>
            </div>
          )}
        </div>

        {/* Content - Premium White Footer Style */}
        <div className="p-4 md:p-5 bg-white border-t border-gray-50">
          <div className="space-y-1">
            <h3 className="font-heading text-xs md:text-sm font-bold text-ruby truncate group-hover:text-ruby/80 transition-colors">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between mt-2">
              {(product.grossWeight || product.netWeight) && (
                <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                  {product.grossWeight?.toFixed(2)}g | 22KT
                </p>
              )}
              {!hidePrice ? (
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-charcoal">
                    {formatPrice(currentPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explore <span className="text-[12px] leading-none">→</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>

  );
};

export default ProductCard;
