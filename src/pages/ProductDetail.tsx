import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, Star, Truck, Shield, RotateCcw, MessageCircle, Minus, Plus, Phone } from 'lucide-react';
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
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPurity, setSelectedPurity] = useState<string>('22K');
  const [selectedQuality, setSelectedQuality] = useState<string>('VS');
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [direction, setDirection] = useState(0);

  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { calculateProductPrice } = usePrice();
  
  const isFavorite = id ? isInWishlist(id) : false;

  // Fetch product from Firestore or Static
  React.useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      if (!product) setLoading(true);

      
      try {
        const dbProduct = await productService.getProductById(id);
        if (dbProduct) {
          setProduct(dbProduct);
        } else {
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

  // Fetch all products for recommendations
  React.useEffect(() => {
    const fetchAll = async () => {
      try {
        const fetched = await productService.getAllProducts();
        setDbProducts(fetched);
      } catch (error) {
        console.error("Error fetching all products:", error);
      }
    };
    fetchAll();
  }, []);

  // Update defaults when product loads
  React.useEffect(() => {
    if (product) {
      if (product.purity) setSelectedPurity(product.purity);
      else if (product.material === 'gold') setSelectedPurity('22K');
    }
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const source = dbProducts.length > 0 ? dbProducts : staticProducts;
    return source.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [product?.id, product?.category, dbProducts]);

  const completeTheLook = useMemo(() => {
    if (!product) return [];
    const source = dbProducts.length > 0 ? dbProducts : staticProducts;
    return source
      .filter(p => 
        p.id !== product.id && 
        p.material === product.material && 
        p.category === product.category &&
        (p.occasion === product.occasion || p.featured)
      )
      .slice(0, 4);
  }, [product?.id, product?.category, dbProducts]);

  // Recently Viewed Logic
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  React.useEffect(() => {
    if (product) {
      const stored = localStorage.getItem('recentlyViewed');
      let viewedIds: string[] = stored ? JSON.parse(stored) : [];
      viewedIds = viewedIds.filter(vId => vId !== product.id);
      const source = dbProducts.length > 0 ? dbProducts : staticProducts;
      const viewedProducts = viewedIds
        .map(vId => source.find(p => p.id === vId))
        .filter((p): p is Product => !!p)
        .slice(0, 4);
      setRecentlyViewed(viewedProducts);
      viewedIds.unshift(product.id);
      localStorage.setItem('recentlyViewed', JSON.stringify(viewedIds.slice(0, 10)));
    }
  }, [product?.id, dbProducts]);

  // Navigation between products logic
  const siblingProducts = useMemo(() => {
    if (!product) return [];
    const source = dbProducts.length > 0 ? dbProducts : staticProducts;
    return source.filter(p => p.category === product.category);
  }, [product?.category, dbProducts]);

  // Touch handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  if (loading && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gold font-bold uppercase tracking-widest text-[10px]">Loading Luxury...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7]">
        <div className="text-center space-y-6">
          <span className="text-8xl block">😕</span>
          <h2 className="text-3xl font-heading font-bold text-charcoal">Product Not Found</h2>
          <Link to="/products" className="inline-block px-10 py-4 bg-gold text-white rounded-full font-black uppercase tracking-widest text-xs">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = calculateProductPrice(product, selectedPurity);

  const navigateToSibling = (dir: 'next' | 'prev') => {
    if (siblingProducts.length <= 1) return;
    const currentIndex = siblingProducts.findIndex(p => p.id === product?.id);
    if (currentIndex === -1) return;

    setDirection(dir === 'next' ? 1 : -1);

    let nextIndex;
    if (dir === 'next') {
      nextIndex = (currentIndex + 1) % siblingProducts.length;
    } else {
      nextIndex = (currentIndex - 1 + siblingProducts.length) % siblingProducts.length;
    }
    
    const nextProduct = siblingProducts[nextIndex];
    if (nextProduct && nextProduct.id !== product?.id) {
      setCurrentImage(0);
      navigate(`/product/${nextProduct.id}`);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const handleTouchEnd = (isImageArea: boolean) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 70;
    
    if (isSwipe) {
      const imagesCount = product?.images?.length || 1;
      if (isImageArea && imagesCount > 1) {
        if (distance > 0 && currentImage < imagesCount - 1) {
          setCurrentImage(prev => prev + 1);
          return;
        } else if (distance < 0 && currentImage > 0) {
          setCurrentImage(prev => prev - 1);
          return;
        }
      }
      
      if (distance > 0) navigateToSibling('next');
      else navigateToSibling('prev');
    }
  };

  const handleWhatsAppEnquiry = () => {
    const message = generateProductEnquiryMessage({ ...product, price: currentPrice });
    openWhatsApp(message);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, { selectedPurity, selectedQuality });
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] relative overflow-x-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div 
          key={product.id}
          custom={direction}
          variants={{
            enter: (direction: number) => ({
              x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
              opacity: 0,
            }),
            center: {
              x: 0,
              opacity: 1,
              zIndex: 1,
            },
            exit: (direction: number) => ({
              x: direction > 0 ? '-100%' : direction < 0 ? '100%' : 0,
              opacity: 0,
              zIndex: 0,
            })
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 35 },
            opacity: { duration: 0.2 },
          }}
          className="w-full absolute top-0 left-0"
        >
          {/* MOBILE LAYOUT */}
          <div className="lg:hidden bg-[#FCFBF7]">
            {/* Simple Horizontal Slider */}
            <div 
              className="relative bg-white pt-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={(e) => {
                e.stopPropagation();
                handleTouchEnd(true);
              }}
            >
              <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-[50vh]">
                {product.images?.map((img, i) => (
                  <div key={i} className="w-full h-full flex-shrink-0 snap-center px-4">
                    <img src={img} alt="" className="w-full h-full object-contain p-4" />
                  </div>
                ))}
              </div>
              
              {/* Indicators */}
              {(product.images?.length || 0) > 1 && (
                <div className="flex justify-center gap-2 mt-4 pb-2">
                  {product.images?.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentImage ? 'w-6 bg-gold' : 'w-2 bg-gray-200'}`} />
                  ))}
                </div>
              )}

              <button onClick={() => navigate(-1)} className="absolute top-8 right-6 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center">
                ‹
              </button>
            </div>

            {/* Details Section */}
            <div 
              className="px-5 pt-8 pb-32 space-y-6"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(false)}
            >
              <div>
                <span className="text-[10px] font-black uppercase text-gold">{product.material} Collection</span>
                <h1 className="text-3xl font-heading font-bold text-charcoal">{product.name}</h1>
              </div>

              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex items-center justify-between">
                <span className="text-2xl font-black text-charcoal">{formatPrice(currentPrice * quantity)}</span>
                <div className="flex items-center border border-gray-100 rounded-xl overflow-hidden scale-90">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-50 text-gray-400">
                    <Minus size={14} />
                  </button>
                  <span className="px-3 py-1 font-black text-charcoal border-x border-gray-50 min-w-[2rem] text-center text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-50 text-gray-400">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Details Table */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 space-y-4">
                <h4 className="text-xs font-black uppercase text-gold">Product Specifications</h4>
                {[
                  ['Design No.', product.designNo || 'N/A'],
                  ['Gross Weight', `${product.grossWeight?.toFixed(3) || '0.000'} g`],
                  ['Net Weight', `${product.netWeight?.toFixed(3) || '0.000'} g`],
                  ['Material', product.material.toUpperCase()],
                  ['Purity', product.purity || (product.material === 'gold' ? '22K' : 'N/A')],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-charcoal font-black">{value}</span>
                  </div>
                ))}
              </div>

              {/* Actions moved from bottom bar */}
              <div className="flex gap-3 pt-2">
                <button onClick={handleWhatsAppEnquiry} className="flex-1 py-4 bg-white border-2 border-charcoal text-charcoal rounded-2xl font-black shadow-sm">Get Quote</button>
                <button onClick={handleAddToCart} className="flex-1 py-4 bg-charcoal text-white rounded-2xl font-black shadow-lg shadow-charcoal/10">Add to Cart</button>
              </div>

              {product.description && (
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 space-y-4">
                  <h4 className="text-xs font-black uppercase text-gold">Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

            </div>
          </div>

          {/* DESKTOP LAYOUT */}
          <div className="hidden lg:block max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-2 gap-12 items-start">
              {/* Left: Sticky Image Gallery */}
              <div className="sticky top-24 space-y-4">
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-white shadow-xl border border-gray-100">
                  <img src={product.images?.[currentImage] || ''} alt="" className="w-full h-full object-contain p-4" />
                </div>
                {/* Thumbnails */}
                {(product.images?.length || 0) > 1 && (
                  <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                    {product.images?.map((img, i) => (
                      <button 
                        key={i} 
                        onClick={() => setCurrentImage(i)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${i === currentImage ? 'border-gold shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Details */}
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-gold tracking-[0.4em]">{product.material} Collection</span>
                  <h1 className="text-4xl font-heading font-bold text-charcoal leading-tight">{product.name}</h1>
                </div>
                
                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-charcoal">{formatPrice(currentPrice * quantity)}</p>
                    {product.originalPrice && (
                      <p className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Qty</span>
                    <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden bg-white">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-50 text-gray-400 transition-colors"><Minus size={14} /></button>
                      <span className="px-4 font-black text-charcoal min-w-[2.5rem] text-center">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-50 text-gray-400 transition-colors"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>

                {/* Product Specifications - MOVED UP */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gold tracking-[0.3em]">Product Specifications</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Design No.', product.designNo || 'N/A'],
                      ['Gross Weight', `${product.grossWeight?.toFixed(3) || '0.000'} g`],
                      ['Net Weight', `${product.netWeight?.toFixed(3) || '0.000'} g`],
                      ['Purity', product.purity || (product.material === 'gold' ? '22K' : 'N/A')],
                    ].map(([label, value]) => (
                      <div key={label} className="p-4 bg-white rounded-2xl border border-gray-50 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow duration-300">
                        <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest">{label}</span>
                        <p className="text-charcoal font-bold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Shield, label: 'BIS Hallmarked' },
                    { icon: Truck, label: 'Free Shipping' },
                    { icon: RotateCcw, label: 'Easy Returns' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-[#F9F8F3] rounded-xl border border-gray-100">
                      <item.icon size={14} className="text-gold" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Actions - MOVED DOWN */}
                <div className="flex gap-4 pt-2">
                  <button onClick={handleWhatsAppEnquiry} className="flex-1 py-4 bg-white border-2 border-charcoal text-charcoal rounded-2xl font-black hover:bg-charcoal hover:text-white transition-all duration-300 transform hover:-translate-y-1">Get Quote</button>
                  <button onClick={handleAddToCart} className="flex-1 py-4 bg-charcoal text-white rounded-2xl font-black hover:shadow-xl hover:shadow-charcoal/20 transition-all duration-300 transform hover:-translate-y-1">Add to Cart</button>
                </div>

                {product.description && (
                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-[10px] font-black uppercase text-gold tracking-[0.3em] mb-2">Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Related sections */}
            {relatedProducts.length > 0 && (
              <div className="mt-32 space-y-12">
                <div className="text-center space-y-2">
                  <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Collection</h4>
                  <h2 className="text-4xl font-heading font-bold text-charcoal">Related Products</h2>
                  <div className="w-12 h-1 bg-gold mx-auto mt-4" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}
            {recentlyViewed.length > 0 && (
              <div className="mt-32 space-y-12">
                <div className="text-center space-y-2">
                  <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">History</h4>
                  <h2 className="text-4xl font-heading font-bold text-charcoal">Recently Viewed</h2>
                  <div className="w-12 h-1 bg-gold mx-auto mt-4" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {recentlyViewed.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
