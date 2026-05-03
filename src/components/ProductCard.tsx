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
    <div className="group bg-white luxury-card rounded-[2.5rem] p-3 transition-all duration-700 overflow-hidden border border-gray-100 shadow-sm">
      {/* Image Container */}
      <div className="block relative aspect-square overflow-hidden bg-offwhite rounded-[2rem]">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            loading="lazy"
          />
        </Link>
        
        {/* Actions Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3 pointer-events-none group-hover:pointer-events-auto">
           <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-charcoal hover:bg-gold hover:text-white transition-all transform translate-y-10 group-hover:translate-y-0 duration-500"
          >
            <ShoppingBag size={20} />
          </button>
           <Link 
            to={`/product/${product.id}`}
            className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-charcoal hover:bg-gold hover:text-white transition-all transform translate-y-10 group-hover:translate-y-0 duration-500 delay-75"
          >
            <Eye size={20} />
          </Link>
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all z-10 ${
            isFavorite 
              ? 'bg-red-500 text-white scale-110' 
              : 'bg-white/80 backdrop-blur-md text-charcoal hover:bg-white'
          }`}
        >
          <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
        </button>

        {/* Badges */}
        {product.trending && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-charcoal/80 backdrop-blur-md text-white text-[9px] uppercase tracking-[0.3em] font-black px-4 py-1.5 rounded-full shadow-lg border border-white/10">
              Trending
            </span>
          </div>
        )}
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
        <Link to={`/product/${product.id}`}>
          <h3 className="font-heading text-xl font-bold text-charcoal hover:text-gold transition line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <p className="text-xl font-heading font-black text-charcoal">{formatPrice(currentPrice)}</p>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className="fill-gold text-gold" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
