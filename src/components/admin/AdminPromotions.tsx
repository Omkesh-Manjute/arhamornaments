import React, { useState, useEffect } from 'react';
import { Gift, Save, Percent, Loader2 } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { adminService } from '../../services/adminService';

const AdminPromotions: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [promoSettings, setPromoSettings] = useState({
    newUserBonus: 100,
    referrerCredit: 100,
    spinSegments: [
      { id: 1, label: '₹500 Cash', weight: 'High Risk', value: 500, type: 'cash' },
      { id: 2, label: 'Gold Coin', weight: 'Very Low', value: 0, type: 'item' },
      { id: 3, label: '₹250 Cash', weight: 'Medium', value: 250, type: 'cash' },
      { id: 4, label: 'Diamond Pendant', weight: 'Extremely Low', value: 0, type: 'item' }
    ]
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'promotions'));
      if (docSnap.exists()) {
        setPromoSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePromotions = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'promotions'), promoSettings);
      await adminService.createAuditLog({
        adminId: auth.currentUser?.uid || 'unknown',
        adminEmail: auth.currentUser?.email || 'unknown',
        action: 'UPDATE_PROMOTIONS',
        details: 'Changed referral bonuses and spin probabilities.'
      });
      alert('Promotion settings saved successfully!');
    } catch (err: any) {
      alert('Error saving settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSegmentChange = (id: number, field: string, value: any) => {
    const updatedSegments = promoSettings.spinSegments.map((s: any) => 
      s.id === id ? { ...s, [field]: value } : s
    );
    setPromoSettings({ ...promoSettings, spinSegments: updatedSegments });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="animate-spin text-amber-500" size={48} />
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#161616] rounded-2xl border border-[#222222] p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <Gift size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Referral Rewards</h3>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">New User Bonus (₹)</label>
              <input
                type="number"
                value={promoSettings.newUserBonus}
                onChange={e => setPromoSettings({...promoSettings, newUserBonus: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#222222] rounded-xl text-white outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Referrer Credit (₹)</label>
              <input
                type="number"
                value={promoSettings.referrerCredit}
                onChange={e => setPromoSettings({...promoSettings, referrerCredit: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#222222] rounded-xl text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#161616] rounded-2xl border border-[#222222] p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center text-[#3B82F6]">
              <Percent size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Spin & Win Config</h3>
          </div>
          <p className="text-sm text-gray-400 mb-6">Adjust the weight and values for the Lucky Wheel segments.</p>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {promoSettings.spinSegments.map((segment: any) => (
              <div key={segment.id} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase">Segment #{segment.id}</span>
                  <input 
                    value={segment.label}
                    onChange={e => handleSegmentChange(segment.id, 'label', e.target.value)}
                    className="bg-transparent text-right text-sm font-bold text-white outline-none border-b border-transparent focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Weight (Probability)</label>
                    <select 
                      value={segment.weight}
                      onChange={e => handleSegmentChange(segment.id, 'weight', e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-[#222222] rounded-lg p-2 text-xs text-white"
                    >
                      <option value="Very High">Very High (Common)</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                      <option value="Very Low">Very Low (Rare)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Value (₹)</label>
                    <input 
                      type="number"
                      value={segment.value}
                      onChange={e => handleSegmentChange(segment.id, 'value', Number(e.target.value))}
                      className="w-full bg-[#0D0D0D] border border-[#222222] rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSavePromotions}
        disabled={saving}
        className="w-full md:w-auto px-12 py-4 bg-amber-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-amber-600 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
      >
        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
        Save Promotion Settings
      </button>
    </div>
  );
};

export default AdminPromotions;
