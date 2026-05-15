import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useLocation, useParams } from 'react-router-dom';
import { Filter, X, ChevronDown, Grid, List, SlidersHorizontal, ChevronLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, categories, materials, occasions } from '../data/products';
import { Product } from '../types';
import { productService } from '../services/productService';
import { Loader2, ChevronRight } from 'lucide-react';


const ProductListing: React.FC = () => {
  const { category: pathCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { pathname, search } = useLocation();

  // Open filters if showFilters is in URL
  useEffect(() => {
    if (searchParams.get('showFilters') === 'true') {
      setShowFilters(true);
      // Clean up the URL parameter
      const params = new URLSearchParams(searchParams);
      params.delete('showFilters');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams]);

  // Scroll to top on navigation or filter change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  // Get filter values from URL
  const selectedCategory = pathCategory || searchParams.get('category') || '';
  const selectedMaterial = searchParams.get('material') || '';
  const selectedOccasion = searchParams.get('occasion') || '';
  const searchQuery = searchParams.get('search') || '';
  const priceRange = searchParams.get('price') || '';
  const selectedGender = searchParams.get('gender') || '';

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(24);
  const PAGE_SIZE = 24;

  // Fetch ALL products from Firestore once
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const fetched = await productService.getAllProducts();
        setAllProducts(fetched.length > 0 ? fetched : products);
      } catch (error) {
        console.error("Failed to load products:", error);
        setAllProducts(products);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [selectedCategory, selectedMaterial, selectedOccasion, searchQuery, priceRange, sortBy]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (selectedMaterial) {
      result = result.filter(p => p.material === selectedMaterial);
    }
    if (selectedOccasion) {
      result = result.filter(p => p.occasion === selectedOccasion);
    }
    if (selectedGender) {
      result = result.filter(p => (p.gender || 'unisex') === selectedGender);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      result = result.filter(p => {
        if (max) return p.price >= min && p.price <= max;
        return p.price >= min;
      });
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [allProducts, selectedCategory, selectedMaterial, selectedOccasion, searchQuery, priceRange, sortBy]);


  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory || selectedMaterial || selectedOccasion || priceRange || selectedGender;

  const priceRanges = [
    { value: '0-10000', label: 'Under ₹10,000' },
    { value: '10000-25000', label: '₹10,000 - ₹25,000' },
    { value: '25000-50000', label: '₹25,000 - ₹50,000' },
    { value: '50000-100000', label: '₹50,000 - ₹1,00,000' },
    { value: '100000-', label: 'Above ₹1,00,000' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Top Bar */}
      <div className="bg-[#1a1a1a] text-white py-6 px-4 flex items-center justify-between lg:hidden sticky top-0 z-40">
        <Link to="/" className="p-2 hover:text-gold transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-sm font-heading font-black uppercase tracking-[0.4em] flex-1 text-center pr-8">
          {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All Products'}
        </h1>
      </div>

      {/* Sort & Filter Bar (Mobile) */}
      <div className="grid grid-cols-2 border-b border-gray-100 bg-white lg:hidden sticky top-[72px] z-30">
        <div className="relative border-r border-gray-100">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full h-14 bg-transparent appearance-none flex items-center justify-center text-center text-[10px] font-black uppercase tracking-[0.2em] text-charcoal outline-none cursor-pointer"
          >
            <option value="featured">Sort</option>
            <option value="price-low">Price: Low</option>
            <option value="price-high">Price: High</option>
            <option value="rating">Rating</option>
          </select>
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
            <SlidersHorizontal size={14} className="rotate-90 text-gray-400" />
          </div>
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="h-14 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-charcoal hover:bg-gray-50 transition-colors"
        >
          <Filter size={14} className="text-gray-400" />
          Filter
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">
            <Link to="/" className="hover:text-gold">Home</Link>
            <span>/</span>
            <span className="text-gold">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All Products'}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <h1 className="text-5xl font-heading font-bold text-charcoal">
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : selectedCategory
                    ? categories.find(c => c.id === selectedCategory)?.name
                    : 'All Collections'
                }
              </h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{filteredProducts.length} curated pieces</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal size={18} />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm text-amber-600 hover:text-amber-700">
                    Clear All
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.id}
                        onChange={() => updateFilter('category', selectedCategory === cat.id ? '' : cat.id)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-600">{cat.icon} {cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Material</h4>
                <div className="space-y-2">
                  {materials.map((mat) => (
                    <label key={mat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="material"
                        checked={selectedMaterial === mat.id}
                        onChange={() => updateFilter('material', selectedMaterial === mat.id ? '' : mat.id)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                      <span
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: mat.color }}
                      />
                      <span className="text-sm text-gray-600">{mat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Occasion */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Occasion</h4>
                <div className="space-y-2">
                  {occasions.map((occ) => (
                    <label key={occ.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="occasion"
                        checked={selectedOccasion === occ.id}
                        onChange={() => updateFilter('occasion', selectedOccasion === occ.id ? '' : occ.id)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-600">{occ.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Collection</h4>
                <div className="space-y-2">
                  {[
                    { id: 'men', name: "Men's Collection" },
                    { id: 'women', name: "Women's Collection" },
                    { id: 'unisex', name: "Unisex Collection" }
                  ].map((g) => (
                    <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={selectedGender === g.id}
                        onChange={() => updateFilter('gender', selectedGender === g.id ? '' : g.id)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-600">{g.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={priceRange === range.value}
                        onChange={() => updateFilter('price', priceRange === range.value ? '' : range.value)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-600">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <Filter size={18} />
                  Filters
                </button>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-amber-500 text-sm"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest First</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => updateFilter('category', '')}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {selectedMaterial && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                    {materials.find(m => m.id === selectedMaterial)?.name}
                    <button onClick={() => updateFilter('material', '')}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {selectedOccasion && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                    {occasions.find(o => o.id === selectedOccasion)?.name}
                    <button onClick={() => updateFilter('occasion', '')}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {selectedGender && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm capitalize">
                    {selectedGender} Collection
                    <button onClick={() => updateFilter('gender', '')}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {priceRange && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                    {priceRanges.find(r => r.value === priceRange)?.label}
                    <button onClick={() => updateFilter('price', '')}>
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="animate-spin text-amber-500" size={48} />
                <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">Curating Collection...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6'
                  : 'flex flex-col gap-4'
                }>
                  {filteredProducts.slice(0, displayCount).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More / Pagination */}
                <div className="flex flex-col items-center py-10 space-y-3">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Showing {Math.min(displayCount, filteredProducts.length)} of {filteredProducts.length} products
                  </p>
                  {displayCount < filteredProducts.length ? (
                    <button
                      onClick={() => setDisplayCount(prev => prev + PAGE_SIZE)}
                      className="px-8 py-3 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      Load More <ChevronRight size={18} />
                    </button>
                  ) : (
                    <p className="text-xs text-gray-300 italic">You've seen all products ✨</p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition"
                >
                  Clear All Filters
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X size={24} />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category-mobile"
                        checked={selectedCategory === cat.id}
                        onChange={() => updateFilter('category', selectedCategory === cat.id ? '' : cat.id)}
                        className="w-4 h-4 text-amber-600"
                      />
                      <span className="text-sm text-gray-600">{cat.icon} {cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Material</h4>
                <div className="space-y-2">
                  {materials.map((mat) => (
                    <label key={mat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="material-mobile"
                        checked={selectedMaterial === mat.id}
                        onChange={() => updateFilter('material', selectedMaterial === mat.id ? '' : mat.id)}
                        className="w-4 h-4 text-amber-600"
                      />
                      <span className="text-sm text-gray-600">{mat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Occasion */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Occasion</h4>
                <div className="space-y-2">
                  {occasions.map((occ) => (
                    <label key={occ.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="occasion-mobile"
                        checked={selectedOccasion === occ.id}
                        onChange={() => updateFilter('occasion', selectedOccasion === occ.id ? '' : occ.id)}
                        className="w-4 h-4 text-amber-600"
                      />
                      <span className="text-sm text-gray-600">{occ.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Collection</h4>
                <div className="space-y-2">
                  {[
                    { id: 'men', name: "Men's Collection" },
                    { id: 'women', name: "Women's Collection" },
                    { id: 'unisex', name: "Unisex Collection" }
                  ].map((g) => (
                    <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender-mobile"
                        checked={selectedGender === g.id}
                        onChange={() => updateFilter('gender', selectedGender === g.id ? '' : g.id)}
                        className="w-4 h-4 text-amber-600"
                      />
                      <span className="text-sm text-gray-600">{g.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="price-mobile"
                        checked={priceRange === range.value}
                        onChange={() => updateFilter('price', priceRange === range.value ? '' : range.value)}
                        className="w-4 h-4 text-amber-600"
                      />
                      <span className="text-sm text-gray-600">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-3 border border-gray-300 rounded-full font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3 bg-amber-500 text-white rounded-full font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListing;
