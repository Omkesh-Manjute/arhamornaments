import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Check, MapPin, User, Gift, Sparkles, ShieldCheck, ChevronLeft, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { formatPrice, generateCartOrderMessage, openWhatsApp } from '../utils/whatsapp';

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  notes: string;
}

const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart, giftOptions } = useCart();
  const { user, addNotification } = useUser();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Calculate Grand Total including Gift Surcharges
  const giftSurcharge = giftOptions.wrapType === 'luxury' ? 500 : 0;
  const shippingCost = totalPrice >= 50000 ? 0 : 500;
  const grandTotal = totalPrice + shippingCost + giftSurcharge;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit number';
    }
    if (!formData.address.trim()) newErrors.address = 'Delivery address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);

    // Generate WhatsApp message with Gift Options
    const fullAddress = `${formData.address}, ${formData.city} - ${formData.pincode}`;
    let message = generateCartOrderMessage(items, {
      name: formData.name,
      phone: formData.phone,
      address: fullAddress
    });

    // Add Gift Personalization to Message
    if (giftOptions.isGift) {
      message += `\n\n🎁 *GIFT PERSONALIZATION*`;
      message += `\nPackaging: ${giftOptions.wrapType === 'luxury' ? 'Premium Luxury Wrap (+₹500)' : 'Standard Gift Wrap'}`;
      if (giftOptions.message) message += `\nMessage: "${giftOptions.message}"`;
      if (giftOptions.videoMessageUrl) message += `\nVideo Message QR: ${giftOptions.videoMessageUrl}`;
    }

    message += `\n\n💰 *FINAL TOTAL:* ${formatPrice(grandTotal)}`;

    // Add notes if any
    const finalMessage = formData.notes 
      ? message + `\n\n📝 *Additional Notes:*\n${formData.notes}`
      : message;

    // Open WhatsApp
    openWhatsApp(finalMessage);

    // Show success state
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderPlaced(true);
      if (user) {
        addNotification({
          title: 'Order Inquiry Received',
          message: `Your inquiry for items worth ${formatPrice(grandTotal)} has been received. Our team will contact you soon.`,
          type: 'order'
        });
      }
    }, 1500);
  };

  if (items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center px-4">
        <div className="text-center max-w-xl bg-white p-16 rounded-[4rem] shadow-2xl border border-gray-100 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gold" />
          <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto text-gold animate-bounce">
            <Check size={48} strokeWidth={3} />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-heading font-bold text-charcoal">The Inquiry is Sent</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Your request for these exquisite pieces has been dispatched to our concierge team. We will contact you shortly to finalize the bespoke delivery and payment details.
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-3xl space-y-3">
            <div className="flex items-center justify-center gap-2 text-gold font-black uppercase tracking-widest text-[10px]">
              <Sparkles size={14} />
              White-Glove Service Activated
            </div>
            <p className="text-xs text-gray-400">Reference: ARH-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => {
                clearCart();
                navigate('/');
              }}
              className="py-5 bg-charcoal text-white rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-xl"
            >
              Continue Exploring
            </button>
            <a
              href="https://wa.me/919371504182"
              target="_blank"
              rel="noopener noreferrer"
              className="py-5 bg-gold text-white rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-amber-600 transition-all shadow-xl inline-flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              Concierge Chat
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* Progress Navigation */}
        <div className="mb-12 flex items-center justify-between">
          <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-gray-400 hover:text-charcoal transition font-bold text-sm">
            <ChevronLeft size={20} />
            Back to Treasury
          </button>
          <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-300">
            <span>Authentication</span>
            <div className="w-8 h-px bg-gray-200" />
            <span>Shipping</span>
            <div className="w-8 h-px bg-gray-200" />
            <span className="text-gold">Review</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-10">
            <header className="space-y-2">
              <h1 className="text-5xl font-heading font-bold text-charcoal tracking-tight">Checkout</h1>
              <p className="text-gray-400 font-medium">Finalize your luxury selection and shipping details.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Contact Section */}
              <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                    <User size={24} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-charcoal">Delivery Dossier</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-4">Legal Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Omkesh Manjute"
                      className={`w-full px-6 py-4 bg-gray-50 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all font-bold text-charcoal ${
                        errors.name ? 'border-red-400' : 'border-gray-100 hover:border-gold/30'
                      }`}
                    />
                    {errors.name && <p className="text-red-400 text-[10px] font-bold uppercase ml-4">{errors.name}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-4">Secure Mobile</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 00000 00000"
                      className={`w-full px-6 py-4 bg-gray-50 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all font-bold text-charcoal ${
                        errors.phone ? 'border-red-400' : 'border-gray-100 hover:border-gold/30'
                      }`}
                    />
                    {errors.phone && <p className="text-red-400 text-[10px] font-bold uppercase ml-4">{errors.phone}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-4">Email Address (Optional)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="luxury@arham.com"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all font-bold text-charcoal hover:border-gold/30"
                    />
                  </div>
                </div>
              </section>

              {/* Address Section */}
              <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                    <MapPin size={24} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-charcoal">Shipping Destination</h3>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-4">Street Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Full residential address for white-glove delivery..."
                      className={`w-full px-6 py-4 bg-gray-50 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all font-bold text-charcoal resize-none ${
                        errors.address ? 'border-red-400' : 'border-gray-100 hover:border-gold/30'
                      }`}
                    />
                    {errors.address && <p className="text-red-400 text-[10px] font-bold uppercase ml-4">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-4">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full px-6 py-4 bg-gray-50 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all font-bold text-charcoal ${
                          errors.city ? 'border-red-400' : 'border-gray-100 hover:border-gold/30'
                        }`}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black ml-4">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className={`w-full px-6 py-4 bg-gray-50 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all font-bold text-charcoal ${
                          errors.pincode ? 'border-red-400' : 'border-gray-100 hover:border-gold/30'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Special Instructions */}
              <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-6">
                <h3 className="text-xl font-heading font-bold text-charcoal ml-4">Bespoke Requests</h3>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any special size requirements, engraving details, or delivery instructions..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-gold/20 font-medium text-charcoal resize-none hover:border-gold/30 transition-all"
                />
              </section>

              {/* Security Badge */}
              <div className="flex items-center gap-3 justify-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <ShieldCheck size={16} className="text-gold" />
                End-to-End Encrypted Secure Checkout
              </div>
            </form>
          </div>

          {/* Summary Side */}
          <div className="lg:col-span-5">
            <div className="bg-charcoal text-white rounded-[3.5rem] p-10 sticky top-24 shadow-2xl overflow-hidden">
              {/* Gold Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold opacity-10 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="relative z-10 space-y-10">
                <h3 className="text-2xl font-heading font-bold">Investment Summary</h3>

                {/* Item List */}
                <div className="space-y-6 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 group">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-bold truncate">{item.product.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase font-black tracking-widest">
                          <span>Qty: {item.quantity}</span>
                          <span className="w-1 h-1 bg-white/10 rounded-full" />
                          <span>{item.selectedPurity}</span>
                        </div>
                        <p className="text-gold font-bold text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gift Personalization Summary */}
                {giftOptions.isGift && (
                  <div className="pt-8 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Gift className="text-gold" size={18} />
                      <p className="text-xs font-black uppercase tracking-widest text-gold">Gift Personalization</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/10 space-y-2">
                      <p className="text-xs font-bold">
                        {giftOptions.wrapType === 'luxury' ? 'Premium Heritage Wrap' : 'Signature Arham Wrap'}
                      </p>
                      {giftOptions.message && (
                        <p className="text-[10px] text-white/40 leading-relaxed italic">"{giftOptions.message}"</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Financials */}
                <div className="pt-8 border-t border-white/5 space-y-4 font-medium">
                  <div className="flex justify-between text-white/60 text-sm">
                    <span>Treasury Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  {giftSurcharge > 0 && (
                    <div className="flex justify-between text-white/60 text-sm">
                      <span>Heritage Wrap</span>
                      <span>{formatPrice(giftSurcharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/60 text-sm">
                    <span>Delivery</span>
                    <span>{shippingCost === 0 ? <span className="text-gold uppercase text-[10px] font-black">Complimentary</span> : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-white/10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">Final Investment</p>
                      <h4 className="text-4xl font-bold">{formatPrice(grandTotal)}</h4>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-6 bg-gold text-white rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-amber-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-gold/20 disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : (
                      <>
                        <MessageCircle size={20} />
                        Inquire via WhatsApp
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-2 justify-center py-2 px-4 bg-white/5 rounded-2xl border border-white/5">
                    <CreditCard size={14} className="text-white/40" />
                    <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">
                      Alternate Payment Methods Available in Chat
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-white/30 text-center leading-relaxed font-bold uppercase tracking-widest px-4">
                  By inquiring, you agree to Arham's exclusive Terms of Heritage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
