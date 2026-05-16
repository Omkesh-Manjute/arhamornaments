import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Share2, Star, Truck, Shield, RotateCcw, MessageCircle, Minus, Plus, Phone } from 'lucide-react';
import { products as staticProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { usePrice } from '../context/PriceContext';
import { formatPrice, calculateDiscount, generateProductEnquiryMessage, openWhatsApp } from '../utils/whatsapp';
import ProductCard from '../components/product/ProductCard';
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
                  <div key={i} className="w-full h-full flex-shrink-0 snap-center px-0">
                    <img src={img} alt="" className="w-full h-full object-cover p-0" />
                  </div>
                ))}
              </div>

              {siblingProducts.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToSibling('prev');
                    }}
                    aria-label="Previous product"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 shadow-lg rounded-full flex items-center justify-center text-charcoal active:scale-95 transition-all z-10"
                  >
                    <ChevronLeft size={22} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToSibling('next');
                    }}
                    aria-label="Next product"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 shadow-lg rounded-full flex items-center justify-center text-charcoal active:scale-95 transition-all z-10"
                  >
                    <ChevronRight size={22} strokeWidth={2.5} />
                  </button>
                </>
              )}

              {/* Indicators */}
              {(product.images?.length || 0) > 1 && (
                <div className="flex justify-center gap-2 mt-4 pb-2">
                  {product.images?.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentImage ? 'w-6 bg-gold' : 'w-2 bg-gray-200'}`} />
                  ))}
                </div>
              )}

            </div>

            {/* Details Section - EXACT MATCH TO IMAGE */}
            <div
              className="px-5 pt-4 pb-32 space-y-6 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(false)}
            >
              {/* Icon Actions Row */}
              <div className="grid grid-cols-4 pt-4">
                {[
                  { icon: Phone, label: 'Call', onClick: () => window.location.href = 'tel:+919371504182', color: 'text-orange-500', bg: 'bg-orange-50' },
                  { icon: Heart, label: 'Favorite', onClick: () => toggleWishlist(product), color: isFavorite ? 'text-red-500' : 'text-gray-400', bg: 'bg-red-50', fill: isFavorite },
                  { icon: MessageCircle, label: 'Whatsapp', onClick: handleWhatsAppEnquiry, color: 'text-green-500', bg: 'bg-green-50' },
                  { icon: Share2, label: 'Share', onClick: () => navigator.share?.({ title: product.name, url: window.location.href }), color: 'text-blue-500', bg: 'bg-blue-50' }
                ].map((item, i) => (
                  <button key={i} onClick={item.onClick} className="flex flex-col items-center gap-2 group">
                    <div className={`w-14 h-14 rounded-full ${item.bg} flex items-center justify-center transition-all active:scale-90 shadow-sm border border-gray-100`}>
                      <item.icon size={24} className={item.color} fill={item.fill ? 'currentColor' : 'none'} />
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="h-px bg-gray-100 mx-2"></div>

              {/* Specification Table */}
              <div className="space-y-4 px-2">
                {[
                  ['Design No.', product.designNo || 'N/A'],
                  ['Size', '-:-'],
                  ['Purity', product.purity || '18K'],
                  ['Gross Weight', `${product.grossWeight?.toFixed(2) || '0.00'}`],
                  ['Net Weight', `${product.netWeight?.toFixed(3) || '0.000'} g`],
                  ['Making Charge', `${product.makingCharge || product.laborCharges || '0'}%`],
                  ['Total Amount', formatPrice(currentPrice * quantity), 'text-green-600 font-black'],
                ].map(([label, value, extraClass], i) => (
                  <div key={i} className="flex items-center text-sm">
                    <span className="w-1/3 text-gray-500 font-medium">{label}</span>
                    <span className="text-gray-300 mx-2">:</span>
                    <span className={`flex-1 text-charcoal font-bold ${extraClass || ''}`}>{value}</span>
                  </div>
                ))}

                {/* Quantity Row */}
                <div className="flex items-center text-sm pt-2">
                  <span className="w-1/3 text-gray-500 font-medium">Order Pcs</span>
                  <span className="text-gray-300 mx-2">:</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-orange-400 font-black">-</button>
                      <div className="w-12 h-10 flex items-center justify-center font-black text-charcoal border-x border-gray-100">{quantity}</div>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-orange-400 font-black">+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Box */}
              <div className="px-2">
                <div className="w-full p-4 rounded-2xl border border-gray-200 min-h-[80px]">
                  <p className="text-xs text-gray-400 font-medium mb-1">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product.description || 'Exquisite piece from our signature collection.'}
                  </p>
                </div>
              </div>

              {/* Primary Buttons */}
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleWhatsAppEnquiry}
                  className="flex-1 py-4 bg-white border-2 border-gray-100 text-[#5D5D81] rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm active:scale-95 transition-all"
                >
                  Get Quote
                </button>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-[#1A1A1A] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-black/10 active:scale-95 transition-all"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* DESKTOP LAYOUT */}
          <div className="hidden lg:block max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-2 gap-12 items-start">
              {/* Left: Sticky Image Gallery */}
              <div className="sticky top-24 space-y-4">
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-white shadow-xl border border-gray-100">
                  <img src={product.images?.[currentImage] || ''} alt="" className="w-full h-full object-cover p-0" />
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
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-gold tracking-[0.4em]">{product.material} Collection</span>
                  <h1 className="text-4xl font-heading font-bold text-charcoal leading-tight">{product.name}</h1>
                </div>

                {/* Product Specifications - Refined List */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#8B2323]">Technical Specifications</h4>
                    <span className="text-[10px] font-bold text-gray-400">ID: {product.designNo}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-y-3">
                    {[
                      ['Design No.', product.designNo || 'N/A'],
                      ['Purity', product.purity || (product.material === 'gold' ? '22K' : 'N/A')],
                      ['Gross Weight', `${product.grossWeight?.toFixed(3) || '0.000'} g`],
                      ['Net Weight', `${product.netWeight?.toFixed(3) || '0.000'} g`],
                      ['Making Charge', `${product.makingCharge || product.laborCharges || '0'}%`],
                      ['Material', product.material.toUpperCase()],
                      ['Total Amount', formatPrice(currentPrice * quantity), 'text-green-600 font-black'],
                    ].map(([label, value, extraClass]) => (
                      <div key={label} className="flex justify-between items-center group">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                        <div className="flex-1 border-b border-dotted border-gray-200 mx-6 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                        <span className={`text-sm font-black text-charcoal ${extraClass || ''}`}>{value}</span>
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

                {/* Actions Section */}
                <div className="space-y-8 pt-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Select Quantity</span>
                    <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-400 transition-colors border-r border-gray-100"><Minus size={14} /></button>
                      <span className="px-6 font-black text-charcoal min-w-[3.5rem] text-center text-sm">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-400 transition-colors border-l border-gray-100"><Plus size={14} /></button>
                    </div>
                  </div>

                  {/* Main Buttons */}
                  <div className="flex gap-4">
                    <button onClick={handleWhatsAppEnquiry} className="flex-1 py-4 bg-white border-2 border-charcoal text-charcoal rounded-2xl font-black hover:bg-charcoal hover:text-white transition-all duration-300 transform hover:-translate-y-1">Get Quote</button>
                    <button onClick={handleAddToCart} className="flex-1 py-4 bg-charcoal text-white rounded-2xl font-black hover:shadow-xl hover:shadow-charcoal/20 transition-all duration-300 transform hover:-translate-y-1">Add to Cart</button>
                  </div>

                  {/* Action Icons Row */}
                  <div className="flex justify-around pt-2">
                    {[
                      { icon: Phone, label: 'Call', onClick: () => window.location.href = 'tel:+919371504182', color: 'text-orange-500', bg: 'bg-orange-50' },
                      { icon: Heart, label: 'Favorite', onClick: () => toggleWishlist(product), color: isFavorite ? 'text-red-500' : 'text-gray-400', bg: 'bg-red-50', fill: isFavorite },
                      { icon: MessageCircle, label: 'Whatsapp', onClick: handleWhatsAppEnquiry, color: 'text-green-500', bg: 'bg-green-50' },
                      { icon: Share2, label: 'Share', onClick: () => navigator.share?.({ title: product.name, url: window.location.href }), color: 'text-blue-500', bg: 'bg-blue-50' }
                    ].map((item, i) => (
                      <button key={i} onClick={item.onClick} className="flex flex-col items-center gap-3 group">
                        <div className={`w-14 h-14 rounded-full ${item.bg} flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border border-gray-100`}>
                          <item.icon size={24} className={item.color} fill={item.fill ? 'currentColor' : 'none'} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                      </button>
                    ))}
                  </div>
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
