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
    <div className="max-w-4xl mx-auto px-2 py-2">
      <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-4 md:p-6 shadow-xl border border-white/20 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-orange-100 rounded-full blur-2xl opacity-40"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-yellow-100 rounded-full blur-2xl opacity-40"></div>

        <div className="relative z-10 text-center space-y-2">
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Refer & Earn
            </h1>
            <p className="text-gray-600 text-[9px] font-medium">
              Both get <span className="font-bold text-orange-600">₹100</span>!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-white rounded-xl p-3 border border-orange-50 text-left">
              <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Code</span>
              <div className="flex gap-1.5">
                <div className="flex-1 bg-gray-50 px-2 py-1 rounded-lg font-mono text-xs font-bold text-gray-800 tracking-wider border border-dashed border-orange-200 flex items-center justify-center">
                  {user.referralCode}
                </div>
                <button 
                  onClick={copyCode}
                  className="bg-orange-600 hover:bg-orange-700 text-white p-1.5 rounded-lg transition-colors active:scale-95"
                >
                  {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 border border-orange-50 text-left">
              <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Share</span>
              <button 
                onClick={shareCode}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 text-[9px]"
              >
                <Share2 size={12} /> Link
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mt-2">
            <div className="py-2 bg-orange-50/50 rounded-lg text-center">
              <div className="text-[11px] font-black text-gray-800">{user.referralCount || 0}</div>
              <div className="text-[7px] text-gray-500 uppercase tracking-widest font-bold">Friends</div>
            </div>
            <div className="py-2 bg-green-50/50 rounded-lg text-center">
              <div className="text-[11px] font-black text-gray-800">₹{(user.referralCount || 0) * 100}</div>
              <div className="text-[7px] text-gray-500 uppercase tracking-widest font-bold">Earned</div>
            </div>
            <div className="py-2 bg-blue-50/50 rounded-lg text-center">
              <div className="text-[11px] font-black text-blue-600">Active</div>
              <div className="text-[7px] text-gray-500 uppercase tracking-widest font-bold">Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferAndEarn;
