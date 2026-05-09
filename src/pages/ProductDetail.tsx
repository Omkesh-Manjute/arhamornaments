import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, Star, Truck, Shield, RotateCcw, MessageCircle, Minus, Plus, Award, Phone } from 'lucide-react';
import { products as staticProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { usePrice } from '../context/PriceContext';
import { formatPrice, calculateDiscount, generateProductEnquiryMessage, openWhatsApp } from '../utils/whatsapp';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { Product } from '../types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPurity, setSelectedPurity] = useState<string>('');
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { calculateProductPrice } = usePrice();
  
  const isFavorite = id ? isInWishlist(id) : false;

  // Fetch product from Firestore or Static
  React.useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      
      try {
        // 1. Try database first (source of truth)
        const dbProduct = await productService.getProductById(id);
        if (dbProduct) {
          setProduct(dbProduct);
        } else {
          // 2. Fallback to static data
          const staticP = staticProducts.find(p => p.id === id);
          setProduct(staticP || null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        const staticP = staticProducts.find(p => p.id === id);
        setProduct(staticP || null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  // Initialize selections when product loads
  React.useEffect(() => {
    if (product) {
      setSelectedPurity(product.purity || (product.material === 'gold' ? '22K' : ''));
      setSelectedQuality(product.diamondQuality || 'VS');
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gold font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading Luxury...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7]">
        <div className="text-center space-y-6">
          <span className="text-8xl block animate-bounce">😕</span>
          <h2 className="text-3xl font-heading font-bold text-charcoal">Product Not Found</h2>
          <p className="text-gray-500 max-w-xs mx-auto">The item you're looking for might have been moved or is no longer available.</p>
          <Link to="/products" className="inline-block px-10 py-4 bg-gold text-white rounded-full font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-transform">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = calculateProductPrice(product, selectedPurity);
  
  const discount = product.originalPrice 
    ? calculateDiscount(product.originalPrice, currentPrice) 
    : 0;

  // AI Recommendations: "Complete the Look"
  // Logic: Same material, different category, similar occasion
  const completeTheLook = staticProducts
    .filter(p => 
      p.id !== product.id && 
      p.material === product.material && 
      p.category === product.category &&
      (p.occasion === product.occasion || p.featured)
    )
    .slice(0, 4);

  const relatedProducts = useMemo(() => {
    let related = staticProducts.filter(p => p.category === product.category && p.id !== product.id);
    
    // Fallback: If no similar products in same category, show trending/featured items from other categories
    if (related.length === 0) {
      related = staticProducts.filter(p => p.id !== product.id && (p.trending || p.featured));
    }
    
    return related.slice(0, 4);
  }, [product?.id, product?.category]);

  const handleWhatsAppEnquiry = () => {
    const message = generateProductEnquiryMessage({ ...product, price: currentPrice });
    openWhatsApp(message);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      selectedPurity,
      selectedQuality
    });
  };

  // Recently Viewed Logic
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  React.useEffect(() => {
    if (product) {
      // 1. Get existing from local storage
      const stored = localStorage.getItem('recentlyViewed');
      let viewedIds: string[] = stored ? JSON.parse(stored) : [];

      // 2. Filter out current and ensure uniqueness
      viewedIds = viewedIds.filter(id => id !== product.id);
      
      // 3. Update state with what was already there (before adding current)
      const viewedProducts = viewedIds
        .map(id => staticProducts.find(p => p.id === id))
        .filter((p): p is any => !!p)
        .slice(0, 4);
      
      setRecentlyViewed(viewedProducts);

      // 4. Add current ID to the front for NEXT page visit
      viewedIds.unshift(product.id);
      const limitedIds = viewedIds.slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(limitedIds));
    }
  }, [product?.id]);

  return (
    <div className="min-h-screen bg-[#FCFBF7]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
            <Link to="/" className="hover:text-gold">Home</Link>
            <span className="text-gray-200">/</span>
            <Link to="/products" className="hover:text-gold">Products</Link>
            <span className="text-gray-200">/</span>
            <span className="text-gold truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-white shadow-2xl group">
              <img
                src={product.images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              
              {/* Floating Badges */}
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                {product.trending && (
                  <span className="bg-charcoal text-white text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full shadow-xl">
                    Trending Now
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-gold text-white text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full shadow-xl">
                    {discount}% Exclusive Offer
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 justify-center">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
                    index === currentImage ? 'border-gold scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gold">
                  {product.material} Collection
                </span>
                <div className="h-px flex-1 bg-gray-100"></div>
                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-gold text-gold" />
                  <span className="text-xs font-bold text-charcoal">{product.rating}</span>
                </div>
              </div>
              <h1 className="text-5xl font-heading font-bold text-charcoal leading-tight">
                {product.name}
              </h1>
              <p className="text-gray-500 font-medium leading-relaxed max-w-lg">
                {product.description}
              </p>
            </div>

            {/* Utility Bar */}
            <div className="grid grid-cols-4 gap-4 py-6 border-y border-gray-100">
              <a href="tel:+919876543210" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <Phone size={20} />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Call</span>
              </a>
              <button 
                onClick={() => toggleWishlist(product)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center transition-all ${isFavorite ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-400 group-hover:bg-red-50 group-hover:text-red-500'}`}>
                  <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Favorite</span>
              </button>
              <button 
                onClick={handleWhatsAppEnquiry}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                  <MessageCircle size={20} />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Whatsapp</span>
              </button>
              <button className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Share2 size={20} />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Share</span>
              </button>
            </div>

            {/* Spec Table */}
            <div className="space-y-4 py-6">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-gray-400 font-medium">Design No.</span>
                <span className="text-gray-400 font-medium text-center">:</span>
                <span className="text-charcoal font-black uppercase">{product.designNo || 'N/A'}</span>

                <span className="text-gray-400 font-medium">Size</span>
                <span className="text-gray-400 font-medium text-center">:</span>
                <span className="text-charcoal font-black">{product.size || '-:-'}</span>

                <span className="text-gray-400 font-medium">Purity</span>
                <span className="text-gray-400 font-medium text-center">:</span>
                <div className="flex gap-2">
                   {['18K', '22K', '24K'].map(p => (
                     <button 
                        key={p}
                        onClick={() => setSelectedPurity(p)}
                        className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all ${selectedPurity === p ? 'bg-gold text-white border-gold' : 'border-gray-200 text-gray-400'}`}
                     >
                       {p}
                     </button>
                   ))}
                </div>

                <span className="text-gray-400 font-medium">Gross Weight</span>
                <span className="text-gray-400 font-medium text-center">:</span>
                <span className="text-charcoal font-black">{product.grossWeight?.toFixed(3) || '0.000'}</span>

                <span className="text-gray-400 font-medium">Net Weight</span>
                <span className="text-gray-400 font-medium text-center">:</span>
                <span className="text-charcoal font-black">{product.netWeight?.toFixed(3) || '0.000'}</span>

                <span className="text-gray-400 font-medium">Lbr %</span>
                <span className="text-gray-400 font-medium text-center">:</span>
                <span className="text-charcoal font-black">{product.laborCharges || '0'} %</span>

                <span className="text-gray-400 font-medium">Total Amount</span>
                <span className="text-gray-400 font-medium text-center">:</span>
                <span className="text-gold font-black text-lg">{formatPrice(currentPrice * quantity)}</span>

                <span className="text-gray-400 font-medium">Order Pcs</span>
                <span className="text-gray-400 font-medium text-center">:</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-10">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 hover:bg-gray-50 transition-colors text-gray-400"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 font-black text-sm border-x border-gray-200 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 hover:bg-gray-50 transition-colors text-gray-400"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Description Input */}
              <div className="pt-4">
                <div className="relative">
                  <textarea 
                    placeholder="Description"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-sm resize-none h-12"
                  />
                </div>
              </div>
            </div>

            {/* Price & Action */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleWhatsAppEnquiry}
                  className="flex-1 py-5 bg-white border border-gray-200 text-charcoal rounded-xl font-black uppercase tracking-widest text-[11px] hover:border-gold hover:text-gold transition-all shadow-sm active:scale-95"
                >
                  Get Quote
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-5 bg-charcoal text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-gold transition-all shadow-xl active:scale-95"
                >
                  Add to Cart
                </button>
              </div>

              {/* Loyalty Preview */}
              <div className="bg-gold/5 p-4 rounded-2xl border border-gold/10 flex items-center gap-4">
                <div className="w-10 h-10 bg-gold text-white rounded-full flex items-center justify-center shadow-md">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-gold">Elite Rewards</h4>
                  <p className="text-[10px] text-charcoal/70 mt-0.5">Earn <b>{Math.round((currentPrice * quantity)/100)}</b> points</p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="flex flex-col items-center text-center space-y-2">
                <Shield className="text-gold" size={24} />
                <span className="text-[9px] font-black uppercase tracking-widest text-charcoal">BIS Hallmarked</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <RotateCcw className="text-gold" size={24} />
                <span className="text-[9px] font-black uppercase tracking-widest text-charcoal">Life Exchange</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Truck className="text-gold" size={24} />
                <span className="text-[9px] font-black uppercase tracking-widest text-charcoal">Insured Transit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Complete the Look Section */}
        {completeTheLook.length > 0 && (
          <div className="mt-32 space-y-12">
            <div className="text-center space-y-2">
              <h4 className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">Curated Set</h4>
              <h2 className="text-4xl font-heading font-bold text-charcoal">Complete The Look</h2>
              <div className="w-12 h-1 bg-gold mx-auto mt-4"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {completeTheLook.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Similar Products */}
        <div className="mt-32 space-y-12">
          <div className="text-center space-y-2">
            <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Collection</h4>
            <h2 className="text-4xl font-heading font-bold text-charcoal">Similar Products</h2>
            <div className="w-12 h-1 bg-gold mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <div className="mt-32 space-y-12">
            <div className="text-center space-y-2">
              <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">History</h4>
              <h2 className="text-4xl font-heading font-bold text-charcoal">Recently Viewed</h2>
              <div className="w-12 h-1 bg-gold mx-auto mt-4"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentlyViewed.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
