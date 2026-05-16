import React from 'react';
import { Wallet, Check, Sparkles } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/whatsapp';

const WalletRedemption: React.FC = () => {
  const { user, isLoggedIn } = useUser();
  const { walletRedemption, toggleWalletRedemption } = useCart();

  if (!isLoggedIn || !user || user.walletBalance <= 0) return null;

  return (
    <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 space-y-6 overflow-hidden relative group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold shadow-inner">
            <Wallet size={24} />
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold text-charcoal">Wallet Redemption</h3>
            <p className="text-gray-400 text-xs font-medium mt-0.5">Use your earned rewards for this purchase</p>
          </div>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={walletRedemption.isRedeemed}
            onChange={toggleWalletRedemption}
          />
          <div className="w-14 h-8 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gold shadow-inner"></div>
        </label>
      </div>

      <div className="bg-[#FCFBF7] rounded-[1.5rem] p-6 border border-gray-50 flex items-center justify-between relative z-10 overflow-hidden">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available Balance</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-charcoal tracking-tight">{formatPrice(user.walletBalance)}</p>
            <span className="text-[9px] text-gold font-bold uppercase tracking-widest bg-gold/5 px-2 py-0.5 rounded-full">Max ₹1,000 per order</span>
          </div>
        </div>
        
        {walletRedemption.isRedeemed ? (
          <div className="bg-green-50 text-green-600 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-100 animate-in zoom-in duration-300">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Applied to Order</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gold animate-pulse">
            <Sparkles size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Extra Savings Available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletRedemption;
