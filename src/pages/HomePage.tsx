import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Gem, ChevronRight } from 'lucide-react';
import HeritageHero from '../components/home/HeritageHero';
import { products } from '../data/products';
import MobileSearchBar from '../components/layout/MobileSearchBar';
import CategorySlider from '../components/home/CategorySlider';
import MobileHeroSlider from '../components/home/MobileHeroSlider';
import CollectionSlider from '../components/home/CollectionSlider';
import BestSellerSection from '../components/home/BestSellerSection';
import ProductCard from '../components/product/ProductCard';
import OccasionSection from '../components/home/OccasionSection';
import LivePriceTicker from '../components/layout/LivePriceTicker';
import HeroSlider from '../components/home/HeroSlider';
import ShopByGender from '../components/home/ShopByGender';
import NewArrivalsBanners from '../components/home/NewArrivalsBanners';

import { Product } from '../types';
import { productService } from '../services/productService';
import { homepageService, HomeCategory, HomeCollectionItem } from '../services/homepageService';
import { Loader2 } from 'lucide-react';

const HomePage: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [earringCollection, setEarringCollection] = useState<HomeCollectionItem[]>([]);
  const [bestSellerBanner, setBestSellerBanner] = useState<string>('');
  const [promoSections, setPromoSections] = useState<any[]>([]);
  const [spotlight, setSpotlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const loadHomeData = async () => {
      try {
        // 1. Load admin-configured sections
        const config = await homepageService.getSectionConfig();
        // 2. Load all products once
        const allProducts = await productService.getAllProducts();
        const productMap = new Map<string, Product>();
        allProducts.forEach(p => productMap.set(p.id, p));

        // 3. Resolve configured product IDs → actual products
        const resolveProducts = (ids: string[]): Product[] =>
          ids.map(id => productMap.get(id)).filter(Boolean) as Product[];

        const configuredNewArrivals = resolveProducts(config.newArrivals);
        const configuredBestSellers = resolveProducts(config.bestSellers);
        const configuredTrending = resolveProducts(config.trending);

        // 4. Use configured products, fallback to automatic selection if admin hasn't set anything
        setNewArrivals(
          configuredNewArrivals.length > 0
            ? configuredNewArrivals
            : allProducts.slice(0, 8) // Show first 8 products as fallback
        );
        setBestSellers(
          configuredBestSellers.length > 0
            ? configuredBestSellers
            : allProducts.filter(p => p.featured).slice(0, 8)
        );
        setTrendingProducts(
          configuredTrending.length > 0
            ? configuredTrending
            : allProducts.filter(p => p.trending).slice(0, 8)
        );

        // 5. Handle Categories and Collections
        // Auto-generate categories from actual products when no admin config exists
        if (config.categories?.length > 0) {
          setCategories(config.categories);
        } else {
          // Build categories dynamically from product data
          const catMap = new Map<string, string>();
          allProducts.forEach(p => {
            if (p.category && !catMap.has(p.category) && p.images?.[0]) {
              catMap.set(p.category, p.images[0]);
            }
          });
          const autoCategories = Array.from(catMap.entries()).map(([name, image]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
            image,
            path: `/products?category=${name}`
          }));
          setCategories(autoCategories);
        }

        if (config.collections?.length > 0) {
          setEarringCollection(config.collections);
        } else {
          // Build collection from first few products that have images
          const autoCollection = allProducts
            .filter(p => p.images?.[0])
            .slice(0, 4)
            .map((p, i) => ({
              id: String(i + 1),
              name: p.name || p.designNo || p.category || 'Item',
              image: p.images[0],
              path: `/products?category=${p.category}`
            }));
          setEarringCollection(autoCollection);
        }

        setBestSellerBanner(config.bestSellerBanner || '');
        setPromoSections(config.promoSections || []);
        setSpotlight(config.spotlight || null);

      } catch (error) {
        console.error("Failed to load home page products:", error);
        // Ultimate fallback: use static data
        setNewArrivals(products.slice(0, 4));
        setBestSellers(products.filter(p => p.featured).slice(0, 4));
        setEarringCollection([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);


  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* Search and Categories (Mobile) */}
      <div className="lg:hidden bg-white border-b border-gray-50">
        <MobileSearchBar />
        <CategorySlider />
      </div>

      {/* Hero Section */}
      <HeroSlider />

      {/* Live Market Price Section */}
      <LivePriceTicker />

      {/* New Arrivals Banners Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-gold" size={40} />
          <p className="text-gray-400 text-xs uppercase tracking-widest mt-4">Loading Products...</p>
        </div>
      ) : (
        <NewArrivalsBanners />
      )}

      <OccasionSection />

      {/* Collection Slider - Uses admin-configured items */}
      <CollectionSlider
        title="Stunning Every Ear"
        subtitle="Look at our brand new earring collection just for you"
        banners={earringCollection.slice(0, 3).map((item, i) => ({
          image: item.image,
          title: i === 0 ? "Stunning <br /> every Ear" : i === 1 ? "Handcrafted <br /> Elegance" : "Timeless <br /> Masterpieces",
          link: item.path || '/products'
        }))}
        items={earringCollection}
      />

      {/* Categories Grid - Enhanced */}
      <section className="px-4 md:px-8 py-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold block mb-2">The Collection</span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-charcoal">Curated Categories</h2>
            <div className="w-20 h-0.5 bg-gold/30 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={cat.path}
                className={`group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700 border border-gold/5 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="aspect-[4/5] overflow-hidden bg-white relative">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-4 md:p-6 flex items-center justify-between bg-white border-t border-gray-50">
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-ruby group-hover:text-ruby/80 transition-colors">
                    {cat.name}
                  </h3>
                  <div className="text-[10px] font-bold text-gold uppercase tracking-widest hidden md:block">
                    Explore
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      {!loading && bestSellers.length > 0 && (
        <BestSellerSection
          title="Gold Best Sellers"
          subtitle="Our most loved handcrafted gold masterpieces"
          bannerImage={bestSellerBanner || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200"}
          bannerLink="/products?category=necklaces"
          products={bestSellers}
        />
      )}

      {/* Shop by Gender Section */}
      <ShopByGender />

      {/* Trending Section */}
      {!loading && trendingProducts.length > 0 && (
        <section className="px-4 md:px-8 pt-8 pb-16 bg-gradient-to-b from-white to-offwhite">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <span className="text-purple-500 uppercase tracking-[0.4em] text-[10px] font-bold block">What's Hot</span>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-charcoal">Trending Now</h2>
              <p className="text-gray-500 text-sm md:text-base font-medium">The pieces everyone is talking about</p>
              <div className="flex justify-center py-2">
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {trendingProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} hidePrice={true} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stunning Split Promo Section */}
      {promoSections.length > 0 && (
        <section className="px-4 md:px-8 py-8 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {promoSections.map((promo, idx) => (
              <div key={idx} className={`relative h-[200px] md:h-[500px] rounded-3xl md:rounded-[3rem] overflow-hidden group shadow-lg`}>
                <img src={promo.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={promo.title} />
                <div className={`absolute inset-0 bg-gradient-to-t ${
                  promo.type === 'middle' ? 'from-emerald-950/80' : promo.type === 'right' ? 'from-rose-950/80' : 'from-black/80'
                } via-transparent to-transparent flex flex-col justify-end p-6 md:p-10 space-y-2 md:space-y-4 ${
                  promo.type === 'middle' ? 'items-center text-center' : promo.type === 'right' ? 'items-end text-right' : ''
                }`}>
                  <span className="text-gold uppercase tracking-[0.4em] text-[7px] md:text-[10px] font-bold">{promo.subtitle}</span>
                  <h2 className="text-lg md:text-4xl font-heading text-white font-bold leading-tight">
                    {promo.title.includes('<br />') ? 
                      promo.title.split('<br />').map((t: string, i: number) => <React.Fragment key={i}>{t}{i < promo.title.split('<br />').length - 1 && <br />}</React.Fragment>)
                      : promo.title
                    }
                  </h2>
                  <Link to={promo.link} className="group/btn flex items-center gap-2 text-white/90 text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] hover:text-gold transition-colors w-fit">
                    Explore <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}


      {/* Featured Spotlight (Floating Elements) */}
      {spotlight && (
        <section className="hidden md:block px-4 md:px-8 py-24 bg-charcoal relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="grid grid-cols-12 h-full">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="border-r border-gold h-full" />
              ))}
            </div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-square rounded-[4rem] overflow-hidden border-2 border-gold/30 p-4 animate-float">
                <img src={spotlight.image} className="w-full h-full object-cover rounded-[3rem]" alt="Spotlight" />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl glass hidden md:block">
                <p className="text-gold font-heading text-3xl font-bold mb-1">{spotlight.title}</p>
                <p className="text-white/60 text-xs uppercase tracking-widest">{spotlight.subtitle}</p>
              </div>
            </div>
            <div className="space-y-8">
              <span className="text-gold uppercase tracking-[0.5em] text-xs font-bold block">The Spotlight</span>
              <h2 className="text-3xl md:text-7xl font-heading font-bold text-white leading-tight">
                Crafting <br /> <span className="text-gradient-gold italic font-normal">Excellence.</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed max-w-lg">
                Each piece of Arham Ornaments jewellery is a testament to our dedication to perfection. Our master artisans spend hundreds of hours crafting every detail to ensure it meets our heritage standards.
              </p>
              <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/10">
                <div>
                  <p className="text-3xl font-heading font-bold text-gold">22K</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1">Solid Gold Pureness</p>
                </div>
                <div>
                  <p className="text-3xl font-heading font-bold text-gold">BIS</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1">Hallmarked Quality</p>
                </div>
              </div>
              <Link to={spotlight.link} className="btn-premium bg-gold hover:bg-gold-dark inline-block">
                Learn About Our Craft
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges - Luxury Style */}
      <section className="hidden md:block px-4 md:px-8 py-20 bg-offwhite">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center text-gold shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-500 mb-4 md:mb-6">
              <ShieldCheck size={32} md:size={36} strokeWidth={1.5} />
            </div>
            <h4 className="text-xl md:text-2xl font-heading font-bold text-charcoal">Secure & Certified</h4>
            <p className="text-gray-500 text-[10px] md:text-sm mt-2 md:mt-3 max-w-xs leading-relaxed">Every diamond and gold piece comes with international certifications.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center text-gold shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-500 mb-4 md:mb-6">
              <Truck size={32} md:size={36} strokeWidth={1.5} />
            </div>
            <h4 className="text-xl md:text-2xl font-heading font-bold text-charcoal">Priority Concierge</h4>
            <p className="text-gray-500 text-[10px] md:text-sm mt-2 md:mt-3 max-w-xs leading-relaxed">Insured worldwide shipping with real-time tracking for every shipment.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center text-gold shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-500 mb-4 md:mb-6">
              <Gem size={32} md:size={36} strokeWidth={1.5} />
            </div>
            <h4 className="text-xl md:text-2xl font-heading font-bold text-charcoal">Artisanal Heritage</h4>
            <p className="text-gray-500 text-[10px] md:text-sm mt-2 md:mt-3 max-w-xs leading-relaxed">Blending traditional techniques with contemporary luxury design.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
