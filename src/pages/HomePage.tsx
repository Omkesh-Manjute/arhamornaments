import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Star, ShieldCheck, Truck, Gem } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import HeritageHero from '../components/HeritageHero';
import { products } from '../data/products';
import MobileSearchBar from '../components/MobileSearchBar';
import CategorySlider from '../components/CategorySlider';
import MobileHeroSlider from '../components/MobileHeroSlider';
import CollectionSlider from '../components/CollectionSlider';

const HomePage: React.FC = () => {
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const earringCollection = [
    { id: '1', name: 'Jhumkas', image: '/images/products/earrings.png', path: '/products?category=earrings&type=jhumka' },
    { id: '2', name: 'Drops', image: '/images/products/drops_earrings.png', path: '/products?category=earrings&type=drop' },
    { id: '3', name: 'Studs', image: '/images/products/antique_floral.png', path: '/products?category=earrings&type=stud' },
  ];

  const categories = [
    { name: 'Cluster Rings', image: '/images/products/cluster_rings.png', path: '/products?category=rings' },
    { name: 'Bangles', image: '/images/products/temple_gold_kangan.png', path: '/products?category=bangles' },
    { name: 'Engagement Rings', image: '/images/products/engagement_ring.png', path: '/products?category=rings' },
    { name: 'Necklaces', image: '/images/products/necklaces_category.png', path: '/products?category=necklaces' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Mobile-Only Top Section - Fixed Gap */}
      <div className="lg:hidden pt-[88px] bg-white">
        <MobileSearchBar />
        <CategorySlider />
        <MobileHeroSlider />
      </div>

      {/* Heritage Hero Section - Desktop Only */}
      <div className="hidden lg:block">
        <HeritageHero />
      </div>

      {/* Collection Slider - New */}
      <CollectionSlider 
        title="Stunning Every Ear"
        subtitle="Look at our brand new earring collection just for you"
        bannerImage="https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=1200"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {categories.map((cat, i) => (
              <Link 
                key={i} 
                to={cat.path} 
                className={`group text-center luxury-card transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] mb-6 bg-offwhite border border-gray-100 relative">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-charcoal group-hover:text-gold transition-colors">{cat.name}</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Explore Now</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stunning Split Promo Section */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Promo */}
          <div className="relative h-[550px] rounded-[3.5rem] overflow-hidden group shadow-2xl">
            <img src="/images/promo_collection.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Collection" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-12 space-y-6">
              <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">New Arrivals</span>
              <h2 className="text-4xl md:text-5xl font-heading text-white font-bold leading-tight">
                Essence of <br /> <span className="text-gradient-gold">Pure Artistry</span>
              </h2>
              <p className="text-gray-300 max-w-sm text-sm leading-relaxed">Discover handcrafted masterpieces that define modern elegance and traditional heritage.</p>
              <Link to="/products" className="btn-premium w-fit">
                Explore Collection
              </Link>
            </div>
          </div>
          {/* Right Promo */}
          <div className="relative h-[550px] rounded-[3.5rem] overflow-hidden group shadow-2xl">
            <img src="/images/promo_wedding.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Elegance" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-black/20 to-transparent flex flex-col justify-end p-12 space-y-6 items-end text-right">
              <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Wedding Special</span>
              <h2 className="text-4xl md:text-5xl font-heading text-white font-bold leading-tight">
                Timeless <br /> <span className="text-gradient-gold">Bridal Splendor</span>
              </h2>
              <p className="text-gray-300 max-w-sm text-sm leading-relaxed">Revel in love's splendor with our exclusive wedding collection designed for your most special day.</p>
              <Link to="/products" className="btn-premium w-fit">
                View Wedding Sets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="px-4 md:px-8 py-24 bg-offwhite">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="space-y-4">
              <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold block">Top Picks</span>
              <h2 className="text-4xl md:text-6xl font-heading font-bold text-charcoal">Best Sellers</h2>
            </div>
            <Link to="/products" className="text-charcoal hover:text-gold flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition border-b border-charcoal/10 pb-2">
              View All Masterpieces <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {featuredProducts.map((product, i) => (
              <div key={product.id} className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Spotlight (Floating Elements) */}
      <section className="px-4 md:px-8 py-24 bg-charcoal relative overflow-hidden">
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
               <img src="/images/products/lion_head.png" className="w-full h-full object-cover rounded-[3rem]" alt="Spotlight" />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl glass hidden md:block">
               <p className="text-gold font-heading text-3xl font-bold mb-1">Masterpiece</p>
               <p className="text-white/60 text-xs uppercase tracking-widest">Limited Edition 2024</p>
            </div>
          </div>
          <div className="space-y-8">
            <span className="text-gold uppercase tracking-[0.5em] text-xs font-bold block">The Spotlight</span>
            <h2 className="text-5xl md:text-7xl font-heading font-bold text-white leading-tight">
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
            <Link to="/about" className="btn-premium bg-gold hover:bg-gold-dark inline-block">
              Learn About Our Craft
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges - Luxury Style */}
      <section className="px-4 md:px-8 py-20 bg-offwhite">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gold shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-500 mb-6">
              <ShieldCheck size={36} strokeWidth={1.5} />
            </div>
            <h4 className="text-2xl font-heading font-bold text-charcoal">Secure & Certified</h4>
            <p className="text-gray-500 text-sm mt-3 max-w-xs leading-relaxed">Every diamond and gold piece comes with international certifications of authenticity.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gold shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-500 mb-6">
              <Truck size={36} strokeWidth={1.5} />
            </div>
            <h4 className="text-2xl font-heading font-bold text-charcoal">Priority Concierge</h4>
            <p className="text-gray-500 text-sm mt-3 max-w-xs leading-relaxed">Insured worldwide shipping with real-time tracking for every precious shipment.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gold shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-500 mb-6">
              <Gem size={36} strokeWidth={1.5} />
            </div>
            <h4 className="text-2xl font-heading font-bold text-charcoal">Artisanal Heritage</h4>
            <p className="text-gray-500 text-sm mt-3 max-w-xs leading-relaxed">Blending traditional hand-filigree techniques with contemporary luxury design.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
