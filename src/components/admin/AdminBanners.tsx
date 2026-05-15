import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { Banner } from '../../types';
import { bannerService } from '../../services/bannerService';

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await bannerService.getAllBanners();
      setBanners(data);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBanner = async (banner: Banner) => {
    const title = window.prompt("Edit Banner Title:", banner.title);
    if (title === null) return;
    const subtitle = window.prompt("Edit Subtitle:", banner.subtitle);
    if (subtitle === null) return;
    const image = window.prompt("Edit Image URL:", banner.image);
    if (image === null) return;
    const order = window.prompt("Edit Order (Higher shows first):", banner.order.toString());
    if (order === null) return;

    setLoading(true);
    try {
      await bannerService.saveBanner({
        ...banner,
        title,
        subtitle,
        image,
        order: Number(order)
      });
      await fetchBanners();
    } catch (e) {
      alert("Failed to update banner");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm("Delete this banner?")) return;
    setLoading(true);
    try {
      await bannerService.deleteBanner(id);
      await fetchBanners();
    } catch (e) {
      alert("Failed to delete banner");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBanner = async () => {
    const title = window.prompt("Banner Title:");
    if (!title) return;
    const subtitle = window.prompt("Subtitle:");
    const image = window.prompt("Image URL:");
    if (!image) return;
    
    setLoading(true);
    try {
      await bannerService.saveBanner({
        id: Date.now().toString(),
        title,
        subtitle: subtitle || '',
        image,
        link: '/products',
        isActive: true,
        order: banners.length > 0 ? Math.max(...banners.map(b => b.order)) + 1 : 1
      });
      await fetchBanners();
    } catch (e) {
      alert("Failed to add banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Hero Banners</h3>
          <p className="text-xs text-gray-500 mt-1">Manage slides for the main homepage hero section</p>
        </div>
        <button 
          onClick={handleAddBanner} 
          disabled={loading}
          className="px-6 py-2 bg-amber-600 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-amber-700 transition-all flex items-center gap-2 disabled:opacity-50 border border-amber-500/20 shadow-lg shadow-amber-900/20"
        >
          <Plus size={14} /> Add New Slide
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map(b => (
            <div key={b.id} className="bg-[#161616] rounded-3xl overflow-hidden border border-[#222222] group hover:border-amber-500/30 transition-all duration-300">
              <div className="aspect-[21/9] relative">
                <img src={b.image} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" alt="" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button 
                    onClick={() => handleEditBanner(b)}
                    className="p-2.5 bg-black/80 backdrop-blur-md text-white rounded-xl hover:bg-amber-600 transition opacity-0 group-hover:opacity-100 border border-white/10"
                  >
                    <Edit size={12} />
                  </button>
                  <button 
                    onClick={() => handleDeleteBanner(b.id)} 
                    className="p-2.5 bg-black/80 backdrop-blur-md text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition opacity-0 group-hover:opacity-100 border border-white/10"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/50 to-transparent">
                  <p className="text-xs font-black text-white uppercase tracking-wider">{b.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{b.subtitle}</p>
                </div>
              </div>
              <div className="px-5 py-3.5 flex items-center justify-between border-t border-[#222222] bg-[#0D0D0D]/50">
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${b.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                  {b.isActive ? 'Visible' : 'Hidden'}
                </span>
                <p className="text-[9px] text-gray-600 font-mono font-bold uppercase tracking-widest">Order: {b.order}</p>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="col-span-full py-20 text-center bg-[#161616] rounded-3xl border border-dashed border-[#333333]">
              <p className="text-gray-500 font-medium">No banners found. Start by adding one above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
