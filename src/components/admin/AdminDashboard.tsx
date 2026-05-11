import React, { useState, useEffect } from 'react';
import { Package, DollarSign, TrendingUp, ShoppingCart, Upload, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { productService } from '../../services/productService';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allProducts = await productService.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats: DashboardStats = {
    total: products.length,
    value: products.reduce((s, p) => s + Number(p.price || 0), 0),
    featured: products.filter(p => p.featured).length,
    inStock: products.filter(p => p.inStock).length
  };

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
        <div className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl p-4 flex flex-col justify-between shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-blue-400/20">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/20 mb-4 backdrop-blur-md">
            <Upload size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-blue-100 uppercase tracking-widest">Global Action</p>
            <p className="text-lg font-bold text-white mt-1 cursor-pointer hover:underline" onClick={sendNotification}>Send Broadcast</p>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div className="flex items-center justify-between bg-[#3B82F6]/10 border border-[#3B82F6] px-5 py-3 rounded-xl">
        <span className="text-[11px] font-bold text-[#3B82F6] font-mono uppercase">System Healthy • Sync Active</span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-[#161616] border border-[#222222] hover:border-[#3B82F6] text-white text-[11px] font-bold rounded-lg transition-colors">Export CSV</button>
          <button className="px-3 py-1.5 bg-[#161616] border border-[#222222] hover:border-[#3B82F6] text-white text-[11px] font-bold rounded-lg transition-colors">Print Report</button>
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
          {products.slice(0, 10).map(p => (
            <div key={p.id} className="grid grid-cols-12 gap-4 px-6 items-center h-[56px] hover:bg-white/[0.02] transition-colors cursor-pointer group relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,_50%)_var(--mouse-y,_50%),_rgba(59,130,246,0.08)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <img src={p.images ? p.images[0] : (p as any).image} className="w-8 h-8 rounded-lg object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                <span className="text-sm font-medium text-gray-200 truncate">{p.name}</span>
              </div>
              <div className="col-span-2 text-xs text-gray-400 capitalize">{p.category}</div>
              <div className="col-span-3 text-sm font-mono text-right text-gray-300">₹{Number(p.price).toLocaleString('en-IN')}</div>
              <div className="col-span-3 flex justify-center">
                {p.inStock ? (
                  <span className="inline-flex items-center gap-2 h-6 px-3 rounded-full text-[10px] font-bold text-[#34D399] bg-[#34D399]/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse"></span>
                    IN STOCK
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 h-6 px-3 rounded-full text-[10px] font-bold text-[#FB7185] bg-[#FB7185]/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185]"></span>
                    OUT OF STOCK
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

