import React, { useState, useEffect } from 'react';
import { Bell, Send, Loader2, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { userService } from '../../services/userService';
import { auth } from '../../lib/firebase';
import { User } from '../../types';

const AdminNotifications: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    type: 'system' as 'system' | 'offer' | 'order',
    target: 'all' as 'all' | 'specific',
    specificPhone: ''
  });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (notifForm.target === 'specific' && customers.length === 0) {
      loadCustomers();
    }
  }, [notifForm.target]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingNotif(true);
    try {
      let uids: string[] = [];
      if (notifForm.target === 'specific') {
        const targetUser = customers.find(c => c.phone === notifForm.specificPhone);
        if (!targetUser) throw new Error("Customer with this phone number not found.");
        uids = [targetUser.id];
      }
      
      const sentCount = await adminService.sendMassNotification(
        notifForm.target,
        {
          title: notifForm.title,
          message: notifForm.message,
          type: notifForm.type
        },
        uids.length > 0 ? uids : undefined
      );

      await adminService.createAuditLog({
        adminId: auth.currentUser?.uid || 'unknown',
        adminEmail: auth.currentUser?.email || 'unknown',
        action: 'SEND_NOTIFICATION',
        details: `Sent ${notifForm.type} notification to ${notifForm.target === 'all' ? 'all users' : notifForm.specificPhone}. (${sentCount} users)`
      });

      alert(`Notification sent successfully to ${sentCount} users!`);
      setNotifForm({ title: '', message: '', type: 'system', target: 'all', specificPhone: '' });
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSendingNotif(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-[#161616] rounded-[2.5rem] border border-[#222222] p-10 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-5 mb-10">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/5">
              <Bell size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Notification Terminal</h3>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] mt-1">Broadcast high-priority system alerts</p>
            </div>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Transmission Title</label>
              <input
                required
                value={notifForm.title}
                onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                placeholder="e.g. SYSTEM PROTOCOL UPDATED"
                className="w-full px-6 py-4 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-all font-bold placeholder:text-gray-800"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Broadcast Payload</label>
              <textarea
                required
                rows={4}
                value={notifForm.message}
                onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                placeholder="Enter message details..."
                className="w-full px-6 py-4 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-all font-medium resize-none placeholder:text-gray-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category</label>
                <select
                  value={notifForm.type}
                  onChange={e => setNotifForm({ ...notifForm, type: e.target.value as any })}
                  className="w-full px-6 py-4 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="system">SYSTEM_UPDATE</option>
                  <option value="offer">PROMO_CAMPAIGN</option>
                  <option value="order">ORDER_PROTOCOL</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Protocol</label>
                <select
                  value={notifForm.target}
                  onChange={e => setNotifForm({ ...notifForm, target: e.target.value as any })}
                  className="w-full px-6 py-4 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="all">BROADCAST_ALL</option>
                  <option value="specific">DIRECT_TRANSMIT</option>
                </select>
              </div>
            </div>

            {notifForm.target === 'specific' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Identity (Phone)</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                  <input
                    required
                    value={notifForm.specificPhone}
                    onChange={e => setNotifForm({ ...notifForm, specificPhone: e.target.value })}
                    placeholder="+91..."
                    className="w-full pl-12 pr-6 py-4 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-all font-mono"
                  />
                  {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-amber-500" size={18} />}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={sendingNotif}
              className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 mt-4"
            >
              {sendingNotif ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              {sendingNotif ? 'Initiating Broadcast...' : 'Execute Transmission'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
