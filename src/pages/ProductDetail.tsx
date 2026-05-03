import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, ChevronLeft, ChevronRight, Star, Truck, Shield, RotateCcw, MessageCircle, ShoppingCart, Minus, Plus, Gem, Award, Check } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { usePrice } from '../context/PriceContext';
import { formatPrice, calculateDiscount, generateProductEnquiryMessage, openWhatsApp } from '../utils/whatsapp';
import ProductCard from '../components/ProductCard';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPurity, setSelectedPurity] = useState<string>('');
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { calculateProductPrice } = usePrice();
  
  const isFavorite = id ? isInWishlist(id) : false;
  const product = products.find(p => p.id === id);

  // Initialize selections when product loads
  useMemo(() => {
    if (product) {
      setSelectedPurity(product.purity || (product.material === 'gold' ? '22K' : ''));
      setSelectedQuality(product.diamondQuality || 'VS');
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">😕</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <Link to="/products" className="px-6 py-3 bg-amber-500 text-white rounded-full font-medium">
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
  const completeTheLook = products
    .filter(p => 
      p.id !== product.id && 
      p.material === product.material && 
      p.category !== product.category &&
      (p.occasion === product.occasion || p.featured)
    )
    .slice(0, 4);

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleWhatsAppEnquiry = () => {
    const message = generateProductEnquiryMessage({ ...product, price: currentPrice });
    openWhatsApp(message);
  };

  const handleAddToCart = () => {
    addToCart({ 
      ...product, 
      price: currentPrice,
    });
  };

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

            {/* Selection Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-gray-100">
              {product.material === 'gold' && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal">
                    Select Gold Purity
                  </label>
                  <div className="flex gap-3">
                    {['14K', '18K', '22K', '24K'].map((purity) => (
                      <button
                        key={purity}
                        onClick={() => setSelectedPurity(purity)}
                        className={`flex-1 py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          selectedPurity === purity 
                            ? 'border-gold bg-gold/5 text-gold' 
                            : 'border-gray-100 text-gray-400 hover:border-gray-200'
                        }`}
                      >
                        {purity}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.material === 'diamond' && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal">
                    Diamond Quality
                  </label>
                  <div className="flex gap-3">
                    {['SI', 'VS', 'VVS'].map((quality) => (
                      <button
                        key={quality}
                        onClick={() => setSelectedQuality(quality)}
                        className={`flex-1 py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          selectedQuality === quality 
                            ? 'border-gold bg-gold/5 text-gold' 
                            : 'border-gray-100 text-gray-400 hover:border-gray-200'
                        }`}
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price & Action */}
            <div className="space-y-8">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-heading font-black text-charcoal">
                    {formatPrice(currentPrice)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-300 line-through decoration-gold/30">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                  <Check size={12} /> Price includes current market rates & GST
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-[2] py-6 bg-charcoal text-white rounded-full font-black uppercase tracking-[0.3em] text-[10px] hover:bg-gold transition-all shadow-2xl flex items-center justify-center gap-4 group active:scale-95"
                >
                  <ShoppingCart size={18} />
                  Add to Collection
                </button>
                <button
                  onClick={handleWhatsAppEnquiry}
                  className="flex-1 py-6 border-2 border-charcoal text-charcoal rounded-full font-black uppercase tracking-[0.3em] text-[10px] hover:bg-charcoal hover:text-white transition-all flex items-center justify-center gap-4 active:scale-95"
                >
                  <MessageCircle size={18} />
                  Enquiry
                </button>
              </div>

              {/* Loyalty Preview */}
              <div className="bg-gold/5 p-6 rounded-[2rem] border border-gold/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-gold text-white rounded-full flex items-center justify-center shadow-lg">
                  <Award size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gold">Arham Elite Benefit</h4>
                  <p className="text-[11px] text-charcoal/70 mt-0.5">Earn <b>{Math.round(currentPrice/100)}</b> points with this purchase.</p>
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
        </div>

        {/* Related Products */}
        <div className="mt-32 space-y-12">
          <div className="text-center space-y-2">
            <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Gallery</h4>
            <h2 className="text-4xl font-heading font-bold text-charcoal">More from {product.category}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

