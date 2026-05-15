import React, { useState, useEffect, useMemo } from 'react';
import { 
  Folder, 
  Package, 
  Search, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronDown,
  Eye, 
  Layers,
  Loader2,
  RefreshCw,
  Hash
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { productService } from '../../services/productService';

const CATEGORIES = [
  'bangles', 'bracelets', 'chain-sets', 'chains', 'earrings', 'kadas',
  'necklace-sets', 'nose-jewelry', 'pendant-sets', 'pendants', 'rings',
  'temple-necklaces', 'thushi', 'necklaces', 'mangalsutra', 'coins'
] as const;

interface AdminProductsProps {
  onEditProduct: (p: Product) => void;
}

const AdminProducts: React.FC<AdminProductsProps> = ({ onEditProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<'men' | 'women' | 'unisex' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) newExpanded.delete(group);
    else newExpanded.add(group);
    setExpandedGroups(newExpanded);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const handleSplit = async (p: Product) => {
    if (!confirm(`Split ${p.name} into ${p.images?.length || 0} separate products?`)) return;
    setLoading(true);
    try {
      await productService.splitProduct(p);
      await fetchProducts();
    } catch (err) {
      alert("Split failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('EXTREME DANGER: Delete ALL products in the database?')) return;
    const pass = prompt("Type 'DELETE ALL' to confirm:");
    if (pass !== 'DELETE ALL') return;
    
    setLoading(true);
    try {
      for (const p of products) {
        await productService.deleteProduct(p.id);
      }
      setProducts([]);
      alert("Database cleared");
    } catch (err) {
      alert("Clear failed");
    } finally {
      setLoading(false);
    }
  };

  // Category counts from ALL loaded products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach(cat => { counts[cat] = 0; });
    products.forEach(p => {
      // Filter by gender if set
      if (genderFilter !== 'all' && (p.gender || 'unisex') !== genderFilter) return;
      if (counts[p.category] !== undefined) counts[p.category]++;
    });
    return counts;
  }, [products, genderFilter]);

  // Products for selected folder, filtered by search
  const displayedProducts = useMemo(() => {
    let result = products;
    
    // Filter by gender
    if (genderFilter !== 'all') {
      result = result.filter(p => (p.gender || 'unisex') === genderFilter);
    }
    
    // Filter by category if folder selected
    if (selectedFolder) {
      result = result.filter(p => p.category === selectedFolder);
    }
    
    // Filter by search (name or design number)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.designNo?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [products, selectedFolder, searchQuery]);

  // Grouped products for the table
  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    
    displayedProducts.forEach(p => {
      // Logic: 001-1 -> group 001. If no dash, group is the designNo itself.
      const base = p.designNo?.split('-')[0] || 'Uncategorized';
      if (!groups[base]) groups[base] = [];
      groups[base].push(p);
    });

    // Sort groups by key
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [displayedProducts]);

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <Loader2 className="animate-spin text-amber-500" size={40} />
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Inventory sync in progress...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Gender Filter Tabs */}
        <div className="flex bg-[#161616] border border-[#222222] p-1 rounded-2xl">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'men', label: 'Men' },
            { id: 'women', label: 'Women' },
            { id: 'unisex', label: 'Unisex' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setGenderFilter(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all ${
                genderFilter === tab.id 
                  ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder={selectedFolder ? `Filter by name or design # in ${selectedFolder}...` : "Search by name, design #, or category..."} 
            className="w-full pl-12 pr-4 py-3 border border-[#222222] bg-[#161616] text-gray-200 rounded-[1.25rem] text-sm focus:outline-none focus:border-amber-500 transition-all placeholder-gray-600 shadow-sm" 
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchProducts} className="p-3 bg-[#161616] border border-white/5 rounded-xl text-gray-500 hover:text-amber-500 hover:bg-white/5 transition-all" title="Refresh">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleClearAll}
            className="p-3 bg-red-500/5 border border-red-500/10 text-red-500/60 rounded-xl hover:bg-red-500 hover:text-white transition-all"
            title="Clear Database"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Category Folders */}
      {!selectedFolder ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">All Categories</h3>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">{products.length} total products</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-in fade-in zoom-in duration-500">
            {CATEGORIES.map(cat => {
              const count = categoryCounts[cat];
              return (
                <div
                  key={cat}
                  onClick={() => { setSelectedFolder(cat); setSearchQuery(''); }}
                  className="group cursor-pointer space-y-3"
                >
                  <div className={`aspect-square bg-[#161616] border rounded-[2.5rem] flex flex-col items-center justify-center text-amber-500 group-hover:border-amber-500/50 group-hover:bg-amber-500/5 transition-all duration-500 relative overflow-hidden shadow-lg ${count > 0 ? 'border-[#333333]' : 'border-[#222222] opacity-60'}`}>
                    <div className={`absolute top-4 right-4 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${count > 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-black/60 text-gray-600 border-white/10'}`}>
                      {count}
                    </div>
                    <Folder size={48} fill="currentColor" fillOpacity={0.1} className="transform group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-3 group-hover:text-white transition-colors">{cat}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Product List Inside Folder */
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setSelectedFolder(null); setSearchQuery(''); }}
                className="p-3 bg-[#161616] border border-[#222222] rounded-2xl text-gray-400 hover:text-white hover:border-amber-500/50 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight capitalize flex items-center gap-2">
                  <Folder size={20} className="text-amber-500" /> {selectedFolder}
                </h3>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">
                  {displayedProducts.length} of {categoryCounts[selectedFolder] || 0} products
                  {searchQuery && ` • filtered by "${searchQuery}"`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#161616] rounded-[2.5rem] border border-[#222222] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.01] border-b border-[#222222]">
                  <tr>
                    {['Product', 'Design #', 'Price', 'Weight', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {groupedProducts.map(([groupName, groupItems]) => {
                    const isExpanded = expandedGroups.has(groupName);
                    const firstP = groupItems[0];
                    
                    return (
                      <React.Fragment key={groupName}>
                        {/* Group Header Row */}
                        <tr 
                          onClick={() => toggleGroup(groupName)}
                          className="cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all border-l-2 border-transparent hover:border-amber-500/50"
                        >
                          <td className="px-6 py-4" colSpan={2}>
                            <div className="flex items-center gap-4">
                              <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                <ChevronDown size={16} className="text-gray-500" />
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 bg-black/40">
                                  <img 
                                    src={firstP.images?.[0] || 'https://via.placeholder.com/400?text=No+Image'} 
                                    alt="" 
                                    className="w-full h-full object-cover opacity-50" 
                                  />
                                </div>
                                <div>
                                  <p className="font-black text-white text-sm tracking-tight">{groupName}</p>
                                  <p className="text-[9px] text-amber-500/60 font-mono uppercase tracking-widest">{groupItems.length} Products in group</p>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-[10px] uppercase tracking-widest font-bold" colSpan={3}>
                            {firstP.name}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-full border border-amber-500/20 tracking-wide">GROUP</span>
                          </td>
                        </tr>

                        {/* Child Rows */}
                        {isExpanded && groupItems.map(p => (
                          <tr key={p.id} className="group hover:bg-white/[0.02] transition-all bg-black/20">
                            <td className="px-6 py-4 pl-16">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#333333] bg-[#0D0D0D] shrink-0 group-hover:border-amber-500/30 transition-colors">
                                  <img 
                                    src={p.images?.[0] || (p as any).image || 'https://via.placeholder.com/400?text=No+Image'} 
                                    alt={p.name} 
                                    loading="lazy" 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110 duration-500" 
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-200 text-xs truncate group-hover:text-white transition-colors">{p.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5">
                                <Hash size={12} className="text-gray-600" />
                                <span className="text-[10px] text-amber-500/80 font-mono font-bold">{p.designNo || '—'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-mono text-white text-xs font-bold">₹{p.price?.toLocaleString('en-IN') || '0'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-0.5">
                                <p className="text-xs text-amber-500/80 font-mono font-bold">{p.netWeight || 0}g</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-1 h-1 rounded-full ${p.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${p.inStock ? 'text-green-500/80' : 'text-red-500/80'}`}>{p.inStock ? 'Stock' : 'Sold'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-1 justify-end">
                                {p.images && p.images.length > 1 && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleSplit(p); }} 
                                    className="p-2 text-amber-500 hover:bg-amber-500/5 rounded-lg transition" 
                                    title="Split into individual products"
                                  >
                                    <Layers size={14} />
                                  </button>
                                )}
                                <Link to={`/product/${p.id}`} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition" title="Preview"><Eye size={14} /></Link>
                                <button onClick={(e) => { e.stopPropagation(); onEditProduct(p); }} className="p-2 text-gray-500 hover:text-amber-500 hover:bg-amber-500/5 rounded-lg transition" title="Edit Product"><Edit size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition" title="Delete"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {displayedProducts.length === 0 && (
              <div className="p-20 text-center">
                <Package className="mx-auto text-gray-800 mb-4" size={48} />
                <p className="text-gray-500 font-bold">
                  {searchQuery ? `No products matching "${searchQuery}"` : 'No products in this category yet'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
