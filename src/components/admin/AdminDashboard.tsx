import React, { useState, useEffect } from 'react';
import { Package, DollarSign, TrendingUp, ShoppingCart, Upload, Loader2, ChevronDown, Hash } from 'lucide-react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { errorLogService } from '../../services/errorLogService';
import { Bug } from 'lucide-react';

interface DashboardStats {
  total: number;
  value: number;
  featured: number;
  inStock: number;
}

interface AdminDashboardProps {
  sendNotification: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ sendNotification }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [errorCount, setErrorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) newExpanded.delete(group);
    else newExpanded.add(group);
    setExpandedGroups(newExpanded);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const productsPromise = productService.getAllProducts()
        .catch(err => {
          console.error("Failed to fetch products for dashboard:", err);
          return [] as Product[];
        });
      const logsPromise = errorLogService.getErrorLogs()
        .catch(err => {
          console.error("Failed to fetch error logs for dashboard:", err);
          return [];
        });

      const [allProducts, logs] = await Promise.all([productsPromise, logsPromise]);
      setProducts(allProducts || []);
      setErrorCount((logs || []).filter(l => l && l.status === 'new').length);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats: DashboardStats = {
    total: products?.length || 0,
    value: (products || []).reduce((s, p) => s + Number(p?.price || 0), 0),
    featured: (products || []).filter(p => p?.featured).length,
    inStock: (products || []).filter(p => p?.inStock).length
  };

  // Grouped products for the table (limited to first 20 recent groups)
  const groupedProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    const groups: Record<string, Product[]> = {};
    
    products.forEach(p => {
      if (!p) return;
      const base = p.designNo?.split('-')[0] || 'Uncategorized';
      if (!groups[base]) groups[base] = [];
      groups[base].push(p);
    });

    return Object.entries(groups).sort((a, b) => {
       return (a[0] || '').localeCompare(b[0] || '');
    }).slice(0, 20);
  }, [products]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Initializing dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'TOTAL PRODUCTS', val: stats.total, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', Icon: Package },
          { label: 'INVENTORY VALUE', val: `₹${stats.value.toLocaleString('en-IN')}`, color: 'text-[#34D399]', bg: 'bg-[#34D399]/10', Icon: DollarSign },
          { label: 'FEATURED ITEMS', val: stats.featured, color: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/10', Icon: TrendingUp },
          { label: 'IN STOCK ITEMS', val: stats.inStock, color: 'text-[#FB7185]', bg: 'bg-[#FB7185]/10', Icon: ShoppingCart },
        ].map(({ label, val, color, bg, Icon }) => (
          <div key={label} className="bg-[#161616] border border-[#222222] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#3B82F6]/50 transition-colors duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,_50%)_var(--mouse-y,_50%),_rgba(59,130,246,0.08)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} mb-4`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</p>
              <p className="text-2xl font-mono text-gray-100 mt-1">{val}</p>
            </div>
          </div>
        ))}
        <div className="bg-[#161616] border border-[#222222] rounded-xl p-4 flex flex-col justify-between shadow-sm group hover:border-red-500/50 transition-colors">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${errorCount > 0 ? 'bg-red-500/10' : 'bg-green-500/10'} mb-4 border border-white/5`}>
            <Bug size={20} className={errorCount > 0 ? 'text-red-500' : 'text-green-500'} />
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">New Bug Reports</p>
            <p className={`text-sm font-black mt-1 uppercase tracking-tight ${errorCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {errorCount} {errorCount === 1 ? 'Error' : 'Errors'} Found
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div className="flex items-center justify-between bg-[#111111] border border-[#222222] px-5 py-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${errorCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
          <span className="text-[10px] font-black text-gray-400 font-mono uppercase tracking-[0.1em]">
            {errorCount > 0 ? `Attention: ${errorCount} unresolved errors` : 'System Healthy • Live Sync'}
          </span>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#1A1A1A] border border-[#333333] hover:border-gray-500 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95">Export CSV</button>
          <button className="px-4 py-2 bg-[#1A1A1A] border border-[#333333] hover:border-gray-500 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95">Print Summary</button>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-[#161616] rounded-[16px] border border-[#222222] overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#222222] bg-white/[0.02]">
          <div className="col-span-4 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-gray-500">Product Name</div>
          <div className="col-span-2 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-gray-500">Category</div>
          <div className="col-span-3 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-gray-500 text-right">Price</div>
          <div className="col-span-3 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-gray-500 text-center">Status</div>
        </div>
        <div className="divide-y divide-[#222222]">
          {groupedProducts.map(([groupName, groupItems]) => {
            const isExpanded = expandedGroups.has(groupName);
            const firstP = groupItems[0];
            
            return (
              <React.Fragment key={groupName}>
                {/* Group Header Row */}
                <div 
                  onClick={() => toggleGroup(groupName)}
                  className="grid grid-cols-12 gap-4 px-6 items-center h-[64px] hover:bg-white/[0.03] transition-all cursor-pointer group border-l-2 border-transparent hover:border-amber-500/50"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <ChevronDown size={14} className="text-gray-500" />
                    </div>
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#333333] bg-[#0D0D0D]">
                      <img src={firstP.images?.[0]} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all" alt="" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-200 truncate group-hover:text-amber-500 transition-colors">{firstP.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] text-amber-500/60 font-mono font-bold uppercase tracking-wider">{groupName}</span>
                        <span className="text-[8px] text-gray-600 font-mono">•</span>
                        <span className="text-[9px] text-gray-500/80 font-mono uppercase tracking-wider">{groupItems.length} Variations</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-[10px] text-gray-500 uppercase tracking-widest font-black truncate">{firstP.category}</div>
                  <div className="col-span-3 text-sm font-mono text-right text-white font-bold">₹{Number(firstP.price).toLocaleString('en-IN')}</div>
                  <div className="col-span-3 flex justify-center items-center">
                    <div className={`w-1.5 h-1.5 rounded-full ${groupItems.some(item => item.inStock) ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'} mr-2`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${groupItems.some(item => item.inStock) ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                      {groupItems.some(item => item.inStock) ? 'In Stock' : 'Sold'}
                    </span>
                  </div>
                </div>

                {/* Individual Items */}
                {isExpanded && groupItems.map(p => (
                  <div key={p.id} className="grid grid-cols-12 gap-4 px-6 pl-12 items-center h-[64px] bg-black/20 hover:bg-white/[0.02] transition-colors cursor-pointer group relative">
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#333333] bg-[#0D0D0D]">
                        <img src={p.images ? p.images[0] : (p as any).image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110" alt="" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-gray-300 truncate block">{p.name}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Hash size={10} className="text-gray-600" />
                          <span className="text-[9px] text-amber-500/60 font-mono font-bold">{p.designNo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-[10px] text-gray-500 uppercase tracking-widest">{p.category}</div>
                    <div className="col-span-3 text-sm font-mono text-right text-white font-bold">₹{Number(p.price).toLocaleString('en-IN')}</div>
                    <div className="col-span-3 flex justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${p.inStock ? 'bg-emerald-500' : 'bg-rose-500'} mr-2`}></div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${p.inStock ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>{p.inStock ? 'In Stock' : 'Sold'}</span>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

