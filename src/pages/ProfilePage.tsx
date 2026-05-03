import React from 'react';
import { useUser } from '../context/UserContext';
import { User, Mail, Phone, Wallet, Package, Heart, Settings, LogOut, ChevronRight, Award, Crown, Zap, Sparkles, Gem, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7] p-4">
        <div className="text-center space-y-6 max-w-md w-full bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto text-gold">
            <User size={40} />
          </div>
          <h2 className="text-3xl font-heading font-bold text-charcoal">Access Denied</h2>
          <p className="text-gray-500">Please sign in to view your profile and manage your orders.</p>
          <button 
            onClick={() => navigate('/admin')}
            className="w-full bg-charcoal text-white py-4 rounded-full font-bold hover:bg-black transition shadow-lg"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tiers = {
    silver: { name: 'Silver', icon: Award, color: 'text-gray-400', bg: 'bg-gray-100', next: 'Gold', pointsNeeded: 5000 },
    gold: { name: 'Gold', icon: Crown, color: 'text-gold', bg: 'bg-gold/10', next: 'Platinum', pointsNeeded: 15000 },
    platinum: { name: 'Platinum', icon: Gem, color: 'text-blue-400', bg: 'bg-blue-50', next: 'Max Tier', pointsNeeded: 0 },
  };

  const currentTier = tiers[user.tier || 'silver'];
  const userPoints = user.points || 0;
  const progress = currentTier.pointsNeeded > 0 
    ? Math.min((userPoints / currentTier.pointsNeeded) * 100, 100)
    : 100;
  const joinedDate = user.joinedDate || new Date().toISOString();

  return (
    <div className="min-h-screen bg-[#FCFBF7] py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 text-center space-y-6 relative overflow-hidden group">
            {/* Animated Background Element */}
            <div className="absolute top-0 left-0 w-full h-40 bg-charcoal group-hover:h-44 transition-all duration-700" />
            <div className="absolute top-40 right-0 w-32 h-32 bg-gold opacity-5 rounded-full blur-3xl" />
            
            <div className="relative pt-12">
              <div className="w-40 h-40 rounded-full border-8 border-white overflow-hidden mx-auto bg-white shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                <div className="w-full h-full bg-gold/5 flex items-center justify-center text-charcoal">
                  <User size={80} />
                </div>
                <button className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-xs uppercase tracking-widest">
                  Edit Photo
                </button>
              </div>
              <div className="absolute bottom-2 right-1/2 translate-x-1/2 translate-y-1/2 bg-gold text-white p-2 rounded-full shadow-xl border-4 border-white">
                <currentTier.icon size={20} />
              </div>
            </div>

            <div className="space-y-1 pt-4">
              <h2 className="text-3xl font-heading font-bold text-charcoal">{user.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <p className={`${currentTier.color} font-black uppercase tracking-[0.3em] text-[10px]`}>
                  Arham Elite {currentTier.name} Member
                </p>
                <div className="w-1 h-1 bg-gray-200 rounded-full" />
                <p className="text-gray-400 font-bold text-[10px]">Since {new Date(joinedDate).getFullYear()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
              <div className="text-left p-4 bg-gray-50 rounded-2xl">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-black mb-1">Vault Balance</p>
                <p className="font-black text-charcoal text-lg">₹{user.walletBalance.toLocaleString()}</p>
              </div>
              <div className="text-left p-4 bg-gray-50 rounded-2xl">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-black mb-1">Elite Points</p>
                <p className="font-black text-gold text-lg">{userPoints.toLocaleString()}</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2 pt-4">
              {[
                { icon: Package, label: 'Order History', path: '/orders' },
                { icon: Heart, label: 'Wishlist Gallery', path: '/wishlist' },
                { icon: Clock, label: 'Recent Views', path: '/recent' },
                { icon: Settings, label: 'Account Security', path: '/settings' },
              ].map((item, i) => (
                <button 
                  key={i}
                  onClick={() => navigate(item.path)}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all text-charcoal group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-300 group-hover:text-gold transition-colors">
                      <item.icon size={18} />
                    </div>
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all font-black uppercase tracking-[0.2em] text-[10px] mt-4"
              >
                <LogOut size={16} />
                <span>End Session</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Right Column: Loyalty & Info */}
        <div className="lg:col-span-8 space-y-12">
          {/* Arham Elite Hub */}
          <div className="bg-charcoal text-white rounded-[3.5rem] p-10 md:p-14 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold opacity-10 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-3xl -ml-32 -mb-32" />
            
            <div className="relative z-10 space-y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Crown className="text-gold" size={32} />
                    <h3 className="text-4xl font-heading font-bold tracking-tight">Arham Elite Hub</h3>
                  </div>
                  <p className="text-white/50 text-sm font-medium">Your journey towards luxury excellence</p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[2rem] border border-white/10">
                  <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center shadow-lg shadow-gold/20">
                    <Zap size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gold">Elite Status</p>
                    <p className="font-bold text-xl">{currentTier.name}</p>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              {user.tier !== 'platinum' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Tier Progress</p>
                      <h4 className="text-xl font-bold">Road to {currentTier.next} Status</h4>
                    </div>
                    <p className="text-gold font-black text-sm">
                      {userPoints.toLocaleString()} <span className="text-white/30 text-xs">/ {currentTier.pointsNeeded.toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-gold via-amber-400 to-gold rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-white/40 text-xs italic">
                    Earn {Math.max(0, currentTier.pointsNeeded - userPoints).toLocaleString()} more points to unlock {currentTier.next} benefits.
                  </p>
                </div>
              )}

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                {[
                  { icon: Zap, label: 'Early Access', desc: 'New arrivals 24h early' },
                  { icon: Sparkles, label: 'Free Polishing', desc: 'Lifetime spa service' },
                  { icon: Crown, label: 'Personal Concierge', desc: 'Dedicated jewelry expert' },
                  { icon: Gem, label: 'Private Preview', desc: 'In-home viewing service' },
                ].map((benefit, i) => (
                  <div key={i} className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all group">
                    <benefit.icon className="text-gold mb-4 group-hover:scale-110 transition-transform" size={24} />
                    <h5 className="font-bold text-sm mb-1">{benefit.label}</h5>
                    <p className="text-[10px] text-white/40 leading-relaxed">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Personal Info Dashboard */}
          <div className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-sm border border-gray-100">
            <h3 className="text-3xl font-heading font-bold text-charcoal mb-10">Account Dossier</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Full Name</label>
                <div className="flex items-center gap-4 p-5 bg-[#FCFBF7] rounded-3xl border border-gray-100 text-charcoal font-bold group hover:border-gold transition-colors">
                  <User size={20} className="text-gold/40 group-hover:text-gold" />
                  <span>{user.name}</span>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Email Address</label>
                <div className="flex items-center gap-4 p-5 bg-[#FCFBF7] rounded-3xl border border-gray-100 text-charcoal font-bold group hover:border-gold transition-colors">
                  <Mail size={20} className="text-gold/40 group-hover:text-gold" />
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Phone Number</label>
                <div className="flex items-center gap-4 p-5 bg-[#FCFBF7] rounded-3xl border border-gray-100 text-charcoal font-bold group hover:border-gold transition-colors">
                  <Phone size={20} className="text-gold/40 group-hover:text-gold" />
                  <span>{user.phone}</span>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Registered Address</label>
                <div className="p-5 bg-[#FCFBF7] rounded-3xl border border-gray-100 text-gray-400 text-sm font-medium italic">
                  Complete your dossier to enable white-glove delivery.
                </div>
              </div>
            </div>
            
            <div className="mt-14 flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-charcoal text-white px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gold transition-all shadow-xl active:scale-95">
                Modify Dossier
              </button>
              <button className="flex-1 border-2 border-charcoal text-charcoal px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-charcoal hover:text-white transition-all active:scale-95">
                Download Data
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
