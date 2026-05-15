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
    <div className="max-w-4xl mx-auto px-4 py-4">
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 md:p-10 shadow-2xl border border-white/20 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10 text-center space-y-6">
          <div className="inline-flex p-3 bg-orange-100 rounded-xl mb-2">
            <Gift className="w-8 h-8 text-orange-600 animate-bounce" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Refer & Earn Rewards
            </h1>
            <p className="text-gray-600 text-sm max-w-xl mx-auto">
              Share the elegance of Arham Ornaments with your friends. Both of you will receive 
              <span className="font-bold text-orange-600 mx-1">₹100</span> when they join!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Your Referral Code</span>
                <Crown className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 p-3 rounded-lg font-mono text-xl font-bold text-gray-800 tracking-widest border-2 border-dashed border-orange-200 flex items-center justify-center">
                  {user.referralCode}
                </div>
                <button 
                  onClick={copyCode}
                  className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg transition-colors shadow-lg shadow-orange-200 active:scale-95"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Sharing is Caring</span>
                <Share2 className="w-5 h-5 text-orange-500" />
              </div>
              <button 
                onClick={shareCode}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-bold py-3.5 px-6 rounded-lg shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
              >
                <Share2 className="w-5 h-5" />
                Share Link
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-orange-50 rounded-xl text-center border border-orange-100">
              <Users className="w-6 h-6 text-orange-600 mx-auto mb-1.5" />
              <div className="text-xl font-bold text-gray-800">{user.referralCount || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Friends Joined</div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center border border-green-100">
              <Wallet className="w-6 h-6 text-green-600 mx-auto mb-1.5" />
              <div className="text-xl font-bold text-gray-800">₹{(user.referralCount || 0) * 100}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Earned</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
              <BadgeCheck className="w-6 h-6 text-blue-600 mx-auto mb-1.5" />
              <div className="text-xl font-bold text-gray-800 text-xs">Active</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Status</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 font-heading">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">1</div>
            <div>
              <h3 className="font-bold text-gray-800 text-xs">Share Code</h3>
              <p className="text-gray-600 text-[10px]">Send your code to friends.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">2</div>
            <div>
              <h3 className="font-bold text-gray-800 text-xs">They Sign Up</h3>
              <p className="text-gray-600 text-[10px]">They get ₹100 bonus.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">3</div>
            <div>
              <h3 className="font-bold text-gray-800 text-xs">Get Rewarded</h3>
              <p className="text-gray-600 text-[10px]">You get ₹100 too!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferAndEarn;
