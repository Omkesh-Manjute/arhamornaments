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


  // Navigation between products logic
  const navigateToSibling = (dir: 'next' | 'prev') => {
    setDirection(dir === 'next' ? 1 : -1);
    if (siblingProducts.length <= 1) return;
    const currentIndex = siblingProducts.findIndex(p => p.id === product?.id);

    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
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
        // If swiping on images, try to cycle images first
        if (distance > 0 && currentImage < imagesCount - 1) {
          setCurrentImage(prev => prev + 1);
          return;
        } else if (distance < 0 && currentImage > 0) {
          setCurrentImage(prev => prev - 1);
          return;
        }
      }
      
      // If at boundaries or on details area, change product
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
    <div className="min-h-screen bg-[#FCFBF7] overflow-x-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div 
          key={product.id}
          custom={direction}
          variants={{
            enter: (direction: number) => ({
              x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
              opacity: 0,
              scale: 0.95
            }),
            center: {
              x: 0,
              opacity: 1,
              scale: 1
            },
            exit: (direction: number) => ({
              x: direction > 0 ? '-100%' : direction < 0 ? '100%' : 0,
              opacity: 0,
              scale: 0.95
            })
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.3 }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => handleTouchEnd(false)}
        >


      {/* MOBILE LAYOUT */}
      <div className="lg:hidden">
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
        <div className="px-5 pt-8 pb-32 space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase text-gold">{product.material} Collection</span>
            <h1 className="text-3xl font-heading font-bold text-charcoal">{product.name}</h1>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 text-center">
            <span className="text-4xl font-black text-charcoal">{formatPrice(currentPrice * quantity)}</span>
          </div>

          {/* Details Table */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 space-y-4">
            <h4 className="text-xs font-black uppercase text-gold">Product Details</h4>
            {[
              ['Design No.', product.designNo || 'N/A'],
              ['Gross Weight', `${product.grossWeight?.toFixed(3) || '0.000'} g`],
              ['Net Weight', `${product.netWeight?.toFixed(3) || '0.000'} g`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-400">{label}</span>
                <span className="text-charcoal font-black">{value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 z-50">
            <button onClick={handleWhatsAppEnquiry} className="flex-1 py-4 bg-white border-2 border-charcoal text-charcoal rounded-2xl font-black">Get Quote</button>
            <button onClick={handleAddToCart} className="flex-1 py-4 bg-charcoal text-white rounded-2xl font-black">Add to Cart</button>
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT (SIMPLIFIED FOR STABILITY) */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 gap-16">
          <div className="aspect-square rounded-[3rem] overflow-hidden bg-white shadow-2xl">
            <img src={product.images?.[currentImage] || ''} alt="" className="w-full h-full object-contain p-8" />
          </div>
          <div className="space-y-10">
            <h1 className="text-5xl font-heading font-bold text-charcoal">{product.name}</h1>
            <p className="text-4xl font-black text-gold">{formatPrice(currentPrice * quantity)}</p>
            <div className="flex gap-4">
              <button onClick={handleWhatsAppEnquiry} className="flex-1 py-5 bg-white border border-gray-200 text-charcoal rounded-xl font-black">Get Quote</button>
              <button onClick={handleAddToCart} className="flex-1 py-5 bg-charcoal text-white rounded-xl font-black">Add to Cart</button>
            </div>
          </div>
        </div>

        {/* Related sections */}
        {completeTheLook.length > 0 && (
          <div className="mt-32 space-y-12">
            <div className="text-center space-y-2"><h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Collection</h4><h2 className="text-4xl font-heading font-bold text-charcoal">Related Products</h2><div className="w-12 h-1 bg-gold mx-auto mt-4" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">{relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        )}
        {recentlyViewed.length > 0 && (
          <div className="mt-32 space-y-12">
            <div className="text-center space-y-2"><h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">History</h4><h2 className="text-4xl font-heading font-bold text-charcoal">Recently Viewed</h2><div className="w-12 h-1 bg-gold mx-auto mt-4" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">{recentlyViewed.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        )}
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
  );
};


export default ProductDetail;
