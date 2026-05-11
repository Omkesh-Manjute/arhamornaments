import React, { useState, useEffect } from 'react';
import { Gem, Save, Percent, Loader2 } from 'lucide-react';
import { configService } from '../../services/configService';
import { usePrice } from '../../context/PriceContext';
import { adminService } from '../../services/adminService';
import { auth } from '../../lib/firebase';

const AdminMarketRates: React.FC = () => {
  const { rates, setRates, makingCharges, setMakingCharges } = usePrice();
  const [ratesDraft, setRatesDraft] = useState({ ...rates });
  const [makingDraft, setMakingDraft] = useState({ ...makingCharges });
  const [loading, setLoading] = useState(false);

  // Sync with context if it changes externally
  useEffect(() => {
    setRatesDraft({ ...rates });
  }, [rates]);

  useEffect(() => {
    setMakingDraft({ ...makingCharges });
  }, [makingCharges]);

  const handleUpdateRates = async () => {
    setLoading(true);
    try {
      await configService.updateRates(ratesDraft);
      setRates(ratesDraft);

      await adminService.createAuditLog({
        adminId: auth.currentUser?.uid || 'unknown',
        adminEmail: auth.currentUser?.email || 'unknown',
        action: 'UPDATE_RATES',
        details: `Updated gold/silver rates to: Gold: ₹${ratesDraft.gold22K}, Silver: ₹${ratesDraft.silver}`
      });

      alert('✅ Rates updated successfully!');
    } catch (error) {
      alert("Failed to update rates.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMakingCharges = async () => {
    setLoading(true);
    try {
      await configService.updateMakingCharges(makingDraft);
      setMakingCharges(makingDraft as any);
      
      await adminService.createAuditLog({
        adminId: auth.currentUser?.uid || 'unknown',
        adminEmail: auth.currentUser?.email || 'unknown',
        action: 'UPDATE_MAKING_CHARGES',
        details: 'Updated global making charges for product categories.'
      });
      
      alert("✅ Making charges updated!");
    } catch (e) {
      alert("Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-[#161616] rounded-2xl border border-[#222222] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
            <Gem className="text-amber-500" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white">Live Metal Rates</h3>
            <p className="text-xs text-gray-400">Rate per gram (₹) — changes apply to all products immediately</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {([
            ['gold24K', 'Gold 24K', '#FFD700'],
            ['gold22K', 'Gold 22K', '#FFC125'],
            ['gold18K', 'Gold 18K', '#DAA520'],
            ['gold14K', 'Gold 14K', '#B8860B'],
            ['silver', 'Silver (per g)', '#C0C0C0'],
            ['platinum', 'Platinum (per g)', '#E5E4E2']
          ] as const).map(([key, label, color]) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
                {label}
              </label>
              <div className="flex items-center border border-[#222222] rounded-xl overflow-hidden focus-within:border-amber-500 transition bg-[#0D0D0D]">
                <span className="px-3 py-2.5 bg-[#1C1C1C] text-gray-400 text-sm border-r border-[#222222]">₹</span>
                <input
                  type="number"
                  value={ratesDraft[key as keyof typeof ratesDraft]}
                  onChange={e => setRatesDraft(r => ({ ...r, [key]: Number(e.target.value) }))}
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none font-medium text-white"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleUpdateRates}
          disabled={loading}
          className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Metal Rates
        </button>
      </div>

      <div className="bg-[#161616] rounded-2xl border border-[#222222] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
            <Percent className="text-blue-500" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white">Global Making Charges</h3>
            <p className="text-xs text-gray-400">Default percentage (%) per category</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(makingCharges).sort().map((cat) => (
            <div key={cat} className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 capitalize">{cat.replace(/-/g, ' ')}</label>
              <div className="flex items-center border border-[#222222] rounded-xl overflow-hidden focus-within:border-blue-500 transition bg-[#0D0D0D]">
                <input
                  type="number"
                  value={makingDraft[cat as keyof typeof makingDraft]}
                  onChange={e => setMakingDraft(m => ({ ...m, [cat]: Number(e.target.value) }))}
                  className="flex-1 px-3 py-2 text-sm bg-transparent outline-none font-medium text-white"
                />
                <span className="px-3 py-2 bg-[#1C1C1C] text-gray-500 text-xs border-l border-[#222222]">%</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleUpdateMakingCharges}
          disabled={loading}
          className="mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Making Charges
        </button>
      </div>
    </div>
  );
};

export default AdminMarketRates;
