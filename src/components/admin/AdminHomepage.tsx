import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, X, Loader2, GripVertical, Star, Sparkles, TrendingUp, ChevronDown, Check, Image as ImageIcon } from 'lucide-react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { homepageService, HomepageSectionConfig } from '../../services/homepageService';

type SectionKey = 'newArrivals' | 'bestSellers' | 'trending';

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
    trending: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<SectionKey>('newArrivals');
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

  // Filtered products for the picker
  const filteredProducts = useMemo(() => {
    const selectedIds = new Set(config[activeSection]);
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
  }, [allProducts, config, activeSection, searchQuery]);

  // Add a product to the active section
  const addProduct = (productId: string) => {
    setConfig(prev => ({
      ...prev,
      [activeSection]: [...prev[activeSection], productId]
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

  const activeMeta = SECTIONS.find(s => s.key === activeSection)!;

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

      {/* Section Tabs */}
      <div className="flex gap-3">
        {SECTIONS.map(section => (
          <button
            key={section.key}
            onClick={() => { setActiveSection(section.key); setShowPicker(false); }}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
              activeSection === section.key
                ? `${section.bgColor} text-white shadow-lg`
                : 'bg-[#161616] border border-[#222222] text-gray-400 hover:text-white hover:border-[#333333]'
            }`}
          >
            {section.icon}
            {section.label}
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
              activeSection === section.key ? 'bg-white/20' : 'bg-white/5'
            }`}>
              {config[section.key].length}
            </span>
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      <div className="bg-[#161616] border border-[#222222] rounded-[2rem] p-8">
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
        {config[activeSection].length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className={`w-20 h-20 rounded-3xl ${activeMeta.bgColor}/10 flex items-center justify-center mb-4`}>
              <span className={activeMeta.color}>{activeMeta.icon}</span>
            </div>
            <p className="text-gray-400 font-bold mb-1">No products assigned</p>
            <p className="text-gray-600 text-xs max-w-sm">Click "Add Products" above to choose which products appear in this section on the homepage.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {config[activeSection].map((productId, index) => {
              const product = productMap.get(productId);
              if (!product) {
                return (
                  <div key={productId} className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <span className="text-red-400 text-xs font-mono">Missing: {productId}</span>
                    <button
                      onClick={() => removeProduct(activeSection, productId)}
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
                      onClick={() => moveProduct(activeSection, index, 'up')}
                      disabled={index === 0}
                      className="text-gray-600 hover:text-white disabled:opacity-20 transition-colors p-0.5"
                    >
                      <ChevronDown size={12} className="rotate-180" />
                    </button>
                    <button
                      onClick={() => moveProduct(activeSection, index, 'down')}
                      disabled={index === config[activeSection].length - 1}
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
                    onClick={() => removeProduct(activeSection, productId)}
                    className="p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
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
