import React, { useState, useEffect } from 'react';
import { Package, Plus, TrendingUp, DollarSign, X, Gem, Settings, Users, Bell, History, Shield, LogOut, Loader2, ChevronRight, Menu, Percent } from 'lucide-react';
import { Product, User } from '../types';
import { usePrice } from '../context/PriceContext';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { userService } from '../services/userService';

// Admin Sub-components
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminBanners from '../components/admin/AdminBanners';
import AdminCoupons from '../components/admin/AdminCoupons';
import AdminPromotions from '../components/admin/AdminPromotions';
import AdminMarketRates from '../components/admin/AdminMarketRates';
import AdminCustomers from '../components/admin/AdminCustomers';
import AdminNotifications from '../components/admin/AdminNotifications';
import AdminAuditLogs from '../components/admin/AdminAuditLogs';
import AdminProducts from '../components/admin/AdminProducts';
import AdminProductModal from '../components/admin/AdminProductModal';
import AdminHomepage from '../components/admin/AdminHomepage';

type TabType = 'dashboard' | 'products' | 'homepage' | 'banners' | 'coupons' | 'rates' | 'promotions' | 'customers' | 'notifications' | 'logs';

const CATEGORIES = [
  'bangles', 'bracelets', 'chain-sets', 'chains', 'earrings', 'kadas',
  'necklace-sets', 'nose-jewelry', 'pendant-sets', 'pendants', 'rings',
  'temple-necklaces', 'thushi', 'necklaces', 'mangalsutra', 'coins'
] as const;

