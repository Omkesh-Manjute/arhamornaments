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

  const handleAddBanner = async () => {
    const title = window.prompt("Enter Banner Title (e.g. Diwali Sale):");
    if (!title) return;
    const subtitle = window.prompt("Enter Subtitle:");
    const image = window.prompt("Enter Image URL (or leave blank for placeholder):") || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800";

    setLoading(true);
    try {
      await bannerService.saveBanner({
        id: Date.now().toString(),
        title,
        subtitle: subtitle || "",
        image,
        link: "/products",
        isActive: true,
        order: banners.length + 1
      });
      await fetchBanners();
    } catch (e) {
      alert("Failed to save banner");
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Homepage Banners</h3>
        <button 
          onClick={handleAddBanner} 
          disabled={loading}
          className="px-4 py-2 bg-[#3B82F6] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map(b => (
            <div key={b.id} className="bg-[#161616] rounded-3xl overflow-hidden border border-[#222222] shadow-sm group">
              <div className="aspect-video relative">
                <img src={b.image} className="w-full h-full object-cover" alt="" />
                <div className="absolute top-3 right-3 flex gap-1">
                  <button className="p-2 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition opacity-0 group-hover:opacity-100"><Edit size={14} /></button>
                  <button onClick={() => handleDeleteBanner(b.id)} className="p-2 bg-red-500/10 backdrop-blur-md text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-bold">{b.title}</p>
                  <p className="text-gray-400 text-xs">{b.subtitle}</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-t border-[#222222]">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${b.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                  {b.isActive ? 'Active' : 'Hidden'}
                </span>
                <p className="text-[10px] text-gray-500 font-mono">Order: {b.order}</p>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="col-span-full py-20 text-center bg-[#161616] rounded-3xl border border-dashed border-[#333333]">
              <p className="text-gray-500">No banners found. Add some to make your homepage pop!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
