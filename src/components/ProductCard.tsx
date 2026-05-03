import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/whatsapp';
import { usePrice } from '../context/PriceContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { calculateProductPrice } = usePrice();
  
  const isFavorite = isInWishlist(product.id);
  const currentPrice = calculateProductPrice(product);



  return (
    <div className="relative">
      <Link 
        to={`/product/${product.id}`}
        className="block group bg-white luxury-card rounded-[2.5rem] p-3 transition-all duration-700 border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-offwhite rounded-[2rem]">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <span className="bg-[#FFF3E0]/90 backdrop-blur-sm text-[#E65100] text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-md border border-[#FFE0B2]">
              Make Order
            </span>
            {product.trending && (
              <span className="bg-charcoal/80 backdrop-blur-md text-white text-[9px] uppercase tracking-[0.3em] font-black px-4 py-1.5 rounded-full shadow-lg border border-white/10">
                Trending
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="py-6 px-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
              {product.category}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-black">
              {product.material}
            </p>
          </div>
          <h3 className="font-heading text-xl font-bold text-charcoal transition line-clamp-1 uppercase">
            {product.name}
          </h3>
          
          {(product.grossWeight || product.netWeight) && (
            <div className="space-y-0.5 py-1">
              {product.grossWeight && (
                <p className="text-xs text-gray-500 font-medium">Gwt : {product.grossWeight.toFixed(3)}</p>
              )}
              {product.netWeight && (
                <p className="text-xs text-gray-500 font-medium">Nwt : {product.netWeight.toFixed(3)}</p>
              )}
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <p className="text-xl font-black text-charcoal">{formatPrice(currentPrice)}</p>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} className="fill-gold text-gold" />
              ))}
            </div>
          </div>
        </div>
      </Link>

      {/* Wishlist Button - Placed outside the Link to avoid nested interactivity issues */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute top-7 right-7 p-3 rounded-full shadow-lg transition-all z-30 ${
          isFavorite 
            ? 'bg-red-500 text-white scale-110' 
            : 'bg-white/80 backdrop-blur-md text-charcoal hover:bg-white'
        }`}
      >
        <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
      </button>
    </div>
  );
};

export default ProductCard;
