import React, { useState } from 'react';
import { Copy, Share2, Users, Gift, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

const ReferAndEarn: React.FC = () => {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Arham Ornaments Referral',
        text: `Join Arham Ornaments using my code ${user.referralCode} and get ₹100 welcome bonus!`,
        url: window.location.origin
      });
    }
  };

  return (
    <div className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-sm border border-gray-100 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
      
      <div className="relative z-10 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gold">
              <Users size={28} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Referral Program</span>
            </div>
            <h3 className="text-4xl font-heading font-bold text-charcoal">Invite & Earn Rewards</h3>
            <p className="text-gray-400 text-sm max-w-lg">
              Share the elegance of Arham with your inner circle. For every friend who signs up, 
              both of you receive exclusive wallet credits.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="text-center px-8 py-6 bg-[#FCFBF7] rounded-[2.5rem] border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Earned</p>
              <p className="text-2xl font-black text-charcoal">₹{(user.referralCount * 100).toLocaleString()}</p>
            </div>
            <div className="text-center px-8 py-6 bg-[#FCFBF7] rounded-[2.5rem] border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Referrals</p>
              <p className="text-2xl font-black text-gold">{user.referralCount}</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Your Unique Code</label>
              <div className="flex items-center gap-2 p-2 bg-[#FCFBF7] rounded-full border-2 border-dashed border-gold/30">
                <div className="flex-1 px-8 py-4 bg-white rounded-full font-black text-2xl tracking-[0.2em] text-charcoal text-center">
                  {user.referralCode}
                </div>
                <button 
                  onClick={copyCode}
                  className="p-5 bg-charcoal text-white rounded-full hover:bg-gold transition-all active:scale-95 shadow-xl"
                >
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
                <button 
                  onClick={shareCode}
                  className="p-5 bg-gold/10 text-gold rounded-full hover:bg-gold/20 transition-all active:scale-95"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                    <Gift size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-green-800">Signup Bonus</p>
                    <p className="text-[10px] text-green-600">Your friend gets ₹100 instantly on signup.</p>
                  </div>
               </div>
               <div className="flex-1 flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-800">Order Reward</p>
                    <p className="text-[10px] text-blue-600">You get ₹250 when they place their first order.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferAndEarn;