const AdminPage: React.FC = () => {
  const { rates } = usePrice();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [selectedCust, setSelectedCust] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email === 'admin@arham.com') {
        setIsAuthorized(true);
        localStorage.setItem('admin_auth', 'true');
      } else {
        localStorage.removeItem('admin_auth');
        setIsAuthorized(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (adminPass === 'arham786') {
      try {
        await auth.signOut();
        const userCred = await signInWithEmailAndPassword(auth, 'admin@arham.com', 'arham786');
        if (userCred.user.email === 'admin@arham.com') {
          localStorage.setItem('admin_auth', 'true');
          setIsAuthorized(true);
        }
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            const newAdmin = await createUserWithEmailAndPassword(auth, 'admin@arham.com', 'arham786');
            await userService.updateUserProfile(newAdmin.user.uid, {
              email: 'admin@arham.com',
              role: 'admin',
              joinedDate: new Date().toISOString()
            });
            localStorage.setItem('admin_auth', 'true');
            setIsAuthorized(true);
          } catch (createErr) {
            alert('Admin creation failed. Check Firebase settings.');
          }
        } else {
          alert('Login failed: ' + err.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      alert('Incorrect password');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('admin_auth');
    setIsAuthorized(false);
  };

  const openAdd = () => { setEditingProduct(null); setShowModal(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setShowModal(true); };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#161616] border border-[#222222] rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-md">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/10">
              <Shield className="text-amber-500" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white text-center mb-2 tracking-tight">Terminal Access</h1>
            <p className="text-gray-500 text-center mb-10 font-mono text-[10px] uppercase tracking-[0.3em]">Arham Ornaments Admin Protocol</p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Authentication Key</label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  className="w-full px-6 py-5 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-all font-mono placeholder:text-gray-800"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-bold uppercase tracking-wide hover:from-amber-600 hover:to-amber-700 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.2)] disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Establish Connection'}
              </button>
            </form>
          </div>
          <p className="text-center mt-8 text-gray-600 font-mono text-[10px] uppercase tracking-[0.3em]">Secure Environment • End-to-End Encrypted</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: TrendingUp },
    { id: 'products', label: 'Inventory', icon: Package },
    { id: 'homepage', label: 'Banner Setup', icon: Gem },
    { id: 'rates', label: 'Market Rates', icon: DollarSign },
    { id: 'promotions', label: 'Growth Hub', icon: Settings },
    { id: 'customers', label: 'Members', icon: Users },
    { id: 'coupons', label: 'Discounts', icon: Percent },
    { id: 'notifications', label: 'Broadcast', icon: Bell },
    { id: 'logs', label: 'System Logs', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex text-gray-300 font-sans selection:bg-amber-500/30">
      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#111111] border-r border-[#222222] transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight uppercase">Arham Admin</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">System Online</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5">
            {menuItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id as TabType); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === id ? 'bg-amber-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-500 hover:text-white'}`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon size={16} className={activeTab === id ? 'text-white' : 'group-hover:text-amber-500 transition-colors'} />
                  <span className="text-[13px] font-bold tracking-tight">{label}</span>
                </div>
                {activeTab === id && <ChevronRight size={12} className="opacity-40" />}
              </button>
            ))}
          </nav>

          <div className="pt-6 mt-6 border-t border-[#222222]">
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all font-bold text-sm">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 shrink-0 border-b border-[#222222] bg-[#0D0D0D]/80 backdrop-blur-xl px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-gray-500 hover:text-white transition-colors">
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight capitalize">{activeTab}</h1>
              <div className="flex items-center gap-4 mt-0.5">
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">Gold: <span className="text-amber-500">₹{rates?.gold22K?.toLocaleString() || '0'}/10g</span></p>
                <div className="w-1 h-1 rounded-full bg-[#333333]" />
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">Silver: <span className="text-gray-300">₹{rates?.silver?.toLocaleString() || '0'}/kg</span></p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {activeTab === 'products' && (
              <button onClick={openAdd} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 active:scale-95">
                <Plus size={14} /> Add New Item
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-amber-500">AD</div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'dashboard' && <AdminDashboard sendNotification={() => setActiveTab('notifications')} />}
            {activeTab === 'products' && <AdminProducts onEditProduct={openEdit} />}
            {activeTab === 'homepage' && <AdminHomepage />}
            {activeTab === 'banners' && <AdminBanners />}
            {activeTab === 'coupons' && <AdminCoupons />}
            {activeTab === 'rates' && <AdminMarketRates />}
            {activeTab === 'promotions' && <AdminPromotions />}
            {activeTab === 'customers' && <AdminCustomers setSelectedCust={setSelectedCust} />}
            {activeTab === 'notifications' && <AdminNotifications />}
            {activeTab === 'logs' && <AdminAuditLogs />}
          </div>
        </div>
      </main>

      {/* Overlays */}
      <AdminProductModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        product={editingProduct} 
        CATEGORIES={CATEGORIES} 
        onSave={() => {}} 
      />

      {/* Customer Detail Overlay */}
      {selectedCust && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#161616] border border-[#222222] w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative">
            <button onClick={() => setSelectedCust(null)} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
            <div className="p-10">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center text-3xl font-black text-amber-500 shadow-xl shadow-amber-500/5">
                  {selectedCust.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">{selectedCust.name}</h2>
                  <p className="text-amber-500 font-mono text-xs uppercase tracking-widest mt-1">Ref Code: {selectedCust.referralCode}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#0D0D0D] border border-[#222222] p-6 rounded-3xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Wallet Balance</p>
                  <p className="text-2xl font-black text-white">₹{(selectedCust.walletBalance || 0).toLocaleString()}</p>
                </div>
                <div className="bg-[#0D0D0D] border border-[#222222] p-6 rounded-3xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Points</p>
                  <p className="text-2xl font-black text-purple-400">{(selectedCust.points || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Phone Number', val: selectedCust.phone, icon: Users },
                  { label: 'Email Address', val: selectedCust.email, icon: Bell },
                  { label: 'Member Since', val: selectedCust.joinedDate ? new Date(selectedCust.joinedDate).toLocaleDateString() : 'N/A', icon: History }
                ].map(({ label, val, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="text-gray-500" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-[#222222] flex gap-4">
                <button
                  onClick={async () => {
                    if (window.confirm(`Are you sure you want to reset ${selectedCust.name}'s wallet balance to ₹0?`)) {
                      await userService.updateUserProfile(selectedCust.id, { walletBalance: 0 });
                      setSelectedCust({ ...selectedCust, walletBalance: 0 });
                      alert('Wallet balance has been reset to ₹0.');
                    }
                  }}
                  className="flex-1 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-red-500/5"
                >
                  Reset Wallet Balance
                </button>
                <button
                  onClick={() => setSelectedCust(null)}
                  className="flex-1 py-4 bg-[#0D0D0D] border border-[#222222] text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-gray-500 hover:text-white transition-all active:scale-95"
                >
                  Close Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
