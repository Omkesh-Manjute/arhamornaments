import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle, ArrowLeft, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { formatPrice, generateCartOrderMessage, openWhatsApp } from '../utils/whatsapp';
import GiftPersonalization from '../components/GiftPersonalization';
import WalletRedemption from '../components/WalletRedemption';
import { couponService } from '../services/couponService';
import { Coupon } from '../types';
import { Ticket, X } from 'lucide-react';

const CartPage: React.FC = () => {
  const { items = [], removeFromCart, updateQuantity, giftOptions, clearCart, walletRedemption = { isRedeemed: false }, appliedCoupon, applyCoupon } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [availableCoupons, setAvailableCoupons] = React.useState<Coupon[]>([]);

  React.useEffect(() => {
    couponService.getAllCoupons().then(coupons => {
      setAvailableCoupons(coupons.filter(c => c.isActive));
    });
  }, []);

  // Filter out any invalid items to prevent crashes
  const validItems = items.filter(item => item && item.product);

  const handleWhatsAppOrder = () => {
    const message = generateCartOrderMessage(items);
    openWhatsApp(message);
  };

  if (validItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative">
            <ShoppingBag size={48} className="text-gold" />
            <div className="absolute top-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce">
              <span className="text-xs">?</span>
            </div>
          </div>
          <h2 className="text-3xl font-heading font-bold text-charcoal mb-4">Your Treasury is Empty</h2>
          <p className="text-gray-400 font-medium mb-10 leading-relaxed">
            Beautiful pieces are waiting for you. Let's find something that speaks to your soul.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-4 px-10 py-5 bg-charcoal text-white rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gold transition-all shadow-2xl active:scale-95"
          >
            Explore Collections <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = validItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shippingCost = 0; // Removed shipping charges as requested
  const giftCharge = giftOptions.isGift && giftOptions.wrapType === 'luxury' ? 499 : 0;

  const availableWalletBalance = user?.walletBalance || 0;
  const redeemedAmount = walletRedemption.isRedeemed ? Math.min(subtotal + giftCharge, availableWalletBalance) : 0;

  const subtotalForDiscount = subtotal + giftCharge;
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? (subtotalForDiscount * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;

  const grandTotal = Math.max(0, subtotal + shippingCost + giftCharge - redeemedAmount - couponDiscount);

  return (
    <div className="min-h-screen bg-[#FCFBF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] font-black text-gray-400 mb-2">
            <Link to="/" className="hover:text-gold">Home</Link>
            <span className="text-gray-200">/</span>
            <span className="text-gold">My Treasury</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-heading font-bold text-charcoal">My Shopping Treasury</h1>
              <p className="text-gray-400 font-medium text-xs mt-0.5">{validItems.length} exquisite items reserved</p>
            </div>
            <button
              onClick={clearCart}
              className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
            >
              Empty Treasury
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            <div className="space-y-4">
              {validItems.map((item) => (
                <div key={item.product?.id || Math.random().toString()} className="bg-white rounded-3xl shadow-sm p-4 border border-gray-50 group hover:shadow-lg transition-all duration-500">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Image */}
                    <div className="flex gap-4 sm:block">
                      <Link to={`/product/${item.product?.id}`} className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-500">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product?.name || 'Product'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.onerror = null;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.style.background = 'linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 100%)';
                                parent.style.display = 'flex';
                                parent.style.alignItems = 'center';
                                parent.style.justifyContent = 'center';
                                parent.innerHTML += '<span style="font-size:2rem">💍</span>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 100%)'}}>
                            <span style={{fontSize: '2rem'}}>💍</span>
                          </div>
                        )}
                      </Link>

                      {/* Mobile Title Area (Shown only on mobile to save space) */}
                      <div className="sm:hidden flex-1 py-1">
                        <Link
                          to={`/product/${item.product?.id}`}
                          className="text-base font-bold text-charcoal hover:text-gold transition-colors line-clamp-2"
                        >
                          {item.product?.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-gold bg-gold/5 px-1.5 py-0.5 rounded">
                            {item.product?.material}
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                            {item.product?.category}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product?.id)}
                        className="sm:hidden w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-all self-start"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      {/* Desktop Title & Delete */}
                      <div className="hidden sm:flex justify-between items-start">
                        <div>
                          <Link
                            to={`/product/${item.product?.id}`}
                            className="text-lg font-bold text-charcoal hover:text-gold transition-colors block leading-tight"
                          >
                            {item.product?.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gold bg-gold/5 px-2 py-0.5 rounded">
                              {item.product?.material}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                              {item.product?.category}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product?.id)}
                          className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2 sm:mt-3">
                        {/* Quantity */}
                        <div className="flex items-center bg-gray-50 rounded-full px-1 py-0.5 sm:px-1.5 sm:py-0.5 scale-90 sm:scale-95 origin-left border border-gray-100">
                          <button
                            onClick={() => updateQuantity(item.product?.id, item.quantity - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-white rounded-full transition-all text-charcoal"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 sm:w-8 text-center font-bold text-charcoal text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product?.id, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-white rounded-full transition-all text-charcoal"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-base sm:text-lg font-black text-charcoal tracking-tight">
                            {formatPrice((item.product?.price || 0) * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                              {formatPrice(item.product?.price || 0)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <GiftPersonalization />
            <WalletRedemption />

            {/* Promo Codes Preview */}
            {!appliedCoupon && availableCoupons.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                      <Ticket size={20} />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-charcoal">Available Offers</h3>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {availableCoupons.map(coupon => (
                    <div
                      key={coupon.id}
                      className="flex-shrink-0 w-64 p-5 bg-gray-50 border border-gray-100 rounded-[2rem] relative group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-black text-charcoal tracking-widest uppercase">{coupon.code}</span>
                        <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Save {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : formatPrice(coupon.discountValue)}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-wider mb-4">
                        Valid on orders above {formatPrice(coupon.minOrderAmount)}
                      </p>
                      <button
                        onClick={() => navigate('/checkout')}
                        className="text-[9px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 flex items-center gap-2 group"
                      >
                        Apply at checkout <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {appliedCoupon && (
              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Ticket size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-900 tracking-widest uppercase">Coupon Applied!</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">
                      Code {appliedCoupon.code} saved you {formatPrice(couponDiscount)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => applyCoupon(null)}
                  className="p-2 hover:bg-emerald-100 rounded-xl text-emerald-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-charcoal hover:text-gold transition-colors"
            >
              <ArrowLeft size={16} /> Continue Exploring
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-[#1A1A1A] text-white rounded-[2rem] p-6 sticky top-24 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative border border-white/5">
              {/* Luxury Accent Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gold opacity-5 rounded-full -ml-20 -mb-20 blur-[80px]"></div>

              <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Sparkles size={16} className="text-gold" />
                </div>
                Treasury Summary
              </h3>

              <div className="space-y-4 pb-4 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Merchandise Total</span>
                  <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
                </div>

                {walletRedemption.isRedeemed && redeemedAmount > 0 && (
                  <div className="flex justify-between items-center text-green-400 animate-in fade-in slide-in-from-right-4 duration-300">
                    <span className="text-green-400/70 text-[9px] font-black uppercase tracking-[0.2em]">Wallet Savings</span>
                    <span className="font-bold text-sm">-{formatPrice(redeemedAmount)}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="flex justify-between items-center text-amber-400 animate-in fade-in slide-in-from-right-4 duration-300">
                    <span className="text-amber-400/70 text-[9px] font-black uppercase tracking-[0.2em]">Coupon Discount</span>
                    <span className="font-bold text-sm">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                {giftOptions.isGift && (
                  <div className="flex justify-between items-center animate-in fade-in zoom-in duration-300">
                    <span className="text-white/50 text-[9px] font-black uppercase tracking-[0.2em]">Gift Services</span>
                    <span className="font-bold text-sm">
                      {giftCharge === 0 ? <span className="text-gold uppercase text-[9px] tracking-widest">Complimentary</span> : formatPrice(giftCharge)}
                    </span>
                  </div>
                )}
              </div>

              <div className="py-6">
                <div className="flex justify-between items-end mb-1">
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">Total Value</span>
                    <span className="text-[9px] text-gold/50 font-bold mt-0.5 uppercase tracking-widest">VAT & GST Inclusive</span>
                  </div>
                  <span className="text-3xl font-black text-white tracking-tighter">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-gold text-white rounded-xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white hover:text-charcoal transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 group"
                >
                  Secure Checkout 
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-4 border-2 border-white/10 text-white rounded-xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white/5 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <MessageCircle size={16} className="text-gold" />
                  Concierge Service
                </button>
              </div>

              {/* Security Badges */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { icon: ShieldCheck, label: 'Protected' },
                  { icon: Truck, label: 'Tracked' },
                  { icon: Sparkles, label: 'Certified' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                      <item.icon size={14} className="text-gold/50" />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-30 text-center">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
