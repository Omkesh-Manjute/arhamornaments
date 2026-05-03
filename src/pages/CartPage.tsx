import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle, ArrowLeft, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, generateCartOrderMessage, openWhatsApp } from '../utils/whatsapp';
import GiftPersonalization from '../components/GiftPersonalization';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, giftOptions, clearCart } = useCart();
  const navigate = useNavigate();

  const handleWhatsAppOrder = () => {
    const message = generateCartOrderMessage(items);
    openWhatsApp(message);
  };

  if (items.length === 0) {
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

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = subtotal >= 50000 ? 0 : 500;
  const giftCharge = giftOptions.isGift && giftOptions.wrapType === 'luxury' ? 499 : 0;
  const grandTotal = subtotal + shippingCost + giftCharge;

  return (
    <div className="min-h-screen bg-[#FCFBF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-4">
            <Link to="/" className="hover:text-gold">Home</Link>
            <span className="text-gray-200">/</span>
            <span className="text-gold">My Treasury</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-heading font-bold text-charcoal">My Shopping Treasury</h1>
              <p className="text-gray-400 font-medium mt-1">{items.length} exquisite items reserved</p>
            </div>
            <button
              onClick={clearCart}
              className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
            >
              Empty Treasury
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="bg-white rounded-[2rem] shadow-sm p-6 border border-gray-50 group hover:shadow-xl transition-all duration-500">
                  <div className="flex gap-8">
                    {/* Image */}
                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link 
                            to={`/product/${item.product.id}`}
                            className="text-xl font-bold text-charcoal hover:text-gold transition-colors block"
                          >
                            {item.product.name}
                          </Link>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gold bg-gold/5 px-2 py-1 rounded">
                              {item.product.material}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              {item.product.category}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        {/* Quantity */}
                        <div className="flex items-center bg-gray-50 rounded-full px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all text-charcoal"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-bold text-charcoal">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all text-charcoal"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-2xl font-black text-charcoal">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                              {formatPrice(item.product.price)} each
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

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-charcoal hover:text-gold transition-colors"
            >
              <ArrowLeft size={16} /> Continue Exploring
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-charcoal text-white rounded-[3rem] p-10 sticky top-24 shadow-2xl overflow-hidden relative">
              {/* Luxury Accent */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gold opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              
              <h3 className="text-2xl font-heading font-bold mb-8 flex items-center gap-3">
                <Sparkles size={24} className="text-gold" />
                Treasury Summary
              </h3>

              <div className="space-y-6 pb-8 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Merchandise</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Concierge & Ship</span>
                  <span className="font-bold">
                    {shippingCost === 0 ? <span className="text-gold">Complimentary</span> : formatPrice(shippingCost)}
                  </span>
                </div>

                {giftOptions.isGift && (
                  <div className="flex justify-between items-center animate-in fade-in zoom-in duration-300">
                    <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Gift Services</span>
                    <span className="font-bold">
                      {giftCharge === 0 ? <span className="text-gold">Complimentary</span> : formatPrice(giftCharge)}
                    </span>
                  </div>
                )}
                
                {shippingCost > 0 && (
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] text-gold font-black uppercase tracking-widest leading-relaxed">
                      Complimentary white-glove delivery on orders above {formatPrice(50000)}. 
                      <Link to="/products" className="underline ml-1">Add {formatPrice(50000 - subtotal)} more</Link>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between py-10">
                <div className="flex flex-col">
                  <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Total Value</span>
                  <span className="text-[10px] text-gold/60 font-bold mt-1 uppercase tracking-tighter">VAT & GST Inclusive</span>
                </div>
                <span className="text-4xl font-black text-white">{formatPrice(grandTotal)}</span>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-6 bg-gold text-white rounded-full font-black uppercase tracking-[0.3em] text-[11px] hover:bg-white hover:text-charcoal transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4"
                >
                  Secure Checkout <ArrowRight size={18} />
                </button>
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-6 border-2 border-white/20 text-white rounded-full font-black uppercase tracking-[0.3em] text-[11px] hover:bg-white/5 transition-all flex items-center justify-center gap-4 active:scale-95"
                >
                  <MessageCircle size={18} />
                  Concierge via WhatsApp
                </button>
              </div>

              {/* Security Badges */}
              <div className="mt-10 grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <ShieldCheck size={20} className="text-gold/50" />
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-40 text-center">Protected</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Truck size={20} className="text-gold/50" />
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-40 text-center">Tracked</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Sparkles size={20} className="text-gold/50" />
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-40 text-center">Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
