import React, { useState, useEffect, useMemo } from 'react';
import { 
  Folder, 
  Package, 
  Search, 
  Edit, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  Eye, 
  Layers,
  Loader2,
  RefreshCw
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
  const [viewMode, setViewMode] = useState<'list' | 'folders'>('folders');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleBulkRename = async (newName: string, targets: Product[]) => {
    if (!confirm(`Rename ${targets.length} products?`)) return;
    setLoading(true);
    try {
      for (const p of targets) {
        await productService.saveProduct({ ...p, name: newName });
      }
      await fetchProducts();
      alert("Bulk rename complete");
    } catch (err) {
      alert("Rename failed");
    } finally {
      setLoading(false);
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

  const filtered = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.designNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const displayedProducts = useMemo(() => {
    if (viewMode === 'folders' && selectedFolder) {
      return filtered.filter(p => p.category === selectedFolder);
    }
    return filtered;
  }, [filtered, viewMode, selectedFolder]);

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
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-[#161616] p-1 rounded-2xl border border-[#222222]">
          <button
            onClick={() => { setViewMode('folders'); setSelectedFolder(null); }}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${viewMode === 'folders' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Folder size={16} /> Folders
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${viewMode === 'list' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Package size={16} /> List
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search by name, design #, or category..." 
            className="w-full pl-12 pr-4 py-3 border border-[#222222] bg-[#161616] text-gray-200 rounded-[1.25rem] text-sm focus:outline-none focus:border-amber-500 transition-all placeholder-gray-600 shadow-sm" 
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchProducts} className="p-3 bg-[#161616] border border-[#222222] rounded-xl text-gray-500 hover:text-amber-500 transition">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => {
              const newName = prompt("Enter new name for all products currently visible:");
              if (newName) handleBulkRename(newName, displayedProducts);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition font-bold text-xs uppercase tracking-widest"
          >
            <Edit size={16} /> Bulk Rename
          </button>
          <button
            onClick={handleClearAll}
            className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition"
            title="Clear Database"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'folders' && !selectedFolder ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-in fade-in zoom-in duration-500">
          {CATEGORIES.map(cat => {
            const count = filtered.filter(p => p.category === cat).length;
            return (
              <div
                key={cat}
                onClick={() => setSelectedFolder(cat)}
                className="group cursor-pointer space-y-3"
              >
                <div className="aspect-square bg-[#161616] border border-[#222222] rounded-[2.5rem] flex flex-col items-center justify-center text-amber-500 group-hover:border-amber-500/50 group-hover:bg-amber-500/5 transition-all duration-500 relative overflow-hidden shadow-lg">
                  <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 rounded-lg text-[9px] font-black text-white border border-white/10 uppercase tracking-tighter">{count} Items</div>
                  <Folder size={48} fill="currentColor" fillOpacity={0.1} className="transform group-hover:scale-110 transition-transform duration-500" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-3 group-hover:text-white transition-colors">{cat}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            {viewMode === 'folders' && selectedFolder ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="p-3 bg-[#161616] border border-[#222222] rounded-2xl text-gray-400 hover:text-white hover:border-amber-500/50 transition-all shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight capitalize flex items-center gap-2">
                    <Folder size={20} className="text-amber-500" /> {selectedFolder}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">{displayedProducts.length} items discovered</p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Full Inventory</h3>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">Showing {filtered.length} of {products.length} total products</p>
              </div>
            )}
          </div>

          <div className="bg-[#161616] rounded-[2.5rem] border border-[#222222] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.01] border-b border-[#222222]">
                  <tr>{['Product', 'Category', 'Price', 'Weight', 'Status', 'Actions'].map(h => <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {displayedProducts.map(p => (
                    <tr key={p.id} className="group hover:bg-white/[0.02] transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#333333] bg-[#0D0D0D] shrink-0 group-hover:border-amber-500/30 transition-colors">
                            <img src={p.images?.[0] || (p as any).image} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110 duration-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-200 text-sm truncate group-hover:text-white transition-colors">{p.name}</p>
                            <div className="flex gap-2 mt-1 items-center">
                              <span className="text-[10px] text-gray-600 font-mono font-bold tracking-widest uppercase">ID: {p.designNo || 'N/A'}</span>
                              {p.featured && <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter border border-amber-500/10">Premium</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-[#0D0D0D] border border-[#222222] rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-wider">{p.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-white text-sm font-bold">₹{p.price.toLocaleString('en-IN')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-amber-500/80 font-mono font-bold">{p.netWeight || 0}g</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${p.inStock ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${p.inStock ? 'text-green-500/80' : 'text-red-500/80'}`}>{p.inStock ? 'In Stock' : 'Sold Out'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5">
                          <Link to={`/product/${p.id}`} className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition" title="Preview"><Eye size={16} /></Link>
                          <button onClick={() => onEditProduct(p)} className="p-2.5 text-gray-500 hover:text-amber-500 hover:bg-amber-500/5 rounded-xl transition" title="Edit Properties"><Edit size={16} /></button>
                          {p.images && p.images.length > 1 && (
                            <button onClick={() => handleSplit(p)} className="p-2.5 text-gray-500 hover:text-purple-400 hover:bg-purple-500/5 rounded-xl transition" title="Deconstruct Product"><Layers size={16} /></button>
                          )}
                          <button onClick={() => handleDelete(p.id)} className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition" title="Permanent Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {displayedProducts.length === 0 && (
              <div className="p-20 text-center">
                <Package className="mx-auto text-gray-800 mb-4" size={48} />
                <p className="text-gray-500 font-bold">No products found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
