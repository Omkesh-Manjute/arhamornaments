import React, { useState, useEffect } from 'react';
import { Users, Search, X, Eye, Wallet, BadgeCheck, Bell, Loader2 } from 'lucide-react';
import { User } from '../../types';
import { userService } from '../../services/userService';

interface AdminCustomersProps {
  setSelectedCust: (u: User | null) => void;
}

const AdminCustomers: React.FC<AdminCustomersProps> = ({
  setSelectedCust
}) => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [custSearch, setCustSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const allUsers = await userService.getAllUsers();
      setCustomers(allUsers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    !custSearch ||
    c.name?.toLowerCase().includes(custSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(custSearch.toLowerCase()) ||
    c.phone?.includes(custSearch)
  );

  const stats = [
    { label: 'Total Members', val: customers.length, icon: Users, color: 'blue' },
    { label: 'Wallet Issued', val: `₹${customers.reduce((s, c) => s + (c.walletBalance || 0), 0).toLocaleString()}`, icon: Wallet, color: 'amber' },
    { label: 'Total Referrals', val: customers.reduce((s, c) => s + (c.referralCount || 0), 0), icon: BadgeCheck, color: 'green' },
    { label: 'Notifications', val: customers.reduce((s, c) => s + (c.notifications?.length || 0), 0), icon: Bell, color: 'purple' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading customer directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="bg-[#161616] rounded-2xl p-5 shadow-sm border border-[#222222]">
            <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-${color}-500/10 border border-${color}-500/20`}>
              <Icon className={`text-${color}-500`} size={20} />
            </div>
            <p className="text-2xl font-bold text-white">{val}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-[#161616] rounded-2xl border border-[#222222] p-4 flex items-center gap-3">
        <Search className="text-gray-500 shrink-0" size={18} />
        <input
          value={custSearch}
          onChange={e => setCustSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="flex-1 bg-transparent outline-none text-sm text-gray-300 placeholder-gray-600"
        />
        {custSearch && (
          <button onClick={() => setCustSearch('')} className="text-gray-500 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {customers.length === 0 ? (
        <div className="bg-[#161616] rounded-2xl border border-[#222222] p-12 text-center">
          <Users className="mx-auto text-[#333333] mb-4" size={52} />
          <h3 className="font-bold text-white mb-1">No Registered Customers Yet</h3>
          <p className="text-sm text-gray-500">When users sign up on the store, they'll appear here.</p>
        </div>
      ) : (
        <div className="bg-[#161616] rounded-2xl border border-[#222222] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.02] border-b border-[#222222]">
                <tr>
                  {['Customer', 'Contact', 'Joined', 'Tier', 'Wallet', 'Points', 'Referrals', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-sm flex items-center justify-center shrink-0">
                          {c.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{c.name}</p>
                          <p className="text-[11px] text-gray-500 font-mono">{c.referralCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-300">{c.phone}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {c.joinedDate ? new Date(c.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${c.tier === 'platinum' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        c.tier === 'gold' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-white/5 text-gray-400 border-white/10'
                        }`}>{c.tier || 'silver'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-amber-500">₹{(c.walletBalance || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-purple-400 font-bold">{c.points || 0}</td>
                    <td className="px-4 py-3 text-sm text-green-400 font-bold">{c.referralCount || 0}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedCust(c)}
                        className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-white/5 rounded-lg transition"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;

