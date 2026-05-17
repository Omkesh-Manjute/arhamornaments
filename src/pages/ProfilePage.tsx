import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import ReferAndEarn from '../components/promotions/ReferAndEarn';
import LuckyWheel from '../components/promotions/LuckyWheel';
import {
  User as UserIcon, Mail, Phone, MapPin, Package, Heart, Settings,
  LogOut, ChevronRight, Award, Crown, Zap, Sparkles, Gem, Bell,
  Info, Tag, ShoppingBag, Edit3, Save, X, Copy, Check, Wallet,
  TrendingUp, Gift, Calendar
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, logout, markNotificationsRead, updateProfile } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'notifications' | 'wallet'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', email: '', phone: '', streetAddress: '', city: '', pincode: ''
  });

  // ─── Not logged in ───────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] py-8 md:py-16 px-4 flex flex-col items-center justify-center space-y-6 md:space-y-10">
        <div className="text-center space-y-3 max-w-2xl">
          <span className="text-gold uppercase tracking-[0.4em] text-[9px] font-black block">Elite Membership</span>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-charcoal leading-tight">
            Spin to Join the <br /><span className="italic text-gold">Arham Elite</span>
          </h1>
          <p className="text-gray-400 text-xs max-w-sm mx-auto">
            Create your account, unlock exclusive rewards, track orders, and claim your welcome bonus.
          </p>
        </div>
        <div className="w-full max-w-4xl">
          <LuckyWheel isEmbedded={true} />
        </div>
        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black">
          Assured rewards up to ₹500 for every new member
        </p>
      </div>
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────────
  const handleLogout = () => { logout(); navigate('/'); };

  const joinedDate = user.joinedDate || new Date().toISOString();
  const unreadCount = (user.notifications || []).filter(n => !n.isRead).length;
  const walletBalance = user.walletBalance || 0;

  const handleEditStart = () => {
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      streetAddress: user.streetAddress || user.address || '',
      city: user.city || '',
      pincode: user.pincode || '',
    });
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(user.referralCode || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const walletTransactions = (user.notifications || []).filter(
    n => n.type === 'offer' && n.title?.toLowerCase().includes('spin')
  );
  const referralBonus = (user.referralCount || 0) * 100;

  // ─── Sidebar Nav ─────────────────────────────────────────────────
  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: Zap },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'wallet', label: 'Wallet & Rewards', icon: Wallet },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FCFBF7] py-6 md:py-12 px-3 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

          {/* ── Sidebar Column ── */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Profile Card - Ultra Compact */}
            <div className="bg-charcoal text-white rounded-3xl p-4 relative overflow-hidden shadow-xl border border-white/5">
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/20 border-2 border-gold/30 flex items-center justify-center text-gold shrink-0">
                  <UserIcon size={20} />
                </div>
                <div className="text-left min-w-0">
                  <h1 className="text-sm font-heading font-bold truncate">{user.name}</h1>
                  <p className="text-white/40 text-[9px] truncate">{user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
                <div className="bg-white/5 p-2 rounded-xl text-center">
                  <p className="text-xs font-black text-gold">₹{walletBalance.toLocaleString()}</p>
                  <p className="text-[7px] text-white/30 uppercase tracking-widest font-black">Balance</p>
                </div>
                <div className="bg-white/5 p-2 rounded-xl text-center">
                  <p className="text-xs font-black text-gold">{user.referralCount || 0}</p>
                  <p className="text-[7px] text-white/30 uppercase tracking-widest font-black">Invites</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs - More Compact */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); if (tab.id === 'notifications') markNotificationsRead(); }}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all font-bold text-[9px] uppercase tracking-wider ${activeTab === tab.id
                    ? 'bg-gold text-white shadow-lg'
                    : 'bg-white text-charcoal hover:bg-gray-50 border border-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon size={12} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.badge ? (
                    <span className="bg-red-500 text-white text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-black">
                      {tab.badge}
                    </span>
                  ) : <ChevronRight size={8} className="opacity-30" />}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="col-span-2 lg:col-span-1 flex items-center gap-2 p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all font-bold text-[9px] uppercase tracking-wider border border-red-100"
              >
                <LogOut size={12} />
                Sign Out
              </button>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="lg:col-span-9 space-y-8">

            {/* ─── OVERVIEW TAB ─── */}
            {activeTab === 'overview' && (
              <div className="space-y-10">
                {/* Refer & Earn */}
                <ReferAndEarn />

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-2">
                  {[
                    { icon: Package, label: 'Orders', desc: 'Track items', onClick: () => navigate('/orders') },
                    { icon: Heart, label: 'Wishlist', desc: 'Saved', onClick: () => navigate('/wishlist') },
                    { icon: Gift, label: 'Spin & Win', desc: 'Daily', onClick: () => window.dispatchEvent(new CustomEvent('open-lucky-wheel')) },
                    { icon: Settings, label: 'Settings', desc: 'Info', onClick: () => { setActiveTab('profile'); handleEditStart(); } },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={item.onClick}
                      className="bg-white rounded-xl p-3 border border-gray-100 hover:border-gold/30 hover:shadow-md transition-all text-left group"
                    >
                      <item.icon size={16} className="text-gray-300 group-hover:text-gold transition-colors mb-1.5" />
                      <p className="font-bold text-[10px] text-charcoal uppercase tracking-wider">{item.label}</p>
                      <p className="text-[8px] text-gray-400 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── PROFILE TAB ─── */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-heading font-bold text-charcoal">Personal Information</h3>
                  {!isEditing ? (
                    <button
                      onClick={handleEditStart}
                      className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white rounded-full text-sm font-bold hover:bg-gold transition-all"
                    >
                      <Edit3 size={15} /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-charcoal rounded-full text-sm font-bold hover:bg-gray-200 transition-all"
                      >
                        <X size={14} /> Cancel
                      </button>
                      <button
                        onClick={handleEditSave}
                        className="flex items-center gap-2 px-5 py-2 bg-gold text-white rounded-full text-sm font-bold hover:bg-charcoal transition-all"
                      >
                        <Save size={14} /> Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Full Name', key: 'name', icon: UserIcon, value: user.name, type: 'text' },
                    { label: 'Email Address', key: 'email', icon: Mail, value: user.email, type: 'email' },
                    { label: 'Phone Number', key: 'phone', icon: Phone, value: user.phone, type: 'tel' },
                    { label: 'Street Address', key: 'streetAddress', icon: MapPin, value: user.streetAddress || user.address || '', type: 'text' },
                    { label: 'City', key: 'city', icon: MapPin, value: user.city || '', type: 'text' },
                    { label: 'PIN Code', key: 'pincode', icon: MapPin, value: user.pincode || '', type: 'text' },
                  ].map(field => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">{field.label}</label>
                      {isEditing ? (
                        <div className="flex items-center gap-3 p-4 bg-[#FCFBF7] border-2 border-gold/30 rounded-2xl focus-within:border-gold transition-colors">
                          <field.icon size={18} className="text-gold shrink-0" />
                          <input
                            type={field.type}
                            value={editForm[field.key as keyof typeof editForm]}
                            onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            className="flex-1 bg-transparent outline-none text-sm font-bold text-charcoal placeholder:text-gray-300"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-[#FCFBF7] rounded-2xl border border-gray-100">
                          <field.icon size={18} className="text-gold/50 shrink-0" />
                          <span className={`text-xs font-bold ${field.value ? 'text-charcoal' : 'text-gray-300 italic'}`}>
                            {field.value || `Not set — click Edit to add`}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Referral Code Block */}
                <div className="mt-8 p-6 bg-gradient-to-r from-gold/10 to-amber-50 rounded-3xl border border-gold/20">
                  <p className="text-[10px] uppercase tracking-widest text-gold font-black mb-2">Your Referral Code</p>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-charcoal tracking-widest">{user.referralCode}</span>
                    <button
                      onClick={copyReferral}
                      className="flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-xl font-bold text-xs hover:bg-charcoal transition-all"
                    >
                      {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Share this code to earn ₹100 per successful referral</p>
                </div>
              </div>
            )}

            {/* ─── NOTIFICATIONS TAB ─── */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-heading font-bold text-charcoal">Notifications</h3>
                  <Bell className="text-gold/30" size={28} />
                </div>

                <div className="space-y-4">
                  {(user.notifications || []).length > 0 ? (
                    [...(user.notifications || [])].reverse().map(notif => {
                      // Helper to render message with clickable links
                      const renderMessage = (text: string) => {
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        const parts = text.split(urlRegex);
                        
                        return parts.map((part, i) => {
                          if (part.match(urlRegex)) {
                            return (
                              <a 
                                key={i} 
                                href={part} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gold hover:underline break-all font-bold"
                              >
                                {part}
                              </a>
                            );
                          }
                          return part;
                        });
                      };

                      return (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-5 p-5 rounded-2xl border transition-all ${notif.isRead
                            ? 'bg-gray-50/50 border-gray-100'
                            : 'bg-white border-gold/30 shadow-lg shadow-gold/5'
                            }`}
                        >
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${notif.type === 'offer' ? 'bg-orange-50 text-orange-500' :
                              notif.type === 'order' ? 'bg-blue-50 text-blue-500' : 'bg-gold/10 text-gold'
                            }`}>
                            {notif.type === 'offer' ? <Tag size={18} /> :
                              notif.type === 'order' ? <ShoppingBag size={18} /> : <Info size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className={`font-bold text-sm ${notif.isRead ? 'text-charcoal/70' : 'text-charcoal'}`}>{notif.title}</h4>
                              {!notif.isRead && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0 animate-pulse" />}
                            </div>
                            <div className={`text-xs mt-1 leading-relaxed ${notif.isRead ? 'text-gray-500' : 'text-charcoal/80 font-medium'}`}>
                              {renderMessage(notif.message)}
                            </div>
                            <p className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${notif.isRead ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Calendar size={10} />
                              {new Date(notif.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 space-y-4">
                      <Bell size={48} className="mx-auto text-gray-200" />
                      <p className="font-bold text-sm tracking-widest uppercase text-gray-400">No alerts at the moment</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── WALLET TAB ─── */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { label: 'Wallet Balance', value: `₹${walletBalance.toLocaleString()}`, icon: Wallet, color: 'from-gold to-amber-500', sub: 'Available to use' },
                    { label: 'Referral Earnings', value: `₹${referralBonus.toLocaleString()}`, icon: TrendingUp, color: 'from-green-400 to-emerald-500', sub: `${user.referralCount || 0} successful referrals` },
                  ].map((card, i) => (
                    <div key={i} className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-6 shadow-xl`}>
                      <card.icon size={20} className="mb-3 opacity-80" />
                      <p className="text-2xl font-black">{card.value}</p>
                      <p className="text-[9px] uppercase tracking-widest font-bold mt-1 opacity-70">{card.label}</p>
                      <p className="text-[10px] opacity-50 mt-1">{card.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-heading font-bold text-charcoal mb-6">Transaction History</h3>
                  <div className="space-y-3">
                    {/* Referral bonus if any */}
                    {(user.referralCount || 0) > 0 && (
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                            <TrendingUp size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-charcoal">Referral Bonus</p>
                            <p className="text-xs text-gray-400">{user.referralCount} friend{(user.referralCount || 0) > 1 ? 's' : ''} joined using your code</p>
                          </div>
                        </div>
                        <span className="font-black text-green-600 text-lg">+₹{referralBonus.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Spin winnings */}
                    {walletTransactions.length > 0 ? walletTransactions.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center text-white">
                            <Gift size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-charcoal">{t.title}</p>
                            <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>
                        <span className="font-black text-orange-500 text-lg">
                          +₹{t.message?.match(/₹(\d+)/)?.[1] || '0'}
                        </span>
                      </div>
                    )) : null}

                    {/* Welcome bonus */}
                    <div className="flex items-center justify-between p-4 bg-gold/5 rounded-2xl border border-gold/10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-white">
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-charcoal">Welcome Bonus</p>
                          <p className="text-xs text-gray-400">Joined Arham Elite on {new Date(joinedDate).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                      <span className="font-black text-gold text-lg">+₹{(user as any).referredBy ? '100' : '0'}</span>
                    </div>

                    {walletTransactions.length === 0 && (user.referralCount || 0) === 0 && (
                      <div className="text-center py-8 text-gray-300">
                        <Wallet size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">No transactions yet</p>
                        <p className="text-xs mt-1">Spin the wheel or refer friends to earn rewards!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
