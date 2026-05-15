import React from 'react';
import { Gift, Sparkles, Video, MessageSquare, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/whatsapp';

const GiftPersonalization: React.FC = () => {
  const { giftOptions, updateGiftOptions } = useCart();

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gold/10 text-gold rounded-2xl flex items-center justify-center">
          <Gift size={24} />
        </div>
        <div>
          <h3 className="text-xl font-heading font-bold text-charcoal">Gift Personalization</h3>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Make your surprise unforgettable</p>
        </div>
        <div className="ml-auto">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={giftOptions.isGift}
              onChange={(e) => updateGiftOptions({ isGift: e.target.checked })}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
          </label>
        </div>
      </div>

      {giftOptions.isGift && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Wrap Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => updateGiftOptions({ wrapType: 'standard' })}
              className={`p-6 rounded-3xl border-2 text-left transition-all relative ${
                giftOptions.wrapType === 'standard' 
                  ? 'border-charcoal bg-charcoal text-white shadow-xl scale-[1.02]' 
                  : 'border-gray-100 hover:border-gray-200 text-charcoal'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Essential</span>
                {giftOptions.wrapType === 'standard' && <Check size={16} />}
              </div>
              <h4 className="text-lg font-bold mt-2">Standard Wrap</h4>
              <p className="text-xs opacity-70 mt-1">Premium Arham branded box with ribbon.</p>
              <p className="text-sm font-bold mt-4">FREE</p>
            </button>

            <button
              onClick={() => updateGiftOptions({ wrapType: 'luxury' })}
              className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden ${
                giftOptions.wrapType === 'luxury' 
                  ? 'border-gold bg-gold text-white shadow-xl scale-[1.02]' 
                  : 'border-gray-100 hover:border-gray-200 text-charcoal'
              }`}
            >
              <div className="absolute top-0 right-0 p-2">
                <Sparkles size={40} className="opacity-20 -mr-4 -mt-4" />
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Elite Choice</span>
                {giftOptions.wrapType === 'luxury' && <Check size={16} />}
              </div>
              <h4 className="text-lg font-bold mt-2">Luxury Concierge</h4>
              <p className="text-xs opacity-70 mt-1">Velvet box, hand-pressed seal, and floral scent.</p>
              <p className="text-sm font-bold mt-4">{formatPrice(499)}</p>
            </button>
          </div>

          {/* Message */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-gold" />
              <label className="text-[10px] font-black uppercase tracking-widest text-charcoal">Handwritten Note Message</label>
            </div>
            <textarea
              value={giftOptions.message}
              onChange={(e) => updateGiftOptions({ message: e.target.value })}
              placeholder="Write a beautiful message for your loved one..."
              className="w-full h-32 bg-gray-50 border-none rounded-[2rem] p-6 text-sm focus:ring-2 focus:ring-gold/20 transition-all resize-none"
            />
          </div>

          {/* Video Message */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Video size={16} className="text-gold" />
              <label className="text-[10px] font-black uppercase tracking-widest text-charcoal">Video Message (QR Code)</label>
              <span className="text-[9px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">PREMIUM</span>
            </div>
            <div className="relative">
              <input
                type="url"
                value={giftOptions.videoMessageUrl}
                onChange={(e) => updateGiftOptions({ videoMessageUrl: e.target.value })}
                placeholder="Paste your video link (Drive, YouTube, etc.)"
                className="w-full bg-gray-50 border-none rounded-full px-8 py-4 text-sm focus:ring-2 focus:ring-gold/20 transition-all"
              />
              <p className="text-[9px] text-gray-400 mt-2 px-2">We will print a custom QR code on the gift card that leads directly to your video.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftPersonalization;
