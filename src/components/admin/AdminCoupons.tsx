import React, { useState, useEffect } from 'react';
import { Plus, Percent, Edit, Trash2, Loader2, Bell } from 'lucide-react';
import { Coupon } from '../../types';
import { couponService } from '../../services/couponService';
import { adminService } from '../../services/adminService';

const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponService.getAllCoupons();
      setCoupons(data);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async () => {
    const code = window.prompt("Enter Coupon Code (e.g. WELCOME10):");
    if (!code) return;
    const val = window.prompt("Enter Discount Value (in Rupees, e.g. 500):");
    if (!val) return;

    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code: code.toUpperCase(),
      discountType: 'fixed',
      discountValue: Number(val),
      minOrderAmount: 0,
      expiryDate: '2027-12-31',
      isActive: true,
      usageCount: 0
    };

    setLoading(true);
    try {
      await couponService.saveCoupon(newCoupon);
      await fetchCoupons();
      
      if (window.confirm("✅ Coupon created! Do you want to broadcast this discount to all users?")) {
        await handleBroadcastCoupon(newCoupon);
      }
    } catch (e) {
      alert("Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastCoupon = async (coupon: Coupon) => {
    if (!window.confirm(`Broadcast coupon "${coupon.code}" to all users?`)) return;
    setLoading(true);
    try {
      await adminService.sendMassNotification('all', {
        title: 'New Discount Coupon! 🎁',
        message: `Use code ${coupon.code} to get ${coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} off on your next order!`,
        type: 'offer'
      });
      alert("✅ Notification broadcasted to all users!");
    } catch (e) {
      alert("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    setLoading(true);
    try {
      await couponService.deleteCoupon(id);
      await fetchCoupons();
    } catch (e) {
      alert("Failed to delete coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white tracking-tight">Discount Coupons</h3>
        <button 
          onClick={handleAddCoupon} 
          disabled={loading}
          className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md flex items-center gap-2 hover:bg-amber-700 transition disabled:opacity-50"
        >
          <Plus size={14} /> Create New Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map(c => (
            <div key={c.id} className="bg-[#161616] rounded-3xl p-5 border border-[#222222] shadow-sm flex items-center justify-between group hover:border-amber-500/30 transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Percent size={24} />
                </div>
                <div>
                  <p className="text-lg font-black text-white tracking-widest">{c.code}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                    {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}
                    <span className="mx-2 opacity-30">|</span>
                    Min: ₹{c.minOrderAmount}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-3">
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => handleBroadcastCoupon(c)} 
                    className="p-2.5 bg-white/5 hover:bg-amber-600 rounded-xl text-gray-400 hover:text-white transition-all shadow-sm"
                    title="Broadcast to all users"
                  >
                    <Bell size={14} />
                  </button>
                  <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all shadow-sm"><Edit size={14} /></button>
                  <button onClick={() => handleDeleteCoupon(c.id)} className="p-2.5 bg-white/5 hover:bg-red-600 rounded-xl text-gray-400 hover:text-white transition-all shadow-sm"><Trash2 size={14} /></button>
                </div>
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${c.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                  {c.isActive ? 'Active' : 'Paused'}
                </span>
              </div>
            </div>
          ))}
          {coupons.length === 0 && (
            <div className="col-span-full py-20 text-center bg-[#161616] rounded-3xl border border-dashed border-[#333333]">
              <Percent size={48} className="mx-auto text-[#333333] mb-3" />
              <p className="text-gray-500 font-medium">No active coupons. Create one to drive sales!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
