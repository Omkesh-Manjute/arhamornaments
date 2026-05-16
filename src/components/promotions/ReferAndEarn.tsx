import React, { useState, useEffect } from 'react';
import { Copy, Share2, Users, Gift, TrendingUp, CheckCircle2, Wallet, BadgeCheck, Crown, ExternalLink, UserCheck, Sparkles, Tag, ShieldCheck, History } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { userService } from '../../services/userService';
import { User } from '../../types';

const ReferAndEarn: React.FC = () => {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [referredUsers, setReferredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadReferredUsers();
    }
  }, [user?.id]);

  const loadReferredUsers = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await userService.getReferredUsers(user.id);
      setReferredUsers(data);
    } catch (err) {
      console.error("Failed to load referred users:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="relative z-10 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full text-gold text-xs font-black uppercase tracking-widest mb-2">
              <Sparkles size={14} />
              Elite Referral Program
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-charcoal leading-tight">
              Share the Radiance, <br /><span className="text-gold italic">Earn Together</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-lg mx-auto font-medium leading-relaxed">
              Invite your inner circle to Arham Ornaments. When they join, <span className="text-charcoal font-bold">you both receive ₹100</span> bonus instantly. Plus, all new members get a <span className="text-gold font-bold">one-time exclusive welcome spin</span> to win up to ₹500!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Referral Code Card */}
            <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gold">
                  <Tag size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Your Private Code</p>
                  <p className="text-xs font-bold text-charcoal mt-1">Ready for distribution</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 bg-white px-6 py-4 rounded-2xl font-mono text-xl font-black text-charcoal tracking-[0.3em] border-2 border-dashed border-gold/30 flex items-center justify-center shadow-inner">
                  {user.referralCode}
                </div>
                <button 
                  onClick={copyCode}
                  className="bg-charcoal text-white px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center hover:bg-gold shadow-lg shadow-charcoal/10"
                >
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            {/* Share Card */}
            <div className="bg-gradient-to-br from-gold to-amber-600 rounded-[2rem] p-8 text-white space-y-6 shadow-xl shadow-gold/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center">
                  <Share2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none">Instant Sharing</p>
                  <p className="text-xs font-bold mt-1">Spread the invitation</p>
                </div>
              </div>

              <button 
                onClick={shareCode}
                className="w-full bg-white text-charcoal font-black py-5 px-8 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 text-sm uppercase tracking-widest hover:bg-charcoal hover:text-white"
              >
                <ExternalLink size={20} /> Invite Friends
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { val: user.referralCount || 0, label: 'Total Invites', icon: Users, color: 'text-blue-500' },
              { val: `₹${(user.referralCount || 0) * 100}`, label: 'Total Winnings', icon: Wallet, color: 'text-emerald-500' },
              { val: 'Elite', label: 'Program Tier', icon: Crown, color: 'text-gold' },
              { val: 'Active', label: 'Invite Status', icon: BadgeCheck, color: 'text-gold' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center space-y-2 hover:shadow-lg transition-all group">
                <div className={`p-3 bg-gray-50 rounded-2xl group-hover:bg-white transition-colors ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div className="text-xl font-black text-charcoal tracking-tight">{stat.val}</div>
                <div className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-black">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Referral List - New Section */}
          {(referredUsers.length > 0 || isLoading) && (
            <div className="pt-10 border-t border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center text-gold">
                    <UserCheck size={18} />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-charcoal">Successful Referrals</h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                  {referredUsers.length} Accomplices
                </span>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {referredUsers.map((refUser) => (
                    <div key={refUser.id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gold shadow-sm font-black text-xs">
                        {refUser.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-charcoal truncate">{refUser.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                          Joined {new Date(refUser.joinedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-emerald-500">+₹100</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Rules & Guidelines Section */}
        <div className="max-w-4xl mx-auto mt-24">
          <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
            
            <div className="relative z-10 space-y-12">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-gold font-black uppercase tracking-[0.3em] text-[10px] mb-2">
                  <ShieldCheck size={14} />
                  Program Governance
                </div>
                <h2 className="text-3xl font-heading font-bold text-charcoal">Terms & Guidelines</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100/50 hover:border-gold/30 transition-all">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gold shadow-sm">
                    <History size={20} />
                  </div>
                  <h4 className="font-bold text-charcoal">Monthly Invite Limit</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    To maintain program integrity, rewards are credited for up to <span className="text-charcoal font-bold">10 successful referrals per month</span>. Resets on the 1st of every month.
                  </p>
                </div>

                <div className="space-y-4 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100/50 hover:border-gold/30 transition-all">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                    <Wallet size={20} />
                  </div>
                  <h4 className="font-bold text-charcoal">Redemption Cap</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Wallet rewards can be used for any luxury purchase. You can redeem up to <span className="text-charcoal font-bold">₹1,000 per order</span> for maximum savings.
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                  Referral bonuses are credited instantly after your friend's verified signup. <br />
                  Management reserves the right to audit or adjust balances for fraudulent activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferAndEarn;
