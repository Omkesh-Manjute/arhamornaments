import React, { useState, useEffect } from 'react';
import { Plus, Percent, Edit, Trash2, Loader2 } from 'lucide-react';
import { Coupon } from '../../types';
import { couponService } from '../../services/couponService';

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

    setLoading(true);
    try {
      await couponService.saveCoupon({
        id: Date.now().toString(),
        code: code.toUpperCase(),
        discountType: 'fixed',
        discountValue: Number(val),
        minOrderAmount: 0,
        expiryDate: '2027-12-31',
        isActive: true,
        usageCount: 0
      });
      await fetchCoupons();
    } catch (e) {
      alert("Failed to create coupon");
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
        <h3 className="text-xl font-bold text-white">Discount Coupons</h3>
        <button 
          onClick={handleAddCoupon} 
          disabled={loading}
          className="px-5 py-2 bg-[#10B981] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 hover:bg-green-500 transition disabled:opacity-50"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map(c => (
            <div key={c.id} className="bg-[#161616] rounded-3xl p-6 border border-[#222222] shadow-sm flex items-center justify-between group hover:border-[#333333] transition">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#10B981]/10 rounded-2xl flex items-center justify-center text-[#10B981] border border-[#10B981]/20">
                  <Percent size={24} />
                </div>
                <div>
                  <p className="text-lg font-black text-white tracking-wider">{c.code}</p>
                  <p className="text-xs text-gray-400 font-medium">
                    {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}
                    · Min: ₹{c.minOrderAmount}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="flex gap-2 justify-end">
                  <button className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-blue-400 transition"><Edit size={16} /></button>
                  <button onClick={() => handleDeleteCoupon(c.id)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-red-400 transition"><Trash2 size={16} /></button>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${c.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                  {c.isActive ? 'Live' : 'Paused'}
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
