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
    <div className="relative group bg-white">
      <Link
        to={`/product/${product.id}`}
        className="block transition-all duration-300"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#fdfdfd] border border-gray-50">
          <img
            src={product.images?.[0] || ''}
            alt={product.name}
            className="w-full h-full object-contain p-3 transition-transform duration-700 group-hover:scale-105"
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
            className="absolute top-3 right-3 p-1.5 transition-all z-20 group/heart"
          >
            <Heart
              size={20}
              className={`transition-all ${isFavorite
                  ? 'fill-[#de57e5] text-[#de57e5] scale-110'
                  : 'text-gray-400 hover:text-[#de57e5]'
                }`}
            />
          </button>

          {product.trending && (
            <div className="absolute top-3 left-0">
              <span className="bg-[#f3e5f5] text-[#ab47bc] text-[9px] font-bold px-2 py-0.5 rounded-r-md shadow-sm">
                TRENDING
              </span>
            </div>
          )}
        </div>

        {/* Content - Compact Style */}
        <div className="mt-3 px-1 space-y-1">
          {/* Price & Rating Row */}
          <div className="flex items-center justify-between">
            {!hidePrice && (
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-bold text-[#333]">
                  {formatPrice(currentPrice)}
                </span>
                <span className="text-[11px] text-gray-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded">
              <span className="text-[11px] font-bold text-gray-600">4.7</span>
              <Star size={10} className="fill-[#ffc107] text-[#ffc107]" />
              <span className="text-[9px] text-gray-400 border-l border-gray-200 ml-1 pl-1">(12)</span>
            </div>
          </div>

          {/* Discount/Offer Tag */}
          <p className="text-[11px] font-medium text-[#00a69c]">
            15% OFF on Making Charge
          </p>

          {/* Product Name - Minimal & Subtle */}
          <h3 className="text-[11px] text-gray-500 font-medium truncate mt-1">
            {product.name}
          </h3>

          {/* Weight Info - Very Small */}
          {(product.grossWeight || product.netWeight) && (
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">
              {product.grossWeight?.toFixed(2)}g | 22KT Gold
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
