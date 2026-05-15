import React, { useState } from 'react';
import { Copy, Share2, Users, Gift, TrendingUp, CheckCircle2, Wallet, BadgeCheck, Crown } from 'lucide-react';
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
    const referralUrl = `${window.location.origin}?ref=${user.referralCode}`;
    const shareText = `Join Arham Ornaments using my code ${user.referralCode} and get ₹100 welcome bonus! ✨\n\nShop elegant jewelry here:`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Arham Ornaments Referral',
        text: shareText,
        url: referralUrl
      }).catch(err => {
        // Fallback to WhatsApp if share fails or is cancelled
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + referralUrl)}`;
        window.open(whatsappUrl, '_blank');
      });
    } else {
      // Fallback for browsers/WebViews that don't support navigator.share
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + referralUrl)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-1 py-1">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-3 shadow-xl border border-white/20 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-24 h-24 bg-orange-100 rounded-full blur-2xl opacity-40"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-24 h-24 bg-yellow-100 rounded-full blur-2xl opacity-40"></div>

        <div className="relative z-10 text-center space-y-1.5">
          <div className="space-y-0">
            <h1 className="text-sm font-black bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent uppercase tracking-tight">
              Refer & Earn
            </h1>
            <p className="text-gray-500 text-[8px] font-bold uppercase tracking-widest">
              Both get <span className="text-orange-600">₹100</span> Reward
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-1">
            <div className="bg-white rounded-xl p-2 border border-orange-50 text-left">
              <span className="text-[6px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Your Code</span>
              <div className="flex gap-1">
                <div className="flex-1 bg-gray-50 px-1.5 py-1 rounded-lg font-mono text-[10px] font-black text-charcoal tracking-widest border border-dashed border-orange-200 flex items-center justify-center">
                  {user.referralCode}
                </div>
                <button 
                  onClick={copyCode}
                  className="bg-orange-600 hover:bg-orange-700 text-white p-1 rounded-lg transition-colors active:scale-95 flex items-center justify-center"
                >
                  {copied ? <CheckCircle2 size={10} /> : <Copy size={10} />}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-2 border border-orange-50 text-left">
              <span className="text-[6px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Spread Joy</span>
              <button 
                onClick={shareCode}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-black py-1.5 px-2 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 active:scale-95 text-[9px] uppercase tracking-wider"
              >
                <Share2 size={10} /> Share
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 mt-1">
            {[
              { val: user.referralCount || 0, label: 'Friends' },
              { val: `₹${(user.referralCount || 0) * 100}`, label: 'Earned' },
              { val: 'Active', label: 'Status' }
            ].map((stat, i) => (
              <div key={i} className="py-1 bg-gray-50/50 rounded-lg text-center border border-gray-100">
                <div className="text-[10px] font-black text-charcoal leading-none">{stat.val}</div>
                <div className="text-[6px] text-gray-400 uppercase tracking-widest font-black mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferAndEarn;
