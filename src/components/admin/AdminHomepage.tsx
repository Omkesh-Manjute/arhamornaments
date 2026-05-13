import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, X, Loader2, GripVertical, Star, Sparkles, TrendingUp, ChevronDown, Check, Image as ImageIcon } from 'lucide-react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { homepageService, HomepageSectionConfig } from '../../services/homepageService';

type SectionKey = 'newArrivals' | 'bestSellers' | 'trending';
type TabType = SectionKey | 'categories' | 'collections';

interface SectionMeta {
  key: SectionKey;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

const SECTIONS: SectionMeta[] = [
  {
    key: 'newArrivals',
    label: 'New Arrivals',
    icon: <Sparkles size={18} />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
    description: 'Products shown in the "New Arrivals" section on the homepage'
  },
  {
    key: 'bestSellers',
    label: 'Best Sellers',
    icon: <Star size={18} />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500',
    description: 'Products shown in the "Best Sellers" section on the homepage'
  },
  {
    key: 'trending',
    label: 'Trending Now',
    icon: <TrendingUp size={18} />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500',
    description: 'Products shown in the "Trending" section on the homepage'
  }
];

const AdminHomepage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<HomepageSectionConfig>({
    newArrivals: [],
    bestSellers: [],
    trending: [],
    categories: [],
    collections: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('newArrivals');
  const [showPicker, setShowPicker] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load products and config
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [products, savedConfig] = await Promise.all([
          productService.getAllProducts(),
          homepageService.getSectionConfig()
        ]);
        setAllProducts(products);
        setConfig(savedConfig);
      } catch (error) {
        console.error('Failed to load homepage config:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Product lookup map
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    allProducts.forEach(p => map.set(p.id, p));
    return map;
  }, [allProducts]);

  // Auto-detect categories from actual products (category name → first image + count)
  const detectedCategories = useMemo(() => {
    const catMap = new Map<string, { image: string; count: number }>();
    allProducts.forEach(p => {
      if (!p.category) return;
      if (!catMap.has(p.category)) {
        catMap.set(p.category, { image: p.images?.[0] || '', count: 1 });
      } else {
        catMap.get(p.category)!.count++;
      }
    });
    return catMap;
  }, [allProducts]);

  // Get category names that haven't been added yet
  const availableCategories = useMemo(() => {
    const usedNames = new Set((config.categories || []).map(c => c.name.toLowerCase()));
    return Array.from(detectedCategories.entries())
      .filter(([name]) => !usedNames.has(name.toLowerCase()))
      .map(([name, data]) => ({ name, ...data }));
  }, [detectedCategories, config.categories]);

  // Filtered products for the picker
  const filteredProducts = useMemo(() => {
    if (activeTab === 'categories' || activeTab === 'collections') return [];
    const selectedIds = new Set(config[activeTab as SectionKey]);
    return allProducts
      .filter(p => !selectedIds.has(p.id))
      .filter(p => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          (p.name || '').toLowerCase().includes(q) ||
          (p.designNo || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q)
        );
      });
  }, [allProducts, config, activeTab, searchQuery]);

  // Add a product to the active section
  const addProduct = (productId: string) => {
    if (activeTab === 'categories' || activeTab === 'collections') return;
    setConfig(prev => ({
      ...prev,
      [activeTab as SectionKey]: [...prev[activeTab as SectionKey], productId]
    }));
  };

  // Remove a product from a section
  const removeProduct = (section: SectionKey, productId: string) => {
    setConfig(prev => ({
      ...prev,
      [section]: prev[section].filter(id => id !== productId)
    }));
  };

  // Move product up/down in a section
  const moveProduct = (section: SectionKey, index: number, direction: 'up' | 'down') => {
    setConfig(prev => {
      const arr = [...prev[section]];
      const swapIdx = direction === 'up' ? index - 1 : index + 1;
      if (swapIdx < 0 || swapIdx >= arr.length) return prev;
      [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
      return { ...prev, [section]: arr };
    });
  };

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);

  const addCategory = (catName: string) => {
    const detected = detectedCategories.get(catName);
    const displayName = catName.charAt(0).toUpperCase() + catName.slice(1).replace(/-/g, ' ');
    const newCat = {
      name: displayName,
      image: detected?.image || '',
      path: `/products?category=${catName}`
    };
    setConfig(prev => ({
      ...prev,
      categories: [...(prev.categories || []), newCat]
    }));
    setShowCategoryPicker(false);
  };

  const updateCategory = (index: number, updates: any) => {
    setConfig(prev => {
      const newCats = [...(prev.categories || [])];
      newCats[index] = { ...newCats[index], ...updates };
      return { ...prev, categories: newCats };
    });
  };

  const removeCategory = (index: number) => {
    setConfig(prev => ({
      ...prev,
      categories: (prev.categories || []).filter((_, i) => i !== index)
    }));
  };

  // For picking a product image for a category
  const pickImageForCategory = (catIndex: number) => {
    const cat = config.categories?.[catIndex];
    if (!cat) return;
    // Find a product in this category that has images
    const catKey = cat.name.toLowerCase().replace(/ /g, '-');
    const matchingProduct = allProducts.find(p =>
      p.category?.toLowerCase() === catKey && p.images?.[0]
    );
    if (matchingProduct) {
      updateCategory(catIndex, { image: matchingProduct.images[0] });
    }
  };

  const addCollection = (product: Product) => {
    const newColl = {
      id: Date.now().toString(),
      name: product.name || product.designNo || 'Collection Item',
      image: product.images?.[0] || '',
      path: `/products?category=${product.category}`
    };
    setConfig(prev => ({
      ...prev,
      collections: [...(prev.collections || []), newColl]
    }));
    setShowCollectionPicker(false);
  };

  const updateCollection = (index: number, updates: any) => {
    setConfig(prev => {
      const newColls = [...(prev.collections || [])];
      newColls[index] = { ...newColls[index], ...updates };
      return { ...prev, collections: newColls };
    });
  };

  const removeCollection = (index: number) => {
    setConfig(prev => ({
      ...prev,
      collections: (prev.collections || []).filter((_, i) => i !== index)
    }));
  };

  // Save config
  const handleSave = async () => {
    setSaving(true);
    try {
      await homepageService.saveSectionConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save homepage config:', error);
      alert('Failed to save! Check console.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-amber-500" size={40} />
        <p className="text-gray-500 text-xs uppercase tracking-widest mt-4">Loading Homepage Settings...</p>
      </div>
    );
  }

  const isProductTab = activeTab === 'newArrivals' || activeTab === 'bestSellers' || activeTab === 'trending';
  const activeMeta = isProductTab ? SECTIONS.find(s => s.key === activeTab)! : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Homepage Sections</h2>
          <p className="text-gray-500 text-xs mt-1">Choose which products appear in each homepage section</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${
            saveSuccess
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
          }`}
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : saveSuccess ? <Check size={16} /> : null}
          {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Publish Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {SECTIONS.map(section => (
          <button
            key={section.key}
            onClick={() => { setActiveTab(section.key); setShowPicker(false); }}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm shrink-0 ${
              activeTab === section.key
                ? `${section.bgColor} text-white shadow-lg`
                : 'bg-[#161616] border border-[#222222] text-gray-400 hover:text-white hover:border-[#333333]'
            }`}
          >
            {section.icon}
            {section.label}
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
              activeTab === section.key ? 'bg-white/20' : 'bg-white/5'
            }`}>
              {config[section.key]?.length || 0}
            </span>
          </button>
        ))}
        
        <button
          onClick={() => { setActiveTab('categories'); setShowPicker(false); }}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm shrink-0 ${
            activeTab === 'categories'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-[#161616] border border-[#222222] text-gray-400 hover:text-white hover:border-[#333333]'
          }`}
        >
          <GripVertical size={18} />
          Featured Categories
          <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
            activeTab === 'categories' ? 'bg-white/20' : 'bg-white/5'
          }`}>
            {config.categories?.length || 0}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('collections'); setShowPicker(false); }}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm shrink-0 ${
            activeTab === 'collections'
              ? 'bg-rose-500 text-white shadow-lg'
              : 'bg-[#161616] border border-[#222222] text-gray-400 hover:text-white hover:border-[#333333]'
          }`}
        >
          <ImageIcon size={18} />
          Collection Slider
          <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
            activeTab === 'collections' ? 'bg-white/20' : 'bg-white/5'
          }`}>
            {config.collections?.length || 0}
          </span>
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="bg-[#161616] border border-[#222222] rounded-[2rem] p-8">
        {isProductTab && activeMeta ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-black ${activeMeta.color}`}>{activeMeta.label}</h3>
                <p className="text-gray-500 text-xs mt-1">{activeMeta.description}</p>
              </div>
              <button
                onClick={() => setShowPicker(!showPicker)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  showPicker
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : `${activeMeta.bgColor}/10 ${activeMeta.color} border border-current/20`
                }`}
              >
                {showPicker ? <X size={14} /> : <Plus size={14} />}
                {showPicker ? 'Close' : 'Add Products'}
              </button>
            </div>

            {/* Product Picker Modal */}
            {showPicker && (
              <div className="mb-8 bg-[#0D0D0D] border border-[#222222] rounded-2xl p-6">
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search products by name, design number, or category..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#161616] border border-[#222222] rounded-xl text-white text-sm outline-none focus:border-amber-500 transition-colors placeholder:text-gray-600"
                    autoFocus
                  />
                </div>
                <div className="max-h-[320px] overflow-y-auto custom-scrollbar space-y-1">
                  {filteredProducts.length === 0 ? (
                    <p className="text-center text-gray-600 py-8 text-sm">No products found</p>
                  ) : (
                    filteredProducts.map(product => (
                      <button
                        key={product.id}
                        onClick={() => addProduct(product.id)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#222222] shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{product.name || product.designNo || product.id}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{product.category} • {product.designNo || '—'}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={16} className={activeMeta.color} />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Selected Products List */}
            {config[activeTab as SectionKey]?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className={`w-20 h-20 rounded-3xl ${activeMeta.bgColor}/10 flex items-center justify-center mb-4`}>
                  <span className={activeMeta.color}>{activeMeta.icon}</span>
                </div>
                <p className="text-gray-400 font-bold mb-1">No products assigned</p>
                <p className="text-gray-600 text-xs max-w-sm">Click "Add Products" above to choose which products appear in this section on the homepage.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {config[activeTab as SectionKey]?.map((productId, index) => {
                  const product = productMap.get(productId);
                  if (!product) {
                    return (
                      <div key={productId} className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                        <span className="text-red-400 text-xs font-mono">Missing: {productId}</span>
                        <button
                          onClick={() => removeProduct(activeTab as SectionKey, productId)}
                          className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={productId}
                      className="flex items-center gap-4 p-4 bg-[#0D0D0D] border border-[#222222] rounded-xl hover:border-[#333333] transition-colors group"
                    >
                      {/* Position */}
                      <span className="text-[10px] font-mono font-bold text-gray-600 w-6 text-center shrink-0">
                        #{index + 1}
                      </span>

                      {/* Move Buttons */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          onClick={() => moveProduct(activeTab as SectionKey, index, 'up')}
                          disabled={index === 0}
                          className="text-gray-600 hover:text-white disabled:opacity-20 transition-colors p-0.5"
                        >
                          <ChevronDown size={12} className="rotate-180" />
                        </button>
                        <button
                          onClick={() => moveProduct(activeTab as SectionKey, index, 'down')}
                          disabled={index === config[activeTab as SectionKey].length - 1}
                          className="text-gray-600 hover:text-white disabled:opacity-20 transition-colors p-0.5"
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>

                      {/* Image */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#222222] shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{product.name || product.designNo || product.id}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                          {product.category} • {product.material} • {product.designNo || '—'}
                        </p>
                      </div>

                      {/* Stock badge */}
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                        product.inStock ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out'}
                      </span>

                      {/* Remove */}
                      <button
                        onClick={() => removeProduct(activeTab as SectionKey, productId)}
                        className="p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : activeTab === 'categories' ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-blue-400">Featured Categories</h3>
                <p className="text-gray-500 text-xs mt-1">Categories auto-detect from your products with real images</p>
              </div>
              <button
                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${showCategoryPicker ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'}`}
              >
                {showCategoryPicker ? <X size={14} /> : <Plus size={14} />}
                {showCategoryPicker ? 'Close' : 'Add Category'}
              </button>
            </div>

            {showCategoryPicker && (
              <div className="mb-6 bg-[#0D0D0D] border border-[#222222] rounded-2xl p-6">
                <p className="text-gray-400 text-xs mb-4">Pick a category — images auto-fill from your inventory:</p>
                {availableCategories.length === 0 ? (
                  <p className="text-center text-gray-600 py-6 text-sm">All categories added ✓</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableCategories.map(cat => (
                      <button key={cat.name} onClick={() => addCategory(cat.name)} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-[#161616] border border-[#222222] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#222222]">
                          {cat.image ? <img src={cat.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={20} /></div>}
                        </div>
                        <p className="text-sm font-bold text-white capitalize">{cat.name.replace(/-/g, ' ')}</p>
                        <p className="text-[10px] text-gray-500">{cat.count} products</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(config.categories || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-4"><GripVertical className="text-blue-400" size={24} /></div>
                <p className="text-gray-400 font-bold mb-1">No categories added</p>
                <p className="text-gray-600 text-xs max-w-sm">Click "Add Category" to pick from your product categories.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(config.categories || []).map((cat, index) => (
                  <div key={index} className="bg-[#0D0D0D] border border-[#222222] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Category #{index + 1}</span>
                      <button onClick={() => removeCategory(index)} className="text-gray-600 hover:text-red-400 transition-colors"><X size={16} /></button>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#161616] shrink-0 border border-white/5 relative group/img">
                        {cat.image ? <img src={cat.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={18} /></div>}
                        <button onClick={() => pickImageForCategory(index)} className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center" title="Auto-fill from products">
                          <span className="text-[9px] text-white font-bold uppercase">Auto Pick</span>
                        </button>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Title</label>
                          <input type="text" value={cat.name} onChange={e => updateCategory(index, { name: e.target.value })} className="w-full bg-[#161616] border border-[#222222] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Link Path</label>
                          <input type="text" value={cat.path} onChange={e => updateCategory(index, { path: e.target.value })} className="w-full bg-[#161616] border border-[#222222] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Image URL <span className="text-gray-600">(auto-filled or paste custom)</span></label>
                      <input type="text" value={cat.image} onChange={e => updateCategory(index, { image: e.target.value })} className="w-full bg-[#161616] border border-[#222222] rounded-lg px-3 py-2 text-xs text-gray-400 outline-none focus:border-blue-500 font-mono" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-rose-400">Collection Slider</h3>
                <p className="text-gray-500 text-xs mt-1">Pick products from your inventory for the collection slider</p>
              </div>
              <button
                onClick={() => setShowCollectionPicker(!showCollectionPicker)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${showCollectionPicker ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'}`}
              >
                {showCollectionPicker ? <X size={14} /> : <Plus size={14} />}
                {showCollectionPicker ? 'Close' : 'Add Item'}
              </button>
            </div>

            {showCollectionPicker && (
              <div className="mb-6 bg-[#0D0D0D] border border-[#222222] rounded-2xl p-6">
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-[#161616] border border-[#222222] rounded-xl text-white text-sm outline-none focus:border-rose-500 transition-colors placeholder:text-gray-600" autoFocus />
                </div>
                <div className="max-h-[320px] overflow-y-auto custom-scrollbar space-y-1">
                  {allProducts.filter(p => { if (!searchQuery.trim()) return true; const q = searchQuery.toLowerCase(); return (p.name||'').toLowerCase().includes(q)||(p.designNo||'').toLowerCase().includes(q)||(p.category||'').toLowerCase().includes(q); }).slice(0,50).map(product => (
                    <button key={product.id} onClick={() => addCollection(product)} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group text-left">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#222222] shrink-0">
                        {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={16} /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{product.name || product.designNo || product.id}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{product.category} • {product.designNo || '—'}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={16} className="text-rose-400" /></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(config.collections || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-4"><ImageIcon className="text-rose-400" size={24} /></div>
                <p className="text-gray-400 font-bold mb-1">No collection items</p>
                <p className="text-gray-600 text-xs max-w-sm">Click "Add Item" to pick products for the slider.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(config.collections || []).map((item, index) => (
                  <div key={item.id} className="bg-[#0D0D0D] border border-[#222222] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Item #{index + 1}</span>
                      <button onClick={() => removeCollection(index)} className="text-gray-600 hover:text-red-400 transition-colors"><X size={16} /></button>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#161616] shrink-0 border border-white/5">
                        {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={18} /></div>}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Title</label>
                          <input type="text" value={item.name} onChange={e => updateCollection(index, { name: e.target.value })} className="w-full bg-[#161616] border border-[#222222] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-rose-500" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Link Path</label>
                          <input type="text" value={item.path} onChange={e => updateCollection(index, { path: e.target.value })} className="w-full bg-[#161616] border border-[#222222] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-rose-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {SECTIONS.map(section => (
          <div key={section.key} className="bg-[#161616] border border-[#222222] rounded-2xl p-6 text-center">
            <div className={`w-10 h-10 rounded-xl ${section.bgColor}/10 flex items-center justify-center mx-auto mb-3`}>
              <span className={section.color}>{section.icon}</span>
            </div>
            <p className="text-2xl font-black text-white">{config[section.key].length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{section.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHomepage;
