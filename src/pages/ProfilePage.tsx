import React from 'react';
import { useUser } from '../context/UserContext';
import { User, Mail, Phone, Wallet, Package, Heart, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite p-4">
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

  return (
    <div className="min-h-screen bg-offwhite py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-charcoal" />
            <div className="relative pt-12">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden mx-auto bg-gold/20 flex items-center justify-center text-charcoal">
                <User size={64} />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-heading font-bold text-charcoal">{user.name}</h2>
              <p className="text-gold font-medium uppercase tracking-widest text-xs">Premium Member</p>
            </div>
            
            <div className="pt-6 border-t border-gray-50 space-y-4">
              <div className="flex items-center gap-4 text-left p-4 bg-offwhite rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gold shadow-sm">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Wallet Balance</p>
                  <p className="font-bold text-charcoal text-lg">₹{user.walletBalance.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <nav className="flex flex-col gap-2 pt-4">
              {[
                { icon: Package, label: 'My Orders', path: '/orders' },
                { icon: Heart, label: 'Wishlist', path: '/wishlist' },
                { icon: Settings, label: 'Settings', path: '/settings' },
              ].map((item, i) => (
                <button 
                  key={i}
                  onClick={() => navigate(item.path)}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-offwhite transition text-gray-600 hover:text-charcoal group"
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={20} className="group-hover:text-gold transition" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition font-medium mt-4"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Right Column: Profile Details & Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-heading font-bold text-charcoal mb-8">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Full Name</label>
                <div className="flex items-center gap-3 p-4 bg-offwhite rounded-2xl border border-gray-50 text-charcoal font-medium">
                  <User size={18} className="text-gold" />
                  <span>{user.name}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Email Address</label>
                <div className="flex items-center gap-3 p-4 bg-offwhite rounded-2xl border border-gray-50 text-charcoal font-medium">
                  <Mail size={18} className="text-gold" />
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Phone Number</label>
                <div className="flex items-center gap-3 p-4 bg-offwhite rounded-2xl border border-gray-50 text-charcoal font-medium">
                  <Phone size={18} className="text-gold" />
                  <span>{user.phone}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Default Address</label>
                <div className="p-4 bg-offwhite rounded-2xl border border-gray-50 text-gray-400 text-sm italic">
                  No address added yet.
                </div>
              </div>
            </div>
            <button className="mt-12 bg-charcoal text-white px-8 py-4 rounded-full font-bold hover:bg-black transition shadow-lg">
              Update Profile
            </button>
          </div>

          {/* Recent Activity / Order Summary */}
          <div className="bg-charcoal text-white rounded-[3rem] p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-heading font-bold">Exclusive Benefits</h3>
                <div className="px-4 py-1 bg-gold text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Member Since 2024
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <p className="text-3xl font-heading font-bold text-gold">04</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Total Orders</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-heading font-bold text-gold">₹1.2L</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Lifetime Spend</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-heading font-bold text-gold">Gold</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Membership Tier</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
